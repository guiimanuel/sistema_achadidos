const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const constants = fs.readFileSync('src/constants/imagens.js', 'utf8').replace(/export /g, '');
const sizing = fs.readFileSync('src/utils/tamanhoPublicacao.js', 'utf8').replace(/^import .*$/gm, '').replace(/export /g, '');
const api = vm.runInNewContext(`${constants}\n${sizing}\n({ tamanhoUtf8, limiteImagemPublicacao, MAX_DOCUMENT_BYTES, MAX_IMAGE_DATA_URL_LENGTH });`);
const categorias = vm.runInNewContext(fs.readFileSync('src/constants/categorias.js', 'utf8').replace(/export /g, '') + '\n({ CATEGORIAS, normalizarCategoria });');

test('UTF-8 budget counts Portuguese accents and supplementary Unicode characters correctly', () => {
  for (const text of ['Foto do item', 'Descrição de óculos', '📚 Caderno', '👩🏽‍🎓']) {
    assert.equal(api.tamanhoUtf8(text), Buffer.byteLength(text, 'utf8'));
  }
});

test('image allowance leaves room for the complete document, including timestamps and metadata', () => {
  const payload = { titulo: 'Óculos', descricao: 'Encontrado no campus.', filtro: 'Roupas e acessórios', categoria: 'Roupas e acessórios', imageUrl: '', userId: 'usuario', userEmail: 'usuario@discente.ifpe.edu.br', createdAt: {}, updatedAt: {}, status: 'disponivel', expiraEm: null };
  const path = 'itens/abcdefghijklmnopqrst';
  const budget = api.limiteImagemPublicacao(payload, path);
  assert.ok(budget > 1040000 && budget <= api.MAX_IMAGE_DATA_URL_LENGTH);
  const largerText = api.limiteImagemPublicacao({ ...payload, descricao: 'ç'.repeat(10000) }, path);
  assert.equal(budget - largerText, 20000 - Buffer.byteLength(payload.descricao));
  const names = path.split('/').reduce((sum, part) => sum + Buffer.byteLength(part) + 1, 16);
  const total = names + 32 + Object.entries({ ...payload, imageUrl: 'A'.repeat(budget) }).reduce((sum, [key, value]) => {
    return sum + Buffer.byteLength(key) + 1 + (typeof value === 'string' ? Buffer.byteLength(value) + 1 : value === null ? 1 : 8);
  }, 0);
  assert.ok(total <= api.MAX_DOCUMENT_BYTES);
});

test('oversized text is rejected before a document is written', () => {
  assert.throws(() => api.limiteImagemPublicacao({ imageUrl: '', descricao: 'a'.repeat(1048576) }, 'itens/id'), /Reduza o texto/);
});

test('old categories map to the replacement taxonomy without guessing the personal item type', () => {
  assert.equal(categorias.CATEGORIAS.length, 8);
  assert.equal(categorias.normalizarCategoria('Caderno'), 'Material escolar');
  assert.equal(categorias.normalizarCategoria('Celular'), 'Eletrônicos');
  assert.equal(categorias.normalizarCategoria('Garrafa'), 'Garrafas e recipientes');
  assert.equal(categorias.normalizarCategoria('Utensílio pessoal'), 'Outros');
  assert.equal(categorias.normalizarCategoria('Chaves'), 'Chaves');
});
