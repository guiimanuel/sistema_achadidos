const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const babel = require('@babel/core');

function setup({ cancelled = false, verified = true } = {}) {
  const requests = [];
  const { code } = babel.transformSync(fs.readFileSync('src/services/googleWeb.web.js', 'utf8'), {
    babelrc: false, configFile: false, plugins: ['@babel/plugin-transform-modules-commonjs'],
  });
  const module = { exports: {} };
  vm.runInNewContext(code, {
    module, exports: module.exports,
    require: () => ({ entrarComAcessoGoogle: async (token, email, options) => { requests.push({ token, email, options }); return { user: { email } }; } }),
    fetch: async () => ({ ok: true, json: async () => ({ email: 'student@discente.ifpe.edu.br', email_verified: verified }) }),
    window: { google: { accounts: { oauth2: { initTokenClient: (options) => ({ requestAccessToken: () => {
      if (cancelled) options.error_callback({ type: 'popup_closed' });
      else void options.callback({ access_token: 'google-access-token' });
    } }) } } } },
  });
  return { api: module.exports, requests };
}
test('web gets verified Google identity before invoking the restricted Firebase signup', async () => {
  const h = setup();
  await h.api.prepararGoogleWeb();
  const credential = await h.api.entrarGoogleWeb('client-id', { cadastro: true });
  assert.equal(credential.user.email, 'student@discente.ifpe.edu.br');
  assert.equal(h.requests[0].options.cadastro, true);
  assert.equal(h.requests[0].token, 'google-access-token');
});
test('web cancellation and unverified identity never reach Firebase signup', async () => {
  const cancelled = setup({ cancelled: true });
  assert.equal(await cancelled.api.entrarGoogleWeb('client-id', {}), null);
  assert.equal(cancelled.requests.length, 0);
  const unverified = setup({ verified: false });
  await assert.rejects(unverified.api.entrarGoogleWeb('client-id', {}), /verificado/);
  assert.equal(unverified.requests.length, 0);
});
