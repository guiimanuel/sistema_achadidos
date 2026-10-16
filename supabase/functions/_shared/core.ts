import { createClient } from 'npm:@supabase/supabase-js@2.112.3';
import { createRemoteJWKSet, importPKCS8, jwtVerify, SignJWT, type JWTVerifyGetKey } from 'npm:jose@6.1.0';

export class HttpError extends Error {
  constructor(public status: number, message: string) { super(message); }
}
export function env(name: string): string {
  const value = Deno.env.get(name);
  if (!value) throw new Error(`Missing configuration: ${name}`);
  return value;
}
export const projectId = () => env('FIREBASE_PROJECT_ID');
export const admin = () => createClient(env('SUPABASE_URL'), env('SUPABASE_SERVICE_ROLE_KEY'), {
  auth: { persistSession: false, autoRefreshToken: false },
  global: { fetch: (input, init) => fetch(input, { ...init, signal: AbortSignal.timeout(10000) }) },
});
export function checked<T>(result: { data: T; error: unknown }): T {
  if (result.error) throw result.error;
  return result.data;
}
export async function sha256(value: string): Promise<string> {
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return Array.from(new Uint8Array(hash), (byte) => byte.toString(16).padStart(2, '0')).join('');
}
export async function timedFetch(url: string, options: RequestInit = {}): Promise<Response> {
  return await fetch(url, { ...options, signal: AbortSignal.timeout(10000) });
}

const firebaseKeys = createRemoteJWKSet(new URL('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com'));
export async function firebaseUser(request: Request): Promise<string> {
  const token = request.headers.get('authorization')?.match(/^Bearer (\S+)$/i)?.[1];
  if (!token || token.length > 8192) throw new HttpError(401, 'Authentication required');
  return await verifyFirebaseToken(token);
}
export async function verifyFirebaseToken(token: string, keys: JWTVerifyGetKey = firebaseKeys): Promise<string> {
  try {
    const { payload } = await jwtVerify(token, keys, {
      algorithms: ['RS256'], issuer: `https://securetoken.google.com/${projectId()}`,
      audience: projectId(), requiredClaims: ['exp', 'iat', 'auth_time', 'sub'],
    });
    if (!payload.sub || payload.sub.length > 128 || typeof payload.auth_time !== 'number'
      || payload.auth_time > Date.now() / 1000 || !payload.iat || payload.iat > Date.now() / 1000
      || typeof payload.email !== 'string' || payload.email_verified !== true) {
      throw new Error('Invalid Firebase identity');
    }
    return payload.sub;
  } catch { throw new HttpError(401, 'Invalid Firebase token'); }
}

function sessionKey() {
  const secret = env('PUSH_SESSION_SECRET');
  if (secret.length < 32) throw new Error('PUSH_SESSION_SECRET needs at least 32 characters');
  return new TextEncoder().encode(secret);
}
export async function newSession(uid: string) {
  // Non-expiring, narrowly scoped capability to register/revoke this installation without login.
  return await new SignJWT({ purpose: 'push-device' }).setProtectedHeader({ alg: 'HS256' })
    .setSubject(uid).setJti(crypto.randomUUID()).setIssuedAt().setIssuer('achadidos-push')
    .sign(sessionKey());
}
export async function sessionIdentity(session: unknown) {
  if (typeof session !== 'string' || session.length > 2048) throw new HttpError(400, 'Invalid session');
  try {
    const { payload } = await jwtVerify(session, sessionKey(), {
      algorithms: ['HS256'], issuer: 'achadidos-push', requiredClaims: ['sub', 'jti', 'iat'],
    });
    if (payload.purpose !== 'push-device') throw new Error('Invalid purpose');
    return { uid: payload.sub!, hash: await sha256(session) };
  } catch { throw new HttpError(401, 'Invalid device session'); }
}

let googleAccess: { token: string; expires: number } | undefined;
async function googleToken() {
  if (googleAccess && googleAccess.expires > Date.now()) return googleAccess.token;
  const account = JSON.parse(env('FIREBASE_SERVICE_ACCOUNT_JSON'));
  if (account.project_id !== projectId()) throw new Error('Firebase service account project mismatch');
  const key = await importPKCS8(account.private_key, 'RS256');
  const assertion = await new SignJWT({ scope: 'https://www.googleapis.com/auth/datastore' })
    .setProtectedHeader({ alg: 'RS256' }).setIssuer(account.client_email)
    .setAudience('https://oauth2.googleapis.com/token').setIssuedAt().setExpirationTime('1h').sign(key);
  const response = await timedFetch('https://oauth2.googleapis.com/token', {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion }),
  });
  if (!response.ok) throw new Error(`Google authentication HTTP ${response.status}`);
  const result = await response.json();
  googleAccess = { token: result.access_token, expires: Date.now() + (result.expires_in - 60) * 1000 };
  return googleAccess.token;
}
export type FirestoreDocument = {
  name: string; createTime: string;
  fields: Record<string, { stringValue?: string; timestampValue?: string }>;
};
export async function firestore(path: string, body?: unknown): Promise<unknown> {
  const response = await timedFetch(`https://firestore.googleapis.com/v1/projects/${projectId()}/databases/(default)/documents${path}`, {
    method: body ? 'POST' : 'GET', headers: { Authorization: `Bearer ${await googleToken()}`, 'Content-Type': 'application/json' },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  if (response.status === 404) throw new HttpError(404, 'Item unavailable');
  if (!response.ok) throw new Error(`Firestore HTTP ${response.status}`);
  return await response.json();
}
export async function getItem(id: string, collection = 'itens') {
  if (!/^[A-Za-z0-9_-]{1,128}$/.test(id)) throw new HttpError(400, 'Invalid item ID');
  if (!['itens', 'item'].includes(collection)) throw new HttpError(400, 'Invalid collection');
  return await firestore(`/${collection}/${id}?mask.fieldPaths=titulo&mask.fieldPaths=userId&mask.fieldPaths=uid&mask.fieldPaths=createdAt`) as FirestoreDocument;
}
export async function enqueue(document: FirestoreDocument) {
  const id = document.name.split('/').pop()!;
  const title = (document.fields.titulo?.stringValue || 'Item sem título').slice(0, 120);
  return checked(await admin().rpc('push_enqueue', { p_item: id, p_title: title, p_published: document.createTime }));
}
export async function enqueueBatch(documents: FirestoreDocument[]) {
  checked(await admin().rpc('push_enqueue_batch', { p_items: documents.map((document) => ({
    id: document.name.split('/').pop()!,
    title: (document.fields.titulo?.stringValue || 'Item sem título').slice(0, 120),
    published: document.createTime,
  })) }));
}
export async function wakeWorker() {
  const response = await timedFetch(`${env('SUPABASE_URL')}/functions/v1/push-worker`, {
    method: 'POST', headers: { 'x-push-worker-secret': env('PUSH_WORKER_SECRET') },
  });
  if (!response.ok) throw new Error(`Worker HTTP ${response.status}`);
}
