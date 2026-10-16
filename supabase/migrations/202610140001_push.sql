-- Dedicated tables: do not reuse the prototype's usuario table or store passwords.
create table public.push_devices (
  token text primary key,
  firebase_uid text not null,
  session_hash text not null unique,
  platform text not null check (platform in ('android', 'ios')),
  active boolean not null default true,
  registered_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.push_events (
  item_id text primary key,
  title text not null,
  published_at timestamptz not null,
  queued_at timestamptz not null default now()
);
create table public.push_deliveries (
  id bigint generated always as identity primary key,
  item_id text not null references public.push_events(item_id),
  token text not null,
  session_hash text not null,
  status text not null default 'pending' check (status in ('pending', 'receipt', 'delivered', 'failed', 'cancelled')),
  attempts integer not null default 0,
  receipt_attempts integer not null default 0,
  ticket_id text,
  error_code text,
  next_attempt_at timestamptz not null default now(),
  lease_id uuid,
  leased_until timestamptz,
  updated_at timestamptz not null default now(),
  unique (item_id, token)
);
create index push_deliveries_due on public.push_deliveries(status, next_attempt_at);
create table public.push_state (
  id boolean primary key default true check (id),
  enabled boolean not null default false,
  started_at timestamptz,
  scanned_until timestamptz,
  scan_until timestamptz,
  cursor_time text,
  cursor_name text,
  worker_id uuid,
  worker_until timestamptz
);
insert into public.push_state(id) values (true);

alter table public.push_devices enable row level security;
alter table public.push_events enable row level security;
alter table public.push_deliveries enable row level security;
alter table public.push_state enable row level security;
revoke all on public.push_devices, public.push_events, public.push_deliveries, public.push_state from anon, authenticated;
grant all on public.push_devices, public.push_events, public.push_deliveries, public.push_state to service_role;
grant usage, select on sequence public.push_deliveries_id_seq to service_role;

create function public.push_register(p_token text, p_uid text, p_session text, p_platform text)
returns void language plpgsql security definer set search_path = public as $$
begin
  -- A rotated token replaces the same installation; a transferred token replaces its old account.
  delete from push_devices where session_hash = p_session and token <> p_token;
  insert into push_devices(token, firebase_uid, session_hash, platform)
  values (p_token, p_uid, p_session, p_platform)
  on conflict (token) do update set
    firebase_uid = excluded.firebase_uid, session_hash = excluded.session_hash,
    platform = excluded.platform, active = true, updated_at = now(),
    registered_at = case when push_devices.session_hash = excluded.session_hash
      then push_devices.registered_at else now() end;
end;
$$;

create function public.push_enqueue(p_item text, p_title text, p_published timestamptz)
returns boolean language plpgsql security definer set search_path = public as $$
declare inserted_item text;
begin
  if not exists(select 1 from push_state where enabled and p_published >= started_at) then return false; end if;
  insert into push_events(item_id, title, published_at) values(p_item, p_title, p_published)
  on conflict do nothing returning item_id into inserted_item;
  if inserted_item is null then return false; end if;
  insert into push_deliveries(item_id, token, session_hash)
  select p_item, token, session_hash from push_devices
  where active and registered_at <= p_published;
  return true;
end;
$$;

create function public.push_acquire_worker(p_worker uuid)
returns boolean language plpgsql security definer set search_path = public as $$
begin
  update push_state set worker_id = p_worker, worker_until = now() + interval '120 seconds'
  where id and enabled and (worker_until is null or worker_until < now());
  return found;
end;
$$;

create function public.push_claim(p_worker uuid, p_status text, p_limit integer default 100)
returns setof public.push_deliveries language sql security definer set search_path = public as $$
  update push_deliveries set lease_id = p_worker, leased_until = now() + interval '120 seconds',
    attempts = attempts + case when p_status = 'pending' then 1 else 0 end,
    receipt_attempts = receipt_attempts + case when p_status = 'receipt' then 1 else 0 end,
    updated_at = now()
  where id in (
    select id from push_deliveries where status = p_status and next_attempt_at <= now()
    and (leased_until is null or leased_until < now())
    order by id for update skip locked limit least(greatest(p_limit, 1), 100)
  ) returning *;
$$;

revoke all on function public.push_register(text,text,text,text),
  public.push_enqueue(text,text,timestamptz), public.push_acquire_worker(uuid),
  public.push_claim(uuid,text,integer) from public, anon, authenticated;
grant execute on function public.push_register(text,text,text,text),
  public.push_enqueue(text,text,timestamptz), public.push_acquire_worker(uuid),
  public.push_claim(uuid,text,integer) to service_role;

-- Batch RPCs avoid one HTTP/database round trip per recipient or scanned item.
create function public.push_enqueue_batch(p_items jsonb)
returns void language plpgsql security definer set search_path = public as $$
declare item jsonb;
begin
  for item in select value from jsonb_array_elements(p_items) loop
    perform push_enqueue(item->>'id', item->>'title', (item->>'published')::timestamptz);
  end loop;
end;
$$;

create function public.push_finish_batch(p_worker uuid, p_results jsonb)
returns void language plpgsql security definer set search_path = public as $$
declare result jsonb;
begin
  for result in select value from jsonb_array_elements(p_results) loop
    update push_deliveries set
      status = result->>'status', error_code = result->>'error_code',
      ticket_id = coalesce(result->>'ticket_id', ticket_id),
      next_attempt_at = coalesce((result->>'next_attempt_at')::timestamptz, now()),
      lease_id = null, leased_until = null, updated_at = now()
    where id = (result->>'id')::bigint and lease_id = p_worker;
    if found and result->>'error_code' = 'DeviceNotRegistered' then
      update push_devices set active = false, updated_at = now()
      where token = result->>'token' and session_hash = result->>'session_hash';
    end if;
  end loop;
end;
$$;
revoke all on function public.push_enqueue_batch(jsonb), public.push_finish_batch(uuid,jsonb) from public, anon, authenticated;
grant execute on function public.push_enqueue_batch(jsonb), public.push_finish_batch(uuid,jsonb) to service_role;
