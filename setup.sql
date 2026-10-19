-- Run this ONCE in Supabase: SQL Editor > New query > paste everything > Run.
create table public.reports (
  id bigint generated always as identity primary key,
  kind text not null check (kind in ('exec','ageing')),
  report_date date not null,
  data jsonb not null,
  uploaded_by uuid default auth.uid(),
  uploaded_at timestamptz not null default now()
);
create table public.admins (user_id uuid primary key references auth.users(id) on delete cascade);
alter table public.reports enable row level security;
alter table public.admins enable row level security;
-- Any signed-in (admin-created) user can read.
create policy "signed-in users read reports" on public.reports for select to authenticated using (true);
-- Only admins can add data. There is deliberately NO update/delete policy: uploaded history can never be changed through the app.
create policy "admins add reports" on public.reports for insert to authenticated
  with check (exists (select 1 from public.admins a where a.user_id = auth.uid()));
create policy "user can see own admin row" on public.admins for select to authenticated using (user_id = auth.uid());
-- Live updates to everyone's open app
alter publication supabase_realtime add table public.reports;
