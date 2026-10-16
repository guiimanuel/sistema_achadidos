-- Each successful contact request gets its own event, even within the same minute.
create or replace function public.push_enqueue_contact(p_item text, p_collection text, p_sender text, p_recipient text, p_title text)
returns boolean language plpgsql security invoker set search_path = public as $$
declare event_id text;
begin
  if not exists(select 1 from push_state where enabled) then
    raise exception 'Push disabled';
  end if;
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
