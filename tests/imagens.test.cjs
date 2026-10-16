const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

function loadProcessor({ width = 4000, height = 3000, encode = () => 900000 } = {}) {
  const images = [];
  const saves = [];
  let size = { width, height };
  const context = {
    released: false,
    reset() { size = { width, height }; },
    resize(target) {
      size = target.width
        ? { width: target.width, height: Math.round(height * target.width / width) }
        : { width: Math.round(width * target.height / height), height: target.height };
    },
    async renderAsync() {
      const image = {
        ...size,
        released: false,
        release() { this.released = true; },
        async saveAsync(options) {
          saves.push({ ...options, width: this.width, height: this.height });
          return { base64: 'A'.repeat(encode(this, options)) };
        },
      };
      images.push(image);
      return image;
    },
    release() { this.released = true; },
  };
  const constants = fs.readFileSync(path.join(__dirname, '../src/constants/imagens.js'), 'utf8').replace(/export /g, '');
  const source = fs.readFileSync(path.join(__dirname, '../src/services/imagens.js'), 'utf8')
    .replace(/^import .*$/gm, '').replace('export async function', 'async function');
  const api = vm.runInNewContext(`${constants}\n${source}\n({ prepararImagem, MAX_IMAGE_DATA_URL_LENGTH });`, {
    ImageManipulator: { manipulate: () => context }, SaveFormat: { JPEG: 'jpeg' },
  });
  return { ...api, context, images, saves };
}

test('large photos preserve proportion and produce high-quality JPEG within the document allowance', async () => {
  const processor = loadProcessor();
  const result = await processor.prepararImagem({ uri: 'file:///foto.png' });
  assert.ok(result.startsWith('data:image/jpeg;base64,'));
  assert.ok(result.length <= processor.MAX_IMAGE_DATA_URL_LENGTH);
  assert.equal(processor.saves[0].width, 4000);
  assert.equal(processor.saves[0].height, 3000);
  assert.equal(processor.saves[0].compress, 1);
  assert.equal(processor.saves[0].format, 'jpeg');
  assert.ok(processor.context.released && processor.images.every(image => image.released));
});

test('oversized photos are resized automatically instead of rejecting the selection', async () => {
  const processor = loadProcessor({ encode: image => image.width > 1600 ? 1200000 : 900000 });
  const result = await processor.prepararImagem({ uri: 'file:///foto.jpg' });
  assert.ok(result.length <= processor.MAX_IMAGE_DATA_URL_LENGTH);
  assert.ok(processor.saves.at(-1).width <= 1600);
  assert.ok(processor.saves.at(-1).width > 1024);
  assert.equal(processor.saves.at(-1).compress, 1);
});

test('small portrait photos retain their dimensions without upscaling', async () => {
  const processor = loadProcessor({ width: 480, height: 640, encode: () => 10000 });
  await processor.prepararImagem({ uri: 'file:///foto.jpg' });
  assert.equal(processor.saves[0].width, 480);
  assert.equal(processor.saves[0].height, 640);
});

test('encoding failures release native image references and allow the screen to recover', async () => {
  const processor = loadProcessor({ encode: () => { throw new Error('Native image error'); } });
  await assert.rejects(processor.prepararImagem({ uri: 'file:///foto.jpg' }), /Native image error/);
  assert.ok(processor.context.released && processor.images.every(image => image.released));
});

test('an image that cannot fit never returns an oversized Firestore value', async () => {
  const processor = loadProcessor({ encode: () => 1200000 });
  await assert.rejects(processor.prepararImagem({ uri: 'file:///foto.jpg' }), /Não foi possível ajustar/);
  assert.ok(processor.context.released && processor.images.every(image => image.released));
});
