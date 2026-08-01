-- Rotating promotional banners shown on the homepage, managed from /admin.
create table if not exists public.banners (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  image_url text not null,
  alt_text text not null,
  link_url text,
  position integer not null default 0,
  active boolean not null default true
);

alter table public.banners enable row level security;

create policy "Anyone can read banners"
  on public.banners for select
  using (true);

create policy "Admins can insert banners"
  on public.banners for insert
  with check (public.is_admin());

create policy "Admins can update banners"
  on public.banners for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can delete banners"
  on public.banners for delete
  using (public.is_admin());

-- Storage bucket for banner images, publicly readable, admin-only writes.
insert into storage.buckets (id, name, public)
values ('banners', 'banners', true)
on conflict (id) do nothing;

create policy "Public can view banner images"
  on storage.objects for select
  using (bucket_id = 'banners');

create policy "Admins can upload banner images"
  on storage.objects for insert
  with check (bucket_id = 'banners' and public.is_admin());

create policy "Admins can update banner images"
  on storage.objects for update
  using (bucket_id = 'banners' and public.is_admin())
  with check (bucket_id = 'banners' and public.is_admin());

create policy "Admins can delete banner images"
  on storage.objects for delete
  using (bucket_id = 'banners' and public.is_admin());
