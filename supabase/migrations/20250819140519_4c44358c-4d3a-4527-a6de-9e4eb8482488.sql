-- 1) Create leads_access table and policies
create table if not exists public.leads_access (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  granted_by uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.leads_access enable row level security;

-- Policies for leads_access
-- Only founders can manage leads access (insert/update/delete/select all)
create policy "Founders can manage leads access"
  on public.leads_access
  for all
  to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'founder'
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'founder'
    )
  );

-- Allow users to view their own access status
create policy "Users can view their own leads access"
  on public.leads_access
  for select
  to authenticated
  using (user_id = auth.uid());

-- Helpful index
create index if not exists idx_leads_access_user on public.leads_access(user_id);

-- 2) Update leads RLS policies to restrict viewing/creating to founders or granted users
-- Drop overly permissive SELECT policy
drop policy if exists "Users can view all leads" on public.leads;

-- Select: founder, creator, or granted employees can view leads
create policy "View leads if founder, creator, or granted"
  on public.leads
  for select
  to authenticated
  using (
    (created_by = auth.uid())
    or exists (select 1 from public.leads_access la where la.user_id = auth.uid())
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'founder')
  );

-- Restrict INSERT to founder or granted employees
drop policy if exists "Users can create leads" on public.leads;
create policy "Founder or granted users can create leads"
  on public.leads
  for insert
  to authenticated
  with check (
    (created_by = auth.uid())
    and (
      exists (select 1 from public.leads_access la where la.user_id = auth.uid())
      or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'founder')
    )
  );