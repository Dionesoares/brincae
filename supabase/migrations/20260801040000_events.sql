-- Events managed from /admin/evento, and the children attending each one.
-- Children's names stay admin-only (unlike the public toy catalog).
-- Each child has an independent chronometer:
--   elapsed_ms  = time already accumulated while paused
--   started_at  = when the current running segment began (null if paused)
-- Elapsed time is derived from those two columns, so a refresh does not
-- reset a running chronometer and one child's timer never affects another.

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  event_date date
);

create table if not exists public.event_children (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  event_id uuid not null references public.events(id) on delete cascade,
  name text not null,
  elapsed_ms bigint not null default 0 check (elapsed_ms >= 0),
  started_at timestamptz
);

create index if not exists event_children_event_id_idx
  on public.event_children (event_id, created_at);

alter table public.events enable row level security;
alter table public.event_children enable row level security;

create policy "Admins can read events"
  on public.events for select
  using (public.is_admin());

create policy "Admins can insert events"
  on public.events for insert
  with check (public.is_admin());

create policy "Admins can update events"
  on public.events for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can delete events"
  on public.events for delete
  using (public.is_admin());

create policy "Admins can read event children"
  on public.event_children for select
  using (public.is_admin());

create policy "Admins can insert event children"
  on public.event_children for insert
  with check (public.is_admin());

create policy "Admins can update event children"
  on public.event_children for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can delete event children"
  on public.event_children for delete
  using (public.is_admin());

-- Projects that do not auto-expose new public tables still need an explicit
-- grant for the Data API. Drop the public/anon grants that default privileges
-- may have added: children's names must not be readable without an admin JWT.
-- RLS above also limits every remaining row to admins.
revoke all on table public.events from public, anon;
revoke all on table public.event_children from public, anon;
grant select, insert, update, delete on table public.events to authenticated, service_role;
grant select, insert, update, delete on table public.event_children to authenticated, service_role;
