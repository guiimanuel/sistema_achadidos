const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const babel = require('@babel/core');

function setup() {
  const requests = [];
  const module = { exports: {} };
  const { code } = babel.transformSync(fs.readFileSync('src/services/contato.js', 'utf8'), {
    babelrc: false, configFile: false, plugins: ['@babel/plugin-transform-modules-commonjs'],
  });
  vm.runInNewContext(code, { module, exports: module.exports, fetch: async (_, options) => {
    requests.push(JSON.parse(options.body)); return { ok: true };
  } });
  return { api: module.exports, requests };
}
test('visitors can send their name and reply email without a Firebase account', async () => {
  const h = setup();
  const sender = h.api.resolverRemetenteContato(null, { nome: ' Visitante ', email: ' pessoa@gmail.com ' });
  const response = await h.api.enviarContato({ ...sender, toEmail: 'publisher@example.com', itemTitle: 'Carteira', subject: 'Contato', message: 'Perdi minha carteira.' });
  assert.equal(response.ok, true);
  const params = h.requests[0].template_params;
  assert.equal(params.from_name, 'Visitante');
  assert.equal(params.from_email, 'pessoa@gmail.com');
  assert.equal(params.reply_to, 'pessoa@gmail.com');
  assert.equal(params.message, 'Perdi minha carteira.\n\n---\nNome do remetente: Visitante\nE-mail para resposta: pessoa@gmail.com');
});
test('invalid visitor name and email are rejected before sending', () => {
  const { api } = setup();
  assert.throws(() => api.resolverRemetenteContato(null, { nome: ' ', email: 'email@example.com' }), /nome/);
  assert.throws(() => api.resolverRemetenteContato(null, { nome: 'Visitante', email: 'invalido' }), /e-mail válido/);
});
test('authenticated sender identity comes from the account at send time', () => {
  const { api } = setup();
  const sender = api.resolverRemetenteContato({ displayName: 'Nome cadastrado', email: 'conta@example.com' },
    { nome: 'Outro nome', email: 'outro@example.com' });
  assert.equal(sender.fromName, 'Nome cadastrado');
  assert.equal(sender.fromEmail, 'conta@example.com');
});

test('accounts without a profile name can contact using a typed name and their account email', async () => {
  for (const displayName of [null, '', '   ']) {
    const { api, requests } = setup();
    const user = { displayName, email: 'suporte@example.com' };
    const sender = api.resolverRemetenteContato(user, { nome: ' Suporte ', email: 'outro@example.com' });
    await api.enviarContato({ ...sender, toEmail: 'publicador@example.com', itemTitle: 'Chaves', subject: 'Contato', message: 'Encontrei minhas chaves.' });
    const params = requests[0].template_params;
    assert.equal(params.from_name, 'Suporte');
    assert.equal(params.reply_to, user.email);
    assert(params.message.includes(`E-mail para resposta: ${user.email}`));
    assert(!params.message.includes('outro@example.com'));
    assert.equal(user.displayName, displayName);
    assert.throws(() => api.resolverRemetenteContato(user, { nome: ' ', email: user.email }), /Informe seu nome/);
  }
});
