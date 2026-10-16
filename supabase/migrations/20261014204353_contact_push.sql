-- Contact events share the existing outbox, leases and Expo receipt processing.
alter table public.push_events
  add column kind text not null default 'publication' check (kind in ('publication', 'contact')),
  add column recipient_uid text,
  add column sender_uid text,
  add column actual_item_id text,
  add column source_collection text not null default 'itens' check (source_collection in ('itens', 'item'));
create index push_devices_recipient on public.push_devices(firebase_uid) where active;
create index push_contacts_rate on public.push_events(sender_uid, actual_item_id, queued_at) where kind = 'contact';

create function public.push_enqueue_contact(p_item text, p_collection text, p_sender text, p_recipient text, p_title text)
returns boolean language plpgsql security invoker set search_path = public as $$
declare event_id text;
begin
  if not exists(select 1 from push_state where enabled) then
    raise exception 'Push disabled';
  end if;
  -- Limit repeated contact alerts from the same sender and item, including concurrent calls.
  perform pg_advisory_xact_lock(hashtextextended(p_sender || ':' || p_collection || ':' || p_item, 0));
  if exists(select 1 from push_events where kind = 'contact' and sender_uid = p_sender
    and actual_item_id = p_item and source_collection = p_collection and queued_at > now() - interval '1 minute') then return false; end if;
  event_id := 'contact:' || gen_random_uuid()::text;
  insert into push_events(item_id, title, published_at, kind, recipient_uid, sender_uid, actual_item_id, source_collection)
  values(event_id, p_title, now(), 'contact', p_recipient, p_sender, p_item, p_collection);
  insert into push_deliveries(item_id, token, session_hash)
  select event_id, token, session_hash from push_devices where active and firebase_uid = p_recipient;
  return true;
end;
$$;
revoke all on function public.push_enqueue_contact(text,text,text,text,text) from public, anon, authenticated;
grant execute on function public.push_enqueue_contact(text,text,text,text,text) to service_role;
