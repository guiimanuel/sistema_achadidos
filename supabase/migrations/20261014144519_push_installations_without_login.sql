-- Installations subscribe independently of Firebase accounts. Existing tokens are preserved.
alter table public.push_devices alter column firebase_uid drop not null;
