const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const babel = require('@babel/core');

function setup({ environment = 'standalone', cancelled = false, platform = 'android', nativeError } = {}) {
  const calls = [];
  const user = { email: 'student@discente.ifpe.edu.br', emailVerified: true };
  class GoogleProvider { setCustomParameters() {} }
  const mocks = {
    'react-native': { Platform: { OS: platform } },
    'expo-constants': { executionEnvironment: environment },
    '../lib/firebase.js': { auth: {} },
    'firebase/auth': { GoogleAuthProvider: GoogleProvider, signInWithPopup: async () => ({ user }) },
    './auth.js': {
      entrarComTokenGoogle: async (token) => { calls.push(token); return { user }; },
      validarSessaoGoogle: async (credential) => { calls.push('validate'); return credential; },
    },
    './googleWeb': {
      prepararGoogleWeb: async () => {},
      entrarGoogleWeb: async () => { calls.push('web-google'); return { user }; },
    },
    'react-native-nitro-google-signin': { GoogleOneTapSignIn: {
      configure: () => calls.push('configure'), checkPlayServices: async () => calls.push('play-services'),
      presentExplicitSignIn: async () => {
        if (nativeError) throw nativeError;
        return { type: cancelled ? 'cancelled' : 'success', data: { idToken: 'google-id-token' } };
      },
    } },
  };
  const module = { exports: {} };
  const { code } = babel.transformSync(fs.readFileSync('src/services/googleAuth.js', 'utf8'), {
    babelrc: false, configFile: false, plugins: ['@babel/plugin-transform-modules-commonjs'],
  });
  vm.runInNewContext(code, { module, exports: module.exports, process: { env: {} }, require: (name) => {
    if (name === 'react-native-nitro-google-signin' && environment === 'storeClient') throw new Error('Native module loaded in Expo Go');
    return mocks[name];
  } });
  return { api: module.exports, calls, user };
}
test('native Google sign-in sends its ID token to Firebase', async () => {
  const h = setup();
  assert.equal((await h.api.entrarComGoogle()).user, h.user);
  assert.deepEqual(h.calls, ['configure', 'play-services', 'google-id-token']);
});
test('cancelled Google selection reports incomplete access without authenticating and unlocks retry', async () => {
  const h = setup({ cancelled: true });
  await assert.rejects(h.api.entrarComGoogle(), { code: 'google/sign-in-incomplete' });
  assert(!h.calls.includes('google-id-token'));
  await assert.rejects(h.api.entrarComGoogle({ cadastro: true }), { code: 'google/sign-in-incomplete' });
});

test('native cancellation exceptions also report incomplete access instead of silently returning', async () => {
  const h = setup({ nativeError: { code: 'SIGN_IN_CANCELLED' } });
  await assert.rejects(h.api.entrarComGoogle(), { code: 'google/sign-in-incomplete' });
  assert(!h.calls.includes('google-id-token'));
});
test('Expo Go reports the build requirement without importing native modules', async () => {
  const h = setup({ environment: 'storeClient' });
  await assert.rejects(h.api.entrarComGoogle(), /Expo Go/);
  assert.deepEqual(h.calls, []);
});
test('web Google sign-in delegates to the Google credential flow before Firebase signup', async () => {
  const h = setup({ platform: 'web' });
  assert.equal((await h.api.entrarComGoogle()).user, h.user);
  assert.deepEqual(h.calls, ['web-google']);
});
