-- Create dashboard_insights table
create table if not exists public.dashboard_insights (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  insight text not null,
  source_entry_date date,
  generated_at timestamptz default now()
);

-- RLS
alter table public.dashboard_insights enable row level security;

create policy "Users can insert their own dashboard insights"
on public.dashboard_insights for insert
with check (auth.uid() = user_id);

create policy "Users can view their own dashboard insights"
on public.dashboard_insights for select
using (auth.uid() = user_id);

create policy "Users can update their own dashboard insights"
on public.dashboard_insights for update
using (auth.uid() = user_id);

create policy "Users can delete their own dashboard insights"
on public.dashboard_insights for delete
using (auth.uid() = user_id);

-- Index for efficient lookup
create index if not exists idx_dashboard_insights_user
on public.dashboard_insights (user_id);
