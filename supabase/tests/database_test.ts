import assert from 'node:assert/strict';
import { PGlite } from 'npm:@electric-sql/pglite@0.3.14';

Deno.test({ name: 'PostgreSQL migration: private tables, fanout, deduplication, token transfer, leases and receipts',
  sanitizeOps: false, sanitizeResources: false,
  async fn() {
    const db = new PGlite();
    try {
      await db.exec('create role anon; create role authenticated; create role service_role bypassrls;');
      await db.exec(await Deno.readTextFile(new URL('../migrations/202610140001_push.sql', import.meta.url)));
      await db.exec(await Deno.readTextFile(new URL('../migrations/20261014144519_push_installations_without_login.sql', import.meta.url)));
      await db.exec(await Deno.readTextFile(new URL('../migrations/20261014204353_contact_push.sql', import.meta.url)));
      await db.exec(await Deno.readTextFile(new URL('../migrations/20261016031003_contact_push_every_message.sql', import.meta.url)));
      await db.exec("update push_state set enabled = true, started_at = now() - interval '1 hour';");
      const register = (token: string, uid: string | null, session: string) => db.query('select push_register($1,$2,$3,\'android\')', [token, uid, session]);
      const publish = (id: string, published = new Date().toISOString()) => db.query('select push_enqueue($1,\'Carteira\',$2::timestamptz)', [id, published]);
      await register('token-a', 'alice', 'session-a');
      await register('token-b', 'alice', 'session-b');
      await register('token-c', 'bob', 'session-c');
      await register('guest', null, 'guest');
      await db.query("select push_enqueue_contact('contact-item','itens','bob','alice','Carteira')");
      const contacts = (await db.query<{ token: string }>("select token from push_deliveries where item_id like 'contact:%'")).rows;
      assert.deepEqual(contacts.map((row) => row.token).sort(), ['token-a', 'token-b']);
      await db.query("select push_enqueue_contact('contact-item','itens','bob','alice','Carteira')");
      assert.equal((await db.query("select * from push_events where kind='contact'")).rows.length, 2);
      const repeatedContacts = (await db.query<{ token: string }>("select token from push_deliveries where item_id like 'contact:%'")).rows;
      assert.deepEqual(repeatedContacts.map((row) => row.token).sort(), ['token-a', 'token-a', 'token-b', 'token-b']);
      await db.query("select push_enqueue_contact('contact-item','itens','guest:session','alice','Carteira')");
      assert.equal((await db.query("select * from push_events where kind='contact'")).rows.length, 3);
      assert.equal((await db.query("select * from push_deliveries where item_id like 'contact:%'")).rows.length, 6);
      await db.exec("delete from push_deliveries where item_id like 'contact:%'; delete from push_events where kind='contact'; delete from push_devices where token='guest';");
      await publish('old', '2000-01-01T00:00:00Z');
      assert.equal((await db.query('select * from push_events')).rows.length, 0);
      await publish('item'); await publish('item');
      assert.equal((await db.query('select * from push_events')).rows.length, 1);
      assert.equal((await db.query('select * from push_deliveries')).rows.length, 3);
      await register('guest-token', null, 'guest-session');
      await publish('item-for-guests');
      assert.equal((await db.query("select * from push_deliveries where item_id='item-for-guests' and token='guest-token'")).rows.length, 1);
      assert.equal((await db.query<{ firebase_uid: string | null }>("select firebase_uid from push_devices where token='guest-token'")).rows[0].firebase_uid, null);
      // Keep the original lease assertions scoped to the first event.
      await db.exec("delete from push_deliveries where item_id = 'item-for-guests';");
      await register('token-a', 'bob', 'new-session-a');
      assert.equal((await db.query<{ firebase_uid: string }>("select firebase_uid from push_devices where token = 'token-a'")).rows[0].firebase_uid, 'bob');
      await db.exec("update push_devices set active = false where session_hash = 'session-a';");
      assert.equal((await db.query<{ active: boolean }>("select active from push_devices where token = 'token-a'")).rows[0].active, true);
      await register('rotated-token', 'bob', 'new-session-a');
      assert.equal((await db.query("select * from push_devices where token = 'token-a'")).rows.length, 0);

      const worker1 = '11111111-1111-4111-8111-111111111111';
      const worker2 = '22222222-2222-4222-8222-222222222222';
      assert.equal((await db.query<{ push_acquire_worker: boolean }>('select push_acquire_worker($1)', [worker1])).rows[0].push_acquire_worker, true);
      assert.equal((await db.query<{ push_acquire_worker: boolean }>('select push_acquire_worker($1)', [worker2])).rows[0].push_acquire_worker, false);
      const claimed = (await db.query<{ id: number; token: string; session_hash: string }>('select * from push_claim($1,\'pending\',100)', [worker1])).rows;
      assert.equal(claimed.length, 3);
      assert.equal((await db.query('select * from push_claim($1,\'pending\',100)', [worker2])).rows.length, 0);
      const stale = claimed.find((row) => row.token === 'token-a')!;
      await register('token-a', 'bob', 'fresh-session');
      await db.query('select push_finish_batch($1,$2::jsonb)', [worker1, JSON.stringify([{ ...stale, status: 'failed', error_code: 'DeviceNotRegistered' }])]);
      assert.equal((await db.query<{ active: boolean }>("select active from push_devices where token = 'token-a'")).rows[0].active, true);
      const ticket = claimed.find((row) => row.token === 'token-b')!;
      // A different worker cannot finish another worker's lease.
      await db.query('select push_finish_batch($1,$2::jsonb)', [worker2, JSON.stringify([{ ...ticket, status: 'delivered' }])]);
      assert.equal((await db.query<{ status: string }>('select status from push_deliveries where id=$1', [ticket.id])).rows[0].status, 'pending');
      await db.query('select push_finish_batch($1,$2::jsonb)', [worker1, JSON.stringify([{ ...ticket, status: 'receipt', ticket_id: 'expo-ticket' }])]);
      const receipts = (await db.query<{ id: number }>('select * from push_claim($1,\'receipt\',100)', [worker2])).rows;
      assert.equal(receipts.length, 1);
      await db.query('select push_finish_batch($1,$2::jsonb)', [worker2, JSON.stringify([{ id: receipts[0].id, status: 'delivered' }])]);
      await db.exec("update push_deliveries set leased_until = now() - interval '1 minute' where status = 'pending';");
      assert.equal((await db.query('select * from push_claim($1,\'pending\',100)', [worker2])).rows.length, 1);
      // Grants/RLS must reject token reads and privileged RPCs for both client roles.
      for (const role of ['anon', 'authenticated']) {
        await db.exec(`set role ${role};`);
        await assert.rejects(db.query('select * from push_devices'));
        await assert.rejects(db.query("select push_enqueue('attack','attack',now())"));
        await assert.rejects(db.query("select push_enqueue_contact('attack','itens','attacker','alice','attack')"));
        await db.exec('reset role;');
      }
    } finally { await db.close(); }
  },
});
