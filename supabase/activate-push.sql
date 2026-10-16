-- Run AFTER deploying functions and configuring secrets. Requires pg_cron, pg_net and Vault.
-- Set push_worker_secret in Vault to exactly the same value as PUSH_WORKER_SECRET.
-- The secret stays out of cron.job command text.
do $$
begin
  if not exists(select 1 from vault.decrypted_secrets where name = 'push_worker_secret') then
    raise exception 'Configure push_worker_secret in Vault first';
  end if;
end $$;

update public.push_state set enabled = true,
  started_at = coalesce(started_at, now()), scanned_until = coalesce(scanned_until, now()) where id;

select cron.schedule('achadidos-push-every-minute', '* * * * *', $$
  select net.http_post(
    url := 'https://yxntmaturcrogmkbijql.supabase.co/functions/v1/push-worker',
    headers := jsonb_build_object('Content-Type', 'application/json', 'x-push-worker-secret',
      (select decrypted_secret from vault.decrypted_secrets where name = 'push_worker_secret')),
    body := '{}'::jsonb,
    timeout_milliseconds := 60000
  );
$$);
