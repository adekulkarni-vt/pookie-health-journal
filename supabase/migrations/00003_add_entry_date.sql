-- Add entry_date column to entries table for backdated journal entries
-- This stores the calendar date the entry refers to (not when it was created)

alter table if exists public.entries
  add column if not exists entry_date date not null default current_date;

-- Backfill existing rows: set entry_date to the date portion of created_at
update public.entries
  set entry_date = created_at::date
  where entry_date is null;

-- Drop old index and create new one on entry_date
drop index if exists idx_entries_user_id;
create index if not exists idx_entries_user_id
  on public.entries (user_id, entry_date desc);
