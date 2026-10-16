import { admin, checked, enqueue, env, firebaseUser, getItem, HttpError, newSession, sessionIdentity, wakeWorker } from './core.ts';

declare const EdgeRuntime: { waitUntil(promise: Promise<unknown>): void };

const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, content-type', 'Access-Control-Allow-Methods': 'POST, OPTIONS' };
export async function handler(request: Request): Promise<Response> {
  if (request.method === 'OPTIONS') return new Response(null, { headers: cors });
  try {
    if (request.method !== 'POST') throw new HttpError(405, 'Method not allowed');
    const text = await request.text();
    if (text.length > 8192) throw new HttpError(413, 'Request too large');
    let body;
    try { body = JSON.parse(text); } catch { throw new HttpError(400, 'Invalid JSON'); }
    if (!body || typeof body !== 'object') throw new HttpError(400, 'Invalid request');
    if (body.action === 'deactivate') {
      const { hash } = await sessionIdentity(body.session);
      checked(await admin().from('push_devices').update({ active: false, updated_at: new Date().toISOString() }).eq('session_hash', hash));
      return Response.json({ ok: true }, { headers: cors });
    }
    if (body.action === 'session') {
      if (body.projectId && body.projectId !== env('EXPO_PROJECT_ID')) throw new HttpError(400, 'Invalid project');
      return Response.json({ session: await newSession(`installation:${crypto.randomUUID()}`) }, { headers: cors });
    }
    if (body.action === 'register') {
      const session = await sessionIdentity(body.session);
      if (typeof body.token !== 'string' || !/^(ExponentPushToken|ExpoPushToken)\[[A-Za-z0-9_-]{1,200}\]$/.test(body.token)
        || !['android', 'ios'].includes(body.platform) || body.projectId !== env('EXPO_PROJECT_ID')) {
        throw new HttpError(400, 'Invalid device');
      }
      const uid = request.headers.has('authorization') ? await firebaseUser(request) : null;
      checked(await admin().rpc('push_register', { p_token: body.token, p_uid: uid, p_session: session.hash, p_platform: body.platform }));
      return Response.json({ ok: true }, { headers: cors });
    }
    if (body.action === 'contact') {
      const uid = request.headers.has('authorization')
        ? await firebaseUser(request)
        : `guest:${(await sessionIdentity(body.session)).hash}`;
      if (typeof body.itemId !== 'string') throw new HttpError(400, 'Invalid item ID');
      const item = await getItem(body.itemId, body.collection || 'itens');
      const recipient = item.fields.userId?.stringValue || item.fields.uid?.stringValue;
      if (!recipient) throw new HttpError(409, 'Publisher account unavailable');
      const queued = checked(await admin().rpc('push_enqueue_contact', {
        p_item: body.itemId, p_collection: body.collection || 'itens', p_sender: uid,
        p_recipient: recipient, p_title: (item.fields.titulo?.stringValue || 'Item sem título').slice(0, 120),
      }));
      if (queued) EdgeRuntime.waitUntil(wakeWorker().catch(() => console.warn('Contact push queued; worker will retry.')));
      return Response.json({ ok: true, queued }, { status: 202, headers: cors });
    }
    if (body.action === 'publish') {
      const uid = await firebaseUser(request);
      if (typeof body.itemId !== 'string') throw new HttpError(400, 'Invalid item ID');
      const item = await getItem(body.itemId);
      if (item.fields.userId?.stringValue !== uid) throw new HttpError(403, 'Item owner mismatch');
      const inserted = await enqueue(item);
      // Accepted requests are durably queued before attempting immediate dispatch.
      if (inserted) EdgeRuntime.waitUntil(wakeWorker().catch(() => console.warn('Push worker wake failed; Cron will retry.')));
      return Response.json({ ok: true }, { status: 202, headers: cors });
    }
    throw new HttpError(400, 'Unknown action');
  } catch (error) {
    const status = error instanceof HttpError ? error.status : 500;
    if (status === 500) console.error('Push API failed', error instanceof Error ? error.message : 'Database operation failed');
    return Response.json({ error: status === 500 ? 'Internal error' : (error as Error).message }, { status, headers: cors });
  }
}
