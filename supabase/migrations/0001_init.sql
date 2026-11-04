-- =============================================================================
-- Atelier JK&WA — Phase 6: schema, row-level security, storage
-- Idempotent: safe to run more than once (Supabase dashboard → SQL Editor).
-- Images are stored as STORAGE PATHS (e.g. 'projects/ceylon-road/01.jpg'), never
-- full URLs; the website builds the URL, so a domain/bucket change is one edit.
-- =============================================================================

-- ----------------------------------------------------------------------------
-- Tables
-- ----------------------------------------------------------------------------

-- Site-wide contact details and links: exactly one row, id = 1
create table if not exists public.settings (
  id                int primary key default 1 check (id = 1),
  company_name      text not null default '',
  uen               text not null default '',
  contact_person    text not null default '',
  address_lines     text[] not null default '{}',
  phone             text not null default '',
  fax               text not null default '',
  email             text not null default '',
  hours             text not null default '',
  booklet_url       text not null default '',
  questionnaire_url text not null default '',
  socials           jsonb not null default '{}'::jsonb,
  updated_at        timestamptz not null default now()
);

create table if not exists public.hero_slides (
  id         uuid primary key default gen_random_uuid(),
  image_path text not null,
  alt        text not null default '',
  width      int not null check (width > 0),
  height     int not null check (height > 0),
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.projects (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,
  title         text not null,
  category      text not null check (category in ('residential', 'commercial')),
  location      text not null,
  -- Facts (all optional; empty ones are hidden on the site)
  property_type text,
  size_sqft     int check (size_sqft > 0),
  duration      text,
  scope         text,
  year          int check (year between 1950 and 2100),
  -- Story (optional; plain text, blank line = new paragraph)
  story_heading text,
  story_body    text,
  featured      bool not null default false,
  published     bool not null default false,
  sort_order    int not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table if not exists public.project_images (
  id         uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  kind       text not null check (kind in ('cover', 'gallery', 'before', 'after')),
  image_path text not null,
  alt        text not null default '',
  width      int not null check (width > 0),
  height     int not null check (height > 0),
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- Who may edit the site. Rows are added by SQL only (never through the API).
create table if not exists public.admins (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  email      text not null,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- Indexes
-- ----------------------------------------------------------------------------

create index if not exists projects_published_sort_idx on public.projects (published, sort_order);
create index if not exists projects_featured_idx on public.projects (featured) where published;
create index if not exists project_images_project_kind_sort_idx
  on public.project_images (project_id, kind, sort_order);
-- At most ONE cover, ONE before and ONE after per project (any number of gallery images)
create unique index if not exists project_images_one_per_kind_idx
  on public.project_images (project_id, kind) where kind <> 'gallery';

-- ----------------------------------------------------------------------------
-- updated_at triggers
-- ----------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists settings_set_updated_at on public.settings;
create trigger settings_set_updated_at
  before update on public.settings
  for each row execute function public.set_updated_at();

drop trigger if exists projects_set_updated_at on public.projects;
create trigger projects_set_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- Admin check. security definer so it can read public.admins under RLS;
-- empty search_path so it can't be hijacked by objects in other schemas.
-- ----------------------------------------------------------------------------

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admins a where a.user_id = (select auth.uid())
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- ----------------------------------------------------------------------------
-- Table privileges (RLS below decides which ROWS; these decide which ACTIONS).
-- The anonymous role can only ever read. Belt and braces with the policies.
-- ----------------------------------------------------------------------------

grant usage on schema public to anon, authenticated;

grant select on public.settings, public.hero_slides, public.projects, public.project_images
  to anon, authenticated;
revoke insert, update, delete, truncate
  on public.settings, public.hero_slides, public.projects, public.project_images
  from anon;
grant insert, update, delete
  on public.settings, public.hero_slides, public.projects, public.project_images
  to authenticated;

-- admins: logged-in users may try to read (RLS shows rows to admins only);
-- nobody may write through the API
revoke all on public.admins from anon;
revoke insert, update, delete, truncate on public.admins from authenticated;
grant select on public.admins to authenticated;

-- ----------------------------------------------------------------------------
-- Row-level security
-- ----------------------------------------------------------------------------

alter table public.settings       enable row level security;
alter table public.hero_slides    enable row level security;
alter table public.projects       enable row level security;
alter table public.project_images enable row level security;
alter table public.admins         enable row level security;

-- settings: anyone reads, admins do everything
drop policy if exists "settings: public read" on public.settings;
create policy "settings: public read" on public.settings
  for select to anon, authenticated using (true);

drop policy if exists "settings: admin all" on public.settings;
create policy "settings: admin all" on public.settings
  for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

-- hero_slides: anyone reads, admins do everything
drop policy if exists "hero_slides: public read" on public.hero_slides;
create policy "hero_slides: public read" on public.hero_slides
  for select to anon, authenticated using (true);

drop policy if exists "hero_slides: admin all" on public.hero_slides;
create policy "hero_slides: admin all" on public.hero_slides
  for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

-- projects: anyone reads PUBLISHED projects, admins do everything (incl. drafts)
drop policy if exists "projects: public read published" on public.projects;
create policy "projects: public read published" on public.projects
  for select to anon, authenticated using (published = true);

drop policy if exists "projects: admin all" on public.projects;
create policy "projects: admin all" on public.projects
  for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

-- project_images: anyone reads images of PUBLISHED projects, admins do everything
drop policy if exists "project_images: public read published" on public.project_images;
create policy "project_images: public read published" on public.project_images
  for select to anon, authenticated using (
    exists (
      select 1 from public.projects p
      where p.id = project_images.project_id and p.published = true
    )
  );

drop policy if exists "project_images: admin all" on public.project_images;
create policy "project_images: admin all" on public.project_images
  for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

-- admins: only admins can read; NO insert/update/delete policies, so the API
-- can never add an admin (Phase 7 adds them with SQL)
drop policy if exists "admins: admin read" on public.admins;
create policy "admins: admin read" on public.admins
  for select to authenticated using ((select public.is_admin()));

-- ----------------------------------------------------------------------------
-- Storage: public-read bucket "media" (images + a future PDF booklet), 10MB max
-- ----------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media', 'media', true, 10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'application/pdf']
)
on conflict (id) do update set
  public             = excluded.public,
  file_size_limit    = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "media: public read" on storage.objects;
create policy "media: public read" on storage.objects
  for select to anon, authenticated using (bucket_id = 'media');

drop policy if exists "media: admin insert" on storage.objects;
create policy "media: admin insert" on storage.objects
  for insert to authenticated with check (bucket_id = 'media' and (select public.is_admin()));

drop policy if exists "media: admin update" on storage.objects;
create policy "media: admin update" on storage.objects
  for update to authenticated
  using (bucket_id = 'media' and (select public.is_admin()))
  with check (bucket_id = 'media' and (select public.is_admin()));

drop policy if exists "media: admin delete" on storage.objects;
create policy "media: admin delete" on storage.objects
  for delete to authenticated using (bucket_id = 'media' and (select public.is_admin()));
