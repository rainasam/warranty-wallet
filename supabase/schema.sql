-- Warranty Wallet — initial schema (Phase 0)
-- Run this in the Supabase SQL Editor (Project > SQL Editor > New query).

-- 1. profiles: one row per auth.users, holds app-specific fields (plan, etc.)
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  name text,
  plan text not null default 'free' check (plan in ('free', 'paid')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles: user can view own" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles: user can update own" on public.profiles
  for update using (auth.uid() = id);

-- auto-create a profile row whenever a new auth user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. products
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  category text not null,
  name text not null,
  brand text,
  model text,
  purchase_date date,
  retailer text,
  price numeric,
  notes text,
  invoice_file text,
  created_at timestamptz not null default now()
);

alter table public.products enable row level security;

create policy "products: user manages own" on public.products
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index if not exists products_user_id_idx on public.products (user_id);

-- 3. warranty_periods
create table if not exists public.warranty_periods (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  type text not null check (type in ('standard', 'extended')),
  start_date date not null,
  end_date date not null,
  provider text,
  document_file text,
  created_at timestamptz not null default now()
);

alter table public.warranty_periods enable row level security;

create policy "warranty_periods: user manages own via product" on public.warranty_periods
  for all using (
    exists (
      select 1 from public.products
      where products.id = warranty_periods.product_id
      and products.user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.products
      where products.id = warranty_periods.product_id
      and products.user_id = auth.uid()
    )
  );

create index if not exists warranty_periods_product_id_idx on public.warranty_periods (product_id);

-- 4. amc_contracts
create table if not exists public.amc_contracts (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  provider text,
  start_date date not null,
  end_date date not null,
  cost numeric,
  maintenance_interval_months integer,
  document_file text,
  created_at timestamptz not null default now()
);

alter table public.amc_contracts enable row level security;

create policy "amc_contracts: user manages own via product" on public.amc_contracts
  for all using (
    exists (
      select 1 from public.products
      where products.id = amc_contracts.product_id
      and products.user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.products
      where products.id = amc_contracts.product_id
      and products.user_id = auth.uid()
    )
  );

create index if not exists amc_contracts_product_id_idx on public.amc_contracts (product_id);

-- 5. service_records
create table if not exists public.service_records (
  id uuid primary key default gen_random_uuid(),
  amc_contract_id uuid references public.amc_contracts (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  service_date date not null,
  technician text,
  notes text,
  cost numeric,
  document_file text,
  next_due_date date,
  created_at timestamptz not null default now()
);

alter table public.service_records enable row level security;

create policy "service_records: user manages own via product" on public.service_records
  for all using (
    exists (
      select 1 from public.products
      where products.id = service_records.product_id
      and products.user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.products
      where products.id = service_records.product_id
      and products.user_id = auth.uid()
    )
  );

create index if not exists service_records_product_id_idx on public.service_records (product_id);

-- 6. reminder_log
create table if not exists public.reminder_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  related_entity_type text not null check (related_entity_type in ('warranty', 'amc', 'service')),
  related_entity_id uuid not null,
  threshold text not null,
  channel text not null default 'email',
  sent_at timestamptz,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

alter table public.reminder_log enable row level security;

create policy "reminder_log: user views own" on public.reminder_log
  for select using (auth.uid() = user_id);

create index if not exists reminder_log_user_id_idx on public.reminder_log (user_id);

-- 7. Storage: run this AFTER creating a private "documents" bucket in
-- Supabase Dashboard > Storage > New bucket (name: documents, Public: off).
-- Files are stored under `${user_id}/...`, so these policies scope access
-- to the folder matching the requesting user's id.

create policy "documents: users can upload to own folder" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "documents: users can view own files" on storage.objects
  for select to authenticated
  using (bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "documents: users can delete own files" on storage.objects
  for delete to authenticated
  using (bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text);
