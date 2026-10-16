import assert from 'node:assert/strict';
import { createLocalJWKSet, exportJWK, generateKeyPair, SignJWT } from 'jose';
import { newSession, sessionIdentity, verifyFirebaseToken } from '../functions/_shared/core.ts';
import { handler as api } from '../functions/_shared/api.ts';
import { handler as worker } from '../functions/_shared/worker.ts';
import { buildScanQuery, resultUpdate, type Delivery } from '../functions/_shared/delivery.ts';

Deno.env.set('FIREBASE_PROJECT_ID', 'achadidos-test');
Deno.env.set('PUSH_SESSION_SECRET', 'test-session-secret-at-least-32-characters');
Deno.env.set('PUSH_WORKER_SECRET', 'test-worker-secret-at-least-32-characters');

Deno.test('JWT Firebase: verifies signature, project, expiry, subject, institutional email and timestamps', async () => {
  const { privateKey, publicKey } = await generateKeyPair('RS256');
  const key = await exportJWK(publicKey);
  const resolve = createLocalJWKSet({ keys: [{ ...key, kid: 'test', alg: 'RS256' }] });
  const now = Math.floor(Date.now() / 1000);
  const claims = { sub: 'alice', email: 'alice@discente.ifpe.edu.br', email_verified: true, auth_time: now, iat: now, exp: now + 3600,
    iss: 'https://securetoken.google.com/achadidos-test', aud: 'achadidos-test' };
  const sign = (data: Record<string, unknown>, signingKey = privateKey) => new SignJWT(data)
    .setProtectedHeader({ alg: 'RS256', kid: 'test' }).sign(signingKey);
  assert.equal(await verifyFirebaseToken(await sign(claims), resolve), 'alice');
  for (const invalid of [
    { ...claims, aud: 'other-project' }, { ...claims, iss: 'https://attacker.test' },
    { ...claims, exp: now - 10 }, { ...claims, sub: '' }, { ...claims, auth_time: now + 300 },
    { ...claims, iat: now + 300 }, { ...claims, email_verified: false },
  ]) await assert.rejects(verifyFirebaseToken(await sign(invalid), resolve));
  assert.equal(await verifyFirebaseToken(await sign({ ...claims, email: 'servidor@ifpe.edu.br' }), resolve), 'alice');
  const forged = await generateKeyPair('RS256');
  await assert.rejects(verifyFirebaseToken(await sign(claims, forged.privateKey), resolve));
});

Deno.test('device capability is signed and scoped to its owner, with no Firebase credentials', async () => {
  const session = await newSession('alice');
  const identity = await sessionIdentity(session);
  assert.equal(identity.uid, 'alice');
  assert.equal(identity.hash.length, 64);
  await assert.rejects(sessionIdentity(`${session}corrupted`));
  await assert.rejects(sessionIdentity('unsigned-device-id'));
});

Deno.test('guests can obtain an installation capability; publish and Cron remain authenticated', async () => {
  const response = await api(new Request('http://localhost', { method: 'POST', body: JSON.stringify({ action: 'session' }) }));
  assert.equal(response.status, 200);
  const capability = await response.json();
  assert((await sessionIdentity(capability.session)).uid.startsWith('installation:'));
  const guestContact = await api(new Request('http://localhost', { method: 'POST', body: JSON.stringify({
    action: 'contact', session: capability.session, itemId: 'invalid/id',
  }) }));
  assert.equal(guestContact.status, 400);
  assert.equal((await guestContact.json()).error, 'Invalid item ID');
  assert.equal((await api(new Request('http://localhost', { method: 'POST', body: JSON.stringify({
    action: 'contact', session: 'forged', itemId: 'item',
  }) }))).status, 401);
  assert.equal((await api(new Request('http://localhost', { method: 'POST', body: JSON.stringify({ action: 'publish' }) }))).status, 401);
  assert.equal((await api(new Request('http://localhost', { method: 'POST', body: JSON.stringify({ action: 'register' }) }))).status, 400);
  Deno.env.set('EXPO_PROJECT_ID', 'expected-project');
  const invalidDevice = await api(new Request('http://localhost', { method: 'POST', body: JSON.stringify({
    action: 'register', session: capability.session, token: 'invalid', platform: 'android', projectId: 'expected-project',
  }) }));
  assert.equal(invalidDevice.status, 400);
  assert.equal((await api(new Request('http://localhost', { method: 'POST', body: '{' }))).status, 400);
  assert.equal((await api(new Request('http://localhost', { method: 'POST', body: JSON.stringify({ action: 'deactivate', session: 'forged' }) }))).status, 401);
  assert.equal((await worker(new Request('http://localhost', { method: 'POST' }))).status, 401);
});

const row: Delivery = { id: 1, item_id: 'item', token: 'ExpoPushToken[test]', session_hash: 'hash',
  status: 'pending', attempts: 1, receipt_attempts: 1, ticket_id: null };
Deno.test('tickets await receipts; invalid tokens stop; transient failures back off; absent receipts never resend', () => {
  assert.equal(resultUpdate(row, { status: 'ok', id: 'ticket' }).status, 'receipt');
  assert.equal(resultUpdate(row, { status: 'ok' }, true).status, 'delivered');
  assert.equal(resultUpdate(row, { status: 'error', details: { error: 'DeviceNotRegistered' } }).status, 'failed');
  assert.equal(resultUpdate(row, { status: 'error', details: { error: 'MessageRateExceeded' } }).status, 'pending');
  assert.equal(resultUpdate(row, undefined, true).status, 'receipt');
  assert.equal(resultUpdate(row, { status: 'error', details: { error: 'MessageRateExceeded' } }, true).status, 'pending');
  assert.equal(resultUpdate({ ...row, attempts: 8 }, undefined).status, 'failed');
});
Deno.test('scanner orders by timestamp and document, using an exclusive persisted cursor', () => {
  const query = buildScanQuery('2026-10-14T00:00:00Z', '2026-10-14T00:01:00Z', { time: '2026-10-14T00:00:30Z', name: 'projects/p/databases/(default)/documents/itens/item' });
  assert.equal(query.startAt?.before, false);
  assert.equal(query.startAt?.values.length, 2);
  assert.deepEqual(query.orderBy.map((entry) => entry.field.fieldPath), ['createdAt', '__name__']);
  assert.equal(query.limit, 100);
});
