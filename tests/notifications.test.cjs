const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const babel = require('@babel/core');

function setup({ denied = false, platform = 'android', environment = 'standalone' } = {}) {
  let value = null;
  let offline = false;
  let token = 'ExpoPushToken[first]';
  let permission = denied ? 'denied' : 'undetermined';
  const calls = [];
  const requests = [];
  const listeners = {};
  const mocks = {
    'expo-notifications': {
      AndroidImportance: { HIGH: 4 }, IosAuthorizationStatus: { PROVISIONAL: 3 },
      setNotificationChannelAsync: async () => { calls.push('channel'); },
      getPermissionsAsync: async () => ({ status: permission, granted: permission === 'granted', canAskAgain: true }),
      requestPermissionsAsync: async () => { calls.push('permission'); permission = 'granted'; return { granted: true }; },
      getExpoPushTokenAsync: async () => { calls.push('token'); return { data: token }; },
      setNotificationHandler: (handler) => { listeners.handler = handler; },
      addPushTokenListener: (fn) => { listeners.token = fn; return { remove() {} }; },
    },
    'expo-device': { isDevice: true },
    'expo-constants': { executionEnvironment: environment, expoConfig: { extra: { eas: { projectId: 'project' } } } },
    '@react-native-async-storage/async-storage': {
      getItem: async () => value,
      setItem: async (_, next) => { value = next; },
    },
    'react-native': {
      Platform: { OS: platform },
      AppState: { currentState: 'active', addEventListener: (_, fn) => { listeners.app = fn; return { remove() {} }; } },
    },
    'expo/fetch': { fetch: async (_, options) => {
      const body = JSON.parse(options.body);
      calls.push(body);
      requests.push({ body, headers: options.headers });
      if (offline) throw new Error('offline');
      if (body.action === 'register') assert.equal(JSON.parse(value).device.session, body.session);
      return { ok: true, json: async () => body.action === 'session' ? { session: `cap-${calls.length}` } : { ok: true } };
    } },
    'firebase/auth': { signOut: async () => { calls.push('logout'); } },
    '../lib/firebase.js': { auth: {} },
  };
  function load(path) {
    const source = fs.readFileSync(path, 'utf8');
    const { code } = babel.transformSync(source, { babelrc: false, configFile: false, plugins: ['@babel/plugin-transform-modules-commonjs'] });
    const module = { exports: {} };
    vm.runInNewContext(code, {
      module, exports: module.exports, require: (name) => {
        if (name === 'expo-notifications' && (platform === 'web' || environment === 'storeClient')) {
          throw new Error('Push module loaded in an unsupported runtime');
        }
        return mocks[name];
      },
      process: { env: {} }, AbortController, setTimeout, clearTimeout,
      setInterval: (fn) => { listeners.retry = fn; return 1; }, clearInterval() {},
      console: { warn() {} },
    });
    return module.exports;
  }
  return {
    api: load('src/services/notifications.js'), logout: () => load('src/services/auth.js').sair(), calls, requests, listeners,
    state: () => JSON.parse(value || '{}'),
    offline: (next) => { offline = next; },
    token: (next) => { token = next; },
    permission: (next) => { permission = next; },
  };
}
const settle = async () => { for (let n = 0; n < 15; n++) await new Promise(setImmediate); };
const user = (uid = 'alice') => ({ uid, emailVerified: true, getIdToken: async () => `firebase-${uid}` });

test('first launch registers a guest installation; Android channel precedes permission', async () => {
  const h = setup();
  const stop = h.api.acompanharNotificacoes();
  await settle();
  assert(h.calls.indexOf('channel') < h.calls.indexOf('permission'));
  assert.equal(h.calls.filter((call) => call.action === 'register').length, 1);
  assert.equal(h.state().device.uid, undefined);
  assert.equal(h.requests.find((request) => request.body.action === 'register').headers.Authorization, undefined);
  assert.equal((await h.listeners.handler.handleNotification()).shouldShowBanner, true);
  h.listeners.app('active');
  await settle();
  assert.equal(h.calls.filter((call) => call === 'permission').length, 1);
  stop();
});
test('denied permission does not prompt repeatedly or register; settings enable is recovered', async () => {
  const h = setup({ denied: true });
  const stop = h.api.acompanharNotificacoes(user());
  await settle();
  assert(!h.calls.includes('permission'));
  assert(!h.calls.some((call) => call.action === 'register'));
  h.permission('granted'); h.listeners.app('active'); await settle();
  assert(h.calls.some((call) => call.action === 'register'));
  stop();
});
test('offline permission revocation persists capability, then flushes without a Firebase JWT', async () => {
  const h = setup();
  const stop = h.api.acompanharNotificacoes(user()); await settle();
  const session = h.state().device.session;
  h.offline(true);
  h.permission('denied');
  await h.api.desativarNotificacoes();
  assert.deepEqual(h.state().pending, [session]);
  assert.equal(h.state().device, undefined);
  stop(); h.offline(false);
  const stopGuest = h.api.acompanharNotificacoes(null); await settle();
  assert.deepEqual(h.state().pending, []);
  stopGuest();
});
test('logout and subsequent app launch preserve the subscribed installation', async () => {
  const h = setup();
  const stop = h.api.acompanharNotificacoes(); await settle();
  const session = h.state().device.session;
  await h.logout();
  assert(h.calls.includes('logout'));
  assert(!h.calls.some((call) => call.action === 'deactivate'));
  assert.equal(h.state().device.session, session);
  stop();
  const stopNext = h.api.acompanharNotificacoes(); await settle();
  assert.equal(h.state().device.session, session);
  assert.equal(h.calls.filter((call) => call.action === 'session').length, 1);
  stopNext();
});
test('token rotation deactivates old registration and persists a new capability', async () => {
  const h = setup();
  const stop = h.api.acompanharNotificacoes(user()); await settle();
  const oldSession = h.state().device.session;
  h.token('ExpoPushToken[second]'); h.listeners.token(); await settle();
  assert.equal(h.state().device.token, 'ExpoPushToken[second]');
  assert.notEqual(h.state().device.session, oldSession);
  assert(h.calls.some((call) => call.action === 'deactivate' && call.session === oldSession));
  stop();
});
test('network errors do not reject publish; retry restores device registration', async () => {
  const h = setup(); h.offline(true);
  const stop = h.api.acompanharNotificacoes(user()); await settle();
  await assert.doesNotReject(h.api.notificarNovaPublicacao('item', user()));
  h.offline(false); h.listeners.retry(); await settle();
  assert(h.calls.some((call) => call.action === 'register'));
  stop();
});
test('web and Expo Go do not call native token APIs', async () => {
  for (const options of [{ platform: 'web' }, { environment: 'storeClient' }]) {
    const h = setup(options); const stop = h.api.acompanharNotificacoes(user()); await settle();
    assert.equal(h.calls.length, 0); stop();
  }
});
test('unmount racing with registration cancels activation', async () => {
  const h = setup(); const stop = h.api.acompanharNotificacoes();
  stop(); await settle();
  assert.equal(h.state().device, undefined);
  assert(!h.calls.some((call) => call.action === 'register'));
});

test('contact push authenticates sender and account changes rebind the installation', async () => {
  const h = setup();
  const stopAlice = h.api.acompanharNotificacoes(user('alice')); await settle();
  assert.equal(h.requests.find((r) => r.body.action === 'register').headers.Authorization, 'Bearer firebase-alice');
  await h.api.notificarContato('item', user('bob'), 'item');
  const contact = h.requests.find((r) => r.body.action === 'contact');
  assert.equal(contact.headers.Authorization, 'Bearer firebase-bob');
  assert.equal(contact.body.collection, 'item');
  assert.equal(contact.body.recipient, undefined);
  stopAlice();
  const stopGuest = h.api.acompanharNotificacoes(null); await settle();
  assert.equal(h.requests.filter((r) => r.body.action === 'register').at(-1).headers.Authorization, undefined);
  stopGuest();
});

test('guest contact reuses a signed capability without login or native push support', async () => {
  const h = setup({ environment: 'storeClient' });
  await h.api.notificarContato('item', null);
  await h.api.notificarContato('item-2', null);
  assert.equal(h.calls.filter((call) => call.action === 'session').length, 1);
  const contacts = h.requests.filter((request) => request.body.action === 'contact');
  assert.equal(contacts.length, 2);
  assert.equal(contacts[0].body.session, contacts[1].body.session);
  assert.equal(contacts[0].body.session, h.state().contactSession);
  assert.equal(contacts[0].headers.Authorization, undefined);
  assert(!h.calls.includes('token'));
});
