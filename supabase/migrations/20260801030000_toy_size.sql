-- Explicit size category for toys (Pequeno/Médio/Grande), set from the admin
-- panel. Replaces the old regex guess against the free-text "dimensions"
-- field used by the homepage size filter.
alter table public.toys
  add column if not exists size text check (size in ('pequeno', 'medio', 'grande'));
