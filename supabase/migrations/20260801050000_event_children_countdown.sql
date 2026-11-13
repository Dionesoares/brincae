-- Countdown (cronômetro regressivo) and "add time" support for each child's
-- chronometer on /admin/evento/:eventId. Builds on 20260801040000_events.sql.
--
--   mode         = 'up' (count-up, the original behavior) or 'down' (countdown)
--   duration_ms  = starting duration chosen by the admin for the countdown
--   added_ms     = extra time added to the countdown (+1 min, +5 min, custom)
--
-- Remaining time in countdown mode is derived as
--   duration_ms + added_ms - elapsed
-- where elapsed still comes from elapsed_ms / started_at, so a refresh keeps
-- running timers and every child stays independent. In count-up mode, adding
-- time increases elapsed_ms directly.
--
-- RLS and grants: the table-level admin-only policies and the revoke/grant
-- statements from the events migration already cover new columns. They are
-- restated below (idempotently) so this migration stays self-contained.

alter table public.event_children
  add column if not exists mode text not null default 'up',
  add column if not exists duration_ms bigint not null default 0,
  add column if not exists added_ms bigint not null default 0;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'event_children_mode_check'
      and conrelid = 'public.event_children'::regclass
  ) then
    alter table public.event_children
      add constraint event_children_mode_check check (mode in ('up', 'down'));
  end if;
  if not exists (
    select 1 from pg_constraint
    where conname = 'event_children_duration_ms_check'
      and conrelid = 'public.event_children'::regclass
  ) then
    alter table public.event_children
      add constraint event_children_duration_ms_check check (duration_ms >= 0);
  end if;
  if not exists (
    select 1 from pg_constraint
    where conname = 'event_children_added_ms_check'
      and conrelid = 'public.event_children'::regclass
  ) then
    alter table public.event_children
      add constraint event_children_added_ms_check check (added_ms >= 0);
  end if;
end
$$;

alter table public.event_children enable row level security;

revoke all on table public.event_children from public, anon;
grant select, insert, update, delete on table public.event_children to authenticated, service_role;
