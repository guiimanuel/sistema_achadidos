const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const babel = require('@babel/core');

function setup() {
  const module = { exports: {} };
  const { code } = babel.transformSync(fs.readFileSync('src/services/alerts.js', 'utf8'), {
    babelrc: false, configFile: false, plugins: ['@babel/plugin-transform-modules-commonjs'],
  });
  vm.runInNewContext(code, { module, exports: module.exports });
  return module.exports;
}

test('quick confirmations have no actions and stale dismissal preserves the next message', () => {
  const h = setup();
  h.AppAlert.toast('Publicado', 'Item cadastrado.');
  const first = h.getCurrentAlert();
  assert.equal(first.presentation, 'toast');
  assert.equal(first.buttons.length, 0);
  h.AppAlert.toast('Salvo', 'Alterações salvas.');
  h.dismissToast(first);
  const next = h.getCurrentAlert();
  h.dismissToast(first);
  assert.equal(h.getCurrentAlert(), next);
  h.dismissToast(next);
  assert.equal(h.getCurrentAlert(), null);
});

test('toast dismissal cannot dismiss an important modal or confirm deletion', () => {
  const h = setup();
  let deleted = 0;
  let cancelled = 0;
  h.AppAlert.alert('Excluir?', 'Confirme.', [
    { text: 'Cancelar', style: 'cancel', onPress: () => cancelled++ },
    { text: 'Excluir', style: 'destructive', onPress: () => deleted++ },
  ]);
  const modal = h.getCurrentAlert();
  h.dismissToast(modal);
  assert.equal(h.getCurrentAlert(), modal);
  assert.equal(deleted, 0);
  h.dismissAlert(modal);
  assert.equal(deleted, 0);
  assert.equal(cancelled, 1);
  assert.equal(h.getCurrentAlert(), null);
});

test('only a current modal button runs its callback, exactly once', () => {
  const h = setup();
  let called = 0;
  const button = { text: 'Continuar', onPress: () => called++ };
  h.AppAlert.alert('Aviso', 'Leia antes de continuar.', [button]);
  const alert = h.getCurrentAlert();
  h.pressAlertButton(alert, { text: 'Inventado', onPress: () => called++ });
  assert.equal(called, 0);
  h.pressAlertButton(alert, button);
  h.pressAlertButton(alert, button);
  assert.equal(called, 1);
});

test('subscribers receive queue changes and can unsubscribe', () => {
  const h = setup();
  let changes = 0;
  const unsubscribe = h.subscribeAlerts(() => changes++);
  h.AppAlert.toast('Salvo');
  assert.equal(changes, 1);
  unsubscribe();
  h.dismissToast(h.getCurrentAlert());
  assert.equal(changes, 1);
});
