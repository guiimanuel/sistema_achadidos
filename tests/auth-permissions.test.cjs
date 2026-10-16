const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const babel = require('@babel/core');

function setup(verified = false, failVerification = false, googleError = null, options = {}) {
  const calls = [];
  const requests = [];
  const user = { uid: 'user', email: 'user@discente.ifpe.edu.br', emailVerified: verified, ...options.user };
  const profiles = new Map(options.profiles || []);
  const mocks = {
    '../lib/firebase.js': { auth: { currentUser: user, app: { options: { apiKey: 'test-key', authDomain: 'test.firebaseapp.com' } } } },
    'firebase/auth': {
      createUserWithEmailAndPassword: async () => ({ user }),
      signInWithEmailAndPassword: async () => ({ user }),
      GoogleAuthProvider: { credential: (idToken, accessToken) => ({ idToken, accessToken }) },
      signInWithCredential: async (_, credential) => {
        calls.push(credential.idToken);
        if (options.googleName) user.displayName = options.googleName;
        return { user };
      },
      updateProfile: async (target, profile) => { calls.push('profile'); Object.assign(target, profile); },
      sendEmailVerification: async () => { calls.push('verify'); if (failVerification) throw new Error('offline'); },
      signOut: async () => calls.push('logout'),
    },
  };
  mocks['firebase/firestore'] = {
    doc: (_, collection, uid) => `${collection}/${uid}`,
    runTransaction: async (_, callback) => {
      if (options.profileError) throw new Error('Perfil indisponível');
      return callback({
        get: async (key) => ({ exists: () => profiles.has(key), data: () => profiles.get(key) }),
        set: (key, value) => profiles.set(key, value),
      });
    },
  };
  const profileModule = { exports: {} };
  const profileCode = babel.transformSync(fs.readFileSync('src/services/perfil.js', 'utf8'), {
    babelrc: false, configFile: false, plugins: ['@babel/plugin-transform-modules-commonjs'],
  }).code;
  vm.runInNewContext(profileCode, { module: profileModule, exports: profileModule.exports, require: (name) => mocks[name] });
  mocks['./perfil.js'] = profileModule.exports;
  const module = { exports: {} };
  const { code } = babel.transformSync(fs.readFileSync('src/services/auth.js', 'utf8'), {
    babelrc: false, configFile: false, plugins: ['@babel/plugin-transform-modules-commonjs'],
  });
  vm.runInNewContext(code, { module, exports: module.exports, require: (name) => mocks[name],
    fetch: async (_, options) => {
      requests.push(JSON.parse(options.body));
      return { ok: !googleError, json: async () => googleError ? { error: { message: googleError } } : {} };
    },
  });
  return { api: module.exports, calls, user, requests, profiles };
}

test('signup sends Firebase verification and ends the unverified session', async () => {
  const h = setup();
  await h.api.criarConta('user@discente.ifpe.edu.br', 'secret', 'Nome');
  assert.deepEqual(h.calls, ['profile', 'verify', 'logout']);
  assert.equal(h.profiles.get('perfis/user').nome, 'Nome');
});

test('Google login restores the registered name across repeated logins and both token flows', async () => {
  const h = setup(true, false, null, {
    profiles: [['perfis/user', { nome: 'Nome do cadastro' }]], googleName: 'Nome do Google',
  });
  await h.api.entrarComTokenGoogle('google-token');
  assert.equal(h.user.displayName, 'Nome do cadastro');
  await h.api.entrarComAcessoGoogle('google-access', h.user.email);
  assert.equal(h.user.displayName, 'Nome do cadastro');
  assert.equal(h.profiles.get('perfis/user').nome, 'Nome do cadastro');
});

test('password login preserves legacy registration before a later Google login', async () => {
  const h = setup(true, false, null, { user: { displayName: 'Nome legado' }, googleName: 'Google' });
  await h.api.entrar(h.user.email, 'secret');
  assert.equal(h.profiles.get('perfis/user').nome, 'Nome legado');
  await h.api.entrarComTokenGoogle('token');
  assert.equal(h.user.displayName, 'Nome legado');
});

test('legacy password provider name takes priority over Google for accounts without a saved profile', async () => {
  const h = setup(true, false, null, {
    googleName: 'Google', user: { providerData: [{ providerId: 'password', displayName: 'Nome original' }] },
  });
  await h.api.entrarComTokenGoogle('token');
  assert.equal(h.user.displayName, 'Nome original');
  assert.equal(h.profiles.get('perfis/user').nome, 'Nome original');
});

test('new Google-only accounts retain the Google name when no registration name exists', async () => {
  const h = setup(true, false, null, { googleName: 'Google' });
  await h.api.entrarComTokenGoogle('token');
  assert.equal(h.user.displayName, 'Google');
  assert.equal(h.profiles.size, 0);
});

test('profile lookup failure ends Google login without overwriting the registered name', async () => {
  const h = setup(true, false, null, {
    profileError: true, profiles: [['perfis/user', { nome: 'Nome original' }]], googleName: 'Google',
  });
  await assert.rejects(h.api.entrarComTokenGoogle('token'), /Perfil indisponível/);
  assert.equal(h.calls.at(-1), 'logout');
  assert.equal(h.profiles.get('perfis/user').nome, 'Nome original');
});
test('unverified login is rejected and signed out; verified login succeeds', async () => {
  const h = setup();
  await assert.rejects(h.api.entrar('user@example.com', 'secret'), { code: 'auth/email-not-verified' });
  assert.deepEqual(h.calls, ['verify', 'logout']);
  const verified = setup(true);
  assert.equal((await verified.api.entrar('user@example.com', 'secret')).user, verified.user);
});
test('verification failures retain the created account for retry without duplicate signup', async () => {
  const h = setup(false, true);
  await assert.rejects(h.api.criarConta('user@discente.ifpe.edu.br', 'secret', 'Nome'), (error) => error.usuarioCriado === h.user);
});
test('publication permissions reject guests, unverified accounts and student domains ignoring case', () => {
  const code = fs.readFileSync('src/utils/permissoes.js', 'utf8').replace('export ', '');
  const { podePublicar } = vm.runInNewContext(`${code}; ({ podePublicar });`);
  assert.equal(podePublicar(null), false);
  assert.equal(podePublicar({ email: 'staff@ifpe.edu.br', emailVerified: false }), false);
  assert.equal(podePublicar({ email: ' Aluno@DISCENTE.IFPE.EDU.BR ', emailVerified: true }), false);
  assert.equal(podePublicar({ email: 'staff@ifpe.edu.br', emailVerified: true }), true);
  assert.equal(podePublicar({ email: 'suporte@achadidos.company', emailVerified: false }), false);
  assert.equal(podePublicar({ email: 'suporte@achadidos.company', emailVerified: true }), true);
  assert.equal(podePublicar({ email: 'other@achadidos.company', emailVerified: true }), true);
  assert.equal(podePublicar({ email: 'anyone@gmail.com', emailVerified: true }), true);
  assert.equal(podePublicar({ email: 'anyone@outlook.com', emailVerified: true }), true);
  assert.equal(podePublicar({ email: 'anyone@gmail.com', emailVerified: false }), false);
  assert.equal(podePublicar({ email: 'aluno@discente.ifpe.edu.br', emailVerified: true }), false);
});

test('Google uses the Firebase credential without sending an email confirmation link', async () => {
  const h = setup(true);
  assert.equal((await h.api.entrarComTokenGoogle('google-id-token')).user, h.user);
  assert.deepEqual(h.calls, ['google-id-token']);
});
test('Google cannot bypass verification by returning an unverified Firebase identity', async () => {
  const h = setup(false);
  await assert.rejects(h.api.entrarComTokenGoogle('google-id-token'), /não confirmou/);
  assert.deepEqual(h.calls, ['google-id-token', 'logout']);
});

test('non-student signup is rejected before any Firebase account is created', async () => {
  const h = setup();
  for (const email of ['user@gmail.com', 'staff@ifpe.edu.br', 'user@discente.ifpe.edu.br.attacker.com', '@discente.ifpe.edu.br']) {
    await assert.rejects(h.api.criarConta(email, 'secret', 'Nome'), /exclusivo/);
  }
  assert.deepEqual(h.calls, []);
  assert.equal(h.api.emailDiscente(' Aluno@DISCENTE.IFPE.EDU.BR '), true);
});
test('manually provisioned non-student accounts retain password login', async () => {
  const h = setup(true);
  h.user.email = 'suporteachadidos@gmail.com';
  assert.equal((await h.api.entrar(h.user.email, 'secret')).user, h.user);
});
test('Google signup blocks non-student addresses before Firebase sign-in', async () => {
  const h = setup(true);
  await assert.rejects(h.api.entrarComTokenGoogle('token', { email: 'user@gmail.com', cadastro: true }), /exclusivo/);
  assert.deepEqual(h.calls, []);
  assert.equal(h.requests.length, 0);
  await assert.rejects(h.api.entrarComAcessoGoogle('access-token', 'user@gmail.com', { cadastro: true }), /exclusivo/);
  assert.equal(h.requests.length, 0);
});
test('Google login disables automatic account creation for non-students', async () => {
  const h = setup(true, false, 'USER_NOT_FOUND');
  await assert.rejects(h.api.entrarComTokenGoogle('token', { email: 'user@gmail.com' }), /administração/);
  assert.equal(h.requests[0].autoCreate, false);
  assert.deepEqual(h.calls, []);
});
test('Google signup allows student addresses and Google login allows existing non-students', async () => {
  const h = setup(true);
  await h.api.entrarComTokenGoogle('token', { email: 'user@discente.ifpe.edu.br', cadastro: true });
  assert.equal(h.requests[0].autoCreate, true);
  await h.api.entrarComTokenGoogle('token', { email: 'suporteachadidos@gmail.com' });
  assert.equal(h.requests[1].autoCreate, false);
});
