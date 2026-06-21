-- Create entries table
create table if not exists public.entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  created_at timestamptz default now(),
  journal_text text not null,
  sleep_hours numeric,
  weight numeric,
  stress_level smallint check (stress_level between 1 and 5),
  day_rating smallint check (day_rating between 1 and 5),
  mood text,
  ai_summary text,
  extraction jsonb default '{}'::jsonb
);

-- Create photos table
create table if not exists public.photos (
  id uuid primary key default gen_random_uuid(),
  entry_id uuid references public.entries(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade,
  storage_path text not null,
  created_at timestamptz default now()
);

-- Create weekly_reflections table
create table if not exists public.weekly_reflections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  week_start date not null,
  reflection_text text not null,
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.entries enable row level security;
alter table public.photos enable row level security;
alter table public.weekly_reflections enable row level security;

-- Entries policies
create policy "Users can insert their own entries"
on public.entries for insert
with check (auth.uid() = user_id);

create policy "Users can view their own entries"
on public.entries for select
using (auth.uid() = user_id);

create policy "Users can update their own entries"
on public.entries for update
using (auth.uid() = user_id);

create policy "Users can delete their own entries"
on public.entries for delete
using (auth.uid() = user_id);

-- Photos policies
create policy "Users can insert photos for their entries"
on public.photos for insert
with check (
  auth.uid() = (select user_id from public.entries where id = entry_id)
);

create policy "Users can view photos for their entries"
on public.photos for select
using (
  auth.uid() = (select user_id from public.entries where id = entry_id)
);

create policy "Users can delete photos for their entries"
on public.photos for delete
using (
  auth.uid() = (select user_id from public.entries where id = entry_id)
);

-- Weekly reflections policies
create policy "Users can insert their own reflections"
on public.weekly_reflections for insert
with check (auth.uid() = user_id);

create policy "Users can view their own reflections"
on public.weekly_reflections for select
using (auth.uid() = user_id);

create policy "Users can update their own reflections"
on public.weekly_reflections for update
using (auth.uid() = user_id);

create policy "Users can delete their own reflections"
on public.weekly_reflections for delete
using (auth.uid() = user_id);

-- Create storage bucket for entry photos
insert into storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
values (
  'entry-photos',
  'entry-photos',
  true,
  false,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp']::text[]
)
on conflict (id) do nothing;

-- Storage policies
create policy "Users can upload entry photos"
on storage.objects for insert
with check (
  bucket_id = 'entry-photos' and auth.role() = 'authenticated'
);

create policy "Users can view entry photos"
on storage.objects for select
using (
  bucket_id = 'entry-photos' and auth.role() = 'authenticated'
);

create policy "Users can delete their entry photos"
on storage.objects for delete
using (
  bucket_id = 'entry-photos' and auth.role() = 'authenticated'
);

-- Create indexes
create index if not exists idx_entries_user_id
on public.entries (user_id, created_at desc);

create index if not exists idx_photos_entry
on public.photos (entry_id);

create index if not exists idx_weekly_reflections_user
on public.weekly_reflections (user_id, week_start desc);
