-- Add AI memory fields to entries table
-- Replacing entity extraction with compressed memory representation

alter table if exists public.entries
  add column if not exists ai_title text,
  add column if not exists severity smallint check (severity between 1 and 5);

-- Update mood to accept the new constrained set of values
-- (existing text column is fine; the frontend will enforce valid values)

-- Add index on ai_title and severity for retrieval
create index if not exists idx_entries_ai_title
  on public.entries (user_id, ai_title);

create index if not exists idx_entries_severity
  on public.entries (user_id, severity);
