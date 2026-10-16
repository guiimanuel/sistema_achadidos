import { admin, checked, enqueueBatch, env, firestore, sha256, timedFetch, type FirestoreDocument } from './core.ts';
import { buildScanQuery, resultUpdate, type Delivery, type ExpoResult } from './delivery.ts';

async function scan(worker: string, deadline: number) {
  const db = admin();
  const state = checked(await db.from('push_state').select('*').eq('id', true).single());
  if (!state.started_at) throw new Error('Push activation timestamp missing');
  // Overlap recovers delayed commits. A stable upper bound and a persisted document cursor
  // allow large backlogs and equal timestamps to continue across separate invocations.
  const lower = new Date(Math.max(Date.parse(state.started_at), Date.parse(state.scanned_until || state.started_at) - 120000)).toISOString();
  const upper = state.scan_until || new Date().toISOString();
  let cursor = state.cursor_time && state.cursor_name ? { time: state.cursor_time, name: state.cursor_name } : undefined;
  checked(await db.from('push_state').update({ scan_until: upper }).eq('worker_id', worker));
  for (let page = 0; page < 5 && Date.now() < deadline; page++) {
    const rows = await firestore(':runQuery', { structuredQuery: buildScanQuery(lower, upper, cursor) }) as { document?: FirestoreDocument }[];
    const documents = rows.flatMap((row) => row.document ? [row.document] : []);
    await enqueueBatch(documents);
    if (documents.length < 100) {
      checked(await db.from('push_state').update({ scanned_until: upper, scan_until: null, cursor_time: null, cursor_name: null }).eq('worker_id', worker));
      return;
    }
    const last = documents[documents.length - 1];
    cursor = { time: last.fields.createdAt.timestampValue!, name: last.name };
    checked(await db.from('push_state').update({ cursor_time: cursor.time, cursor_name: cursor.name }).eq('worker_id', worker));
  }
}

async function expo(path: string, body: unknown) {
  const accessToken = Deno.env.get('EXPO_ACCESS_TOKEN');
  const response = await timedFetch(`https://exp.host/--/api/v2/push/${path}`, {
    method: 'POST', headers: {
      Accept: 'application/json', 'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    }, body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(`Expo HTTP ${response.status}`);
  const result = await response.json();
  if (result.errors?.length || !result.data) throw new Error('Expo response unavailable');
  return result.data;
}

async function finish(worker: string, results: Record<string, unknown>[]) {
  checked(await admin().rpc('push_finish_batch', { p_worker: worker, p_results: results }));
}

async function processBatch(worker: string, kind: 'pending' | 'receipt') {
  const db = admin();
  const rows = checked(await db.rpc('push_claim', { p_worker: worker, p_status: kind, p_limit: 100 })) as Delivery[];
  if (!rows.length) return false;
  if (kind === 'receipt') {
    let receipts: Record<string, ExpoResult> = {};
    try { receipts = await expo('getReceipts', { ids: rows.map((row) => row.ticket_id).filter(Boolean) }); }
    catch { /* Retry receipt checks, without sending a second notification. */ }
    await finish(worker, rows.map((row) => ({ ...row, ...resultUpdate(row, receipts[row.ticket_id || ''], true) })));
    return true;
  }
  const devices = checked(await db.from('push_devices').select('token, session_hash, active, firebase_uid').in('token', rows.map((row) => row.token))) || [];
  const events = checked(await db.from('push_events').select('item_id, title, kind, recipient_uid, actual_item_id, source_collection').in('item_id', [...new Set(rows.map((row) => row.item_id))])) || [];
  const active = rows.filter((row) => {
    const event = events.find((event) => event.item_id === row.item_id);
    return row.attempts <= 8 && event && devices.some((device) => device.token === row.token && device.session_hash === row.session_hash && device.active &&
      (event.kind !== 'contact' || device.firebase_uid === event.recipient_uid));
  });
  const results: Record<string, unknown>[] = rows.filter((row) => !active.includes(row)).map((row) => ({
    ...row, status: row.attempts > 8 ? 'failed' : 'cancelled', error_code: row.attempts > 8 ? 'RetryLimit' : null,
  }));
  if (!active.length) { await finish(worker, results); return true; }
  let tickets: ExpoResult[] = [];
  try {
    tickets = await expo('send', active.map((row) => {
      const event = events.find((event) => event.item_id === row.item_id)!;
      return ({
      to: row.token, sound: 'default', channelId: 'novos-itens', title: 'Novo item publicado',
      ...(event.kind === 'contact' ? { title: 'Novo contato sobre seu item' } : {}),
      body: event.kind === 'contact' ? `Você recebeu um e-mail sobre ${event.title}. Confira sua caixa de entrada.` : event.title,
      data: { origem: event.kind === 'contact' ? 'contato-publicador' : 'nova-publicacao', itemId: event.actual_item_id || row.item_id, collection: event.source_collection },
    }); }));
  } catch { /* Ambiguous provider failures may duplicate a push; the outbox remains retryable. */ }
  results.push(...active.map((row, index) => ({ ...row, ...resultUpdate(row, tickets[index]) })));
  await finish(worker, results);
  return true;
}

export async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') return new Response('Method not allowed', { status: 405 });
  const received = request.headers.get('x-push-worker-secret') || '';
  const expected = env('PUSH_WORKER_SECRET');
  if (expected.length < 32 || received.length > 512 || await sha256(received) !== await sha256(expected)) {
    return new Response('Unauthorized', { status: 401 });
  }
  const worker = crypto.randomUUID();
  const db = admin();
  if (!checked(await db.rpc('push_acquire_worker', { p_worker: worker }))) return Response.json({ busy: true });
  const deadline = Date.now() + 45000;
  try {
    // Scan failure must not prevent deliveries already in the queue.
    let scanFailed = false;
    try { await scan(worker, Date.now() + 15000); }
    catch (error) { scanFailed = true; console.error('Push recovery failed', error instanceof Error ? error.message : 'Database error'); }
    await processBatch(worker, 'receipt');
    for (let batch = 0; batch < 5 && Date.now() < deadline; batch++) {
      if (!await processBatch(worker, 'pending')) break;
    }
    return Response.json({ ok: !scanFailed }, { status: scanFailed ? 503 : 200 });
  } catch (error) {
    console.error('Push dispatch failed', error instanceof Error ? error.message : 'Database error');
    return Response.json({ error: 'Dispatch failed; retry scheduled' }, { status: 500 });
  } finally {
    checked(await db.from('push_state').update({ worker_id: null, worker_until: null }).eq('worker_id', worker));
  }
}
