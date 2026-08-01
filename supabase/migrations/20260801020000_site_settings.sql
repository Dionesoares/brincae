-- Singleton table holding site-wide branding assets (header logo and the
-- homepage hero image), editable from /admin without a code deploy.
-- `id boolean primary key default true check (id)` guarantees exactly one
-- row can ever exist (only the value `true` satisfies the check).
create table if not exists public.site_settings (
  id boolean primary key default true check (id),
  logo_url text,
  hero_image_url text,
  updated_at timestamptz not null default now()
);

insert into public.site_settings (id) values (true) on conflict (id) do nothing;

alter table public.site_settings enable row level security;

create policy "Anyone can read site settings"
  on public.site_settings for select
  using (true);

create policy "Admins can update site settings"
  on public.site_settings for update
  using (public.is_admin())
  with check (public.is_admin());

-- Storage bucket for branding images (logo, hero), publicly readable, admin-only writes.
insert into storage.buckets (id, name, public)
values ('branding', 'branding', true)
on conflict (id) do nothing;

create policy "Public can view branding images"
  on storage.objects for select
  using (bucket_id = 'branding');

create policy "Admins can upload branding images"
  on storage.objects for insert
  with check (bucket_id = 'branding' and public.is_admin());

create policy "Admins can update branding images"
  on storage.objects for update
  using (bucket_id = 'branding' and public.is_admin())
  with check (bucket_id = 'branding' and public.is_admin());

create policy "Admins can delete branding images"
  on storage.objects for delete
  using (bucket_id = 'branding' and public.is_admin());
