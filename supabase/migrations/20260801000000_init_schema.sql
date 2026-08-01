-- Replaces the Base44 "Toy" and "User" entities with native Postgres tables.
-- profiles: one row per auth.users, holds the app-level role (admin | user).
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

-- No client-side UPDATE policy: role changes are only made via the
-- Supabase dashboard/SQL editor (see README) to avoid self-promotion.

-- Auto-create a profile row whenever a new auth user is created.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, role)
  values (new.id, 'user')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Helper used by RLS policies below to check for admin role without recursive
-- RLS evaluation on public.profiles (security definer bypasses RLS).
create or replace function public.is_admin()
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- toys: mirrors base44/entities/Toy.jsonc
create table if not exists public.toys (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  description text,
  image_url text,
  alt_text text not null,
  dimensions text,
  capacity text,
  age_range text,
  space_required text,
  energy_requirements text,
  price numeric,
  status text not null default 'disponivel' check (status in ('disponivel', 'no_campo', 'manutencao')),
  featured boolean not null default false
);

alter table public.toys enable row level security;

create policy "Anyone can read toys"
  on public.toys for select
  using (true);

create policy "Admins can insert toys"
  on public.toys for insert
  with check (public.is_admin());

create policy "Admins can update toys"
  on public.toys for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can delete toys"
  on public.toys for delete
  using (public.is_admin());

-- Storage bucket for toy images, publicly readable, admin-only writes.
insert into storage.buckets (id, name, public)
values ('toy-images', 'toy-images', true)
on conflict (id) do nothing;

create policy "Public can view toy images"
  on storage.objects for select
  using (bucket_id = 'toy-images');

create policy "Admins can upload toy images"
  on storage.objects for insert
  with check (bucket_id = 'toy-images' and public.is_admin());

create policy "Admins can update toy images"
  on storage.objects for update
  using (bucket_id = 'toy-images' and public.is_admin())
  with check (bucket_id = 'toy-images' and public.is_admin());

create policy "Admins can delete toy images"
  on storage.objects for delete
  using (bucket_id = 'toy-images' and public.is_admin());
