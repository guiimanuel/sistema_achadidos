const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const parser = require('@babel/parser');

function setup({ error, galleryError, denied = false, canceled = false, origem = 'CadastrarItem', launch } = {}) {
  const source = fs.readFileSync('src/screens/EscolherImagemScreen.js', 'utf8');
  const ast = parser.parse(source, { sourceType: 'module', plugins: ['jsx'] });
  const screen = ast.program.body.find(node => node.type === 'FunctionDeclaration' && node.id.name === 'EscolherImagem');
  const handler = screen.body.body.find(node => node.type === 'FunctionDeclaration' && node.id.name === 'selecionarImagem');
  const utility = fs.readFileSync('src/utils/camera.js', 'utf8').replace('export function', 'function');
  const calls = [], alerts = [], images = [];
  const mounted = { current: true };
  const lock = { current: false };
  const permission = async () => ({ granted: !denied, canAskAgain: !denied });
  const run = vm.runInNewContext(`${utility}\n${source.slice(handler.start, handler.end)}\nselecionarImagem;`, {
    mounted, abrindoSeletor: lock, setProcessando: value => calls.push(['busy', value]), origem,
    IMAGE_PICKER_OPTIONS: { mediaTypes: ['images'] },
    ImagePicker: {
      getCameraPermissionsAsync: permission, getMediaLibraryPermissionsAsync: permission,
      requestCameraPermissionsAsync: permission, requestMediaLibraryPermissionsAsync: permission,
      launchCameraAsync: async () => {
        calls.push(['camera']);
        if (launch) return await launch();
        if (error) throw error;
        return { canceled, assets: [{ uri: 'file:///foto.jpg' }] };
      },
      launchImageLibraryAsync: async () => {
        calls.push(['gallery']);
        if (galleryError) throw galleryError;
        return { canceled, assets: [{ uri: 'file:///foto.jpg' }] };
      },
    },
    Alert: { alert: (...args) => alerts.push(args) }, Linking: { openSettings: async () => {} },
    navigation: { navigate: (...args) => calls.push(['navigate', ...args]) },
    retornarImagem: async image => images.push(image),
  });
  return { run, calls, alerts, images, lock, mounted };
}

test('missing Android camera activity opens the built-in camera for the original editing form', async () => {
  const h = setup({ error: new Error("Failed to resolve activity to handle the intent of type 'null'"), origem: 'EditarItem' });
  await assert.doesNotReject(h.run(true));
  const navigation = h.calls.find(call => call[0] === 'navigate');
  assert.equal(navigation[1], 'CameraItem');
  assert.equal(navigation[2].origem, 'EditarItem');
  assert.equal(h.alerts.length, 0);
  assert.equal(h.lock.current, false);
});

test('gallery failure is handled without an unhandled promise rejection', async () => {
  const h = setup({ galleryError: new Error('Native gallery failure') });
  await assert.doesNotReject(h.run(false));
  assert.equal(h.alerts[0][0], 'Galeria indisponível');
  assert.equal(h.lock.current, false);
});

test('denied permission cannot be bypassed through the camera fallback', async () => {
  const h = setup({ denied: true });
  await h.run(true);
  assert.equal(h.alerts[0][0], 'Permissão necessária');
  assert.equal(h.calls.filter(call => call[0] === 'camera' || call[0] === 'navigate').length, 0);
});

test('canceling the picker preserves the form without selecting an image', async () => {
  const h = setup({ canceled: true });
  await h.run(true);
  assert.equal(h.images.length, 0);
  assert.equal(h.alerts.length, 0);
  assert.equal(h.lock.current, false);
});

test('rapid duplicate taps cannot open two native camera activities', async () => {
  let resolve;
  const pending = new Promise(done => { resolve = done; });
  const h = setup({ launch: () => pending });
  const first = h.run(true);
  await h.run(true);
  resolve({ canceled: true });
  await first;
  assert.equal(h.calls.filter(call => call[0] === 'camera').length, 1);
});

test('leaving the screen while the camera fails does not reopen it through fallback', async () => {
  let reject;
  const pending = new Promise((_, fail) => { reject = fail; });
  const h = setup({ launch: () => pending });
  const task = h.run(true);
  await new Promise(setImmediate);
  h.mounted.current = false;
  reject(new Error('Failed to resolve activity to handle the intent'));
  await assert.doesNotReject(task);
  assert.equal(h.calls.filter(call => call[0] === 'navigate').length, 0);
  assert.equal(h.alerts.length, 0);
});
