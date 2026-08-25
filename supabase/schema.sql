-- AgroBC — esquema de base de datos para el panel de administración de fertilizantes
-- Ejecutar en Supabase: Dashboard → SQL Editor → New query → pegar y correr todo.

-- 1) Tabla de fertilizantes que administra el admin
create table if not exists public.fertilizantes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  mfg text not null default '',
  presentation text not null default '',
  price numeric not null default 0,
  ficha_tecnica text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2) Tabla que marca qué usuarios (por su id de Supabase Auth) son administradores
create table if not exists public.admin_users (
  id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- 3) Mantener updated_at al día en cada edición
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_fertilizantes_updated_at on public.fertilizantes;
create trigger trg_fertilizantes_updated_at
  before update on public.fertilizantes
  for each row execute function public.set_updated_at();

-- 4) Seguridad a nivel de fila (RLS)
alter table public.fertilizantes enable row level security;
alter table public.admin_users enable row level security;

-- Cualquiera (incluso sin sesión) puede leer el catálogo de fertilizantes
drop policy if exists "fertilizantes_public_read" on public.fertilizantes;
create policy "fertilizantes_public_read"
  on public.fertilizantes for select
  using (true);

-- Solo quien esté en admin_users puede insertar/editar/eliminar
drop policy if exists "fertilizantes_admin_write" on public.fertilizantes;
create policy "fertilizantes_admin_write"
  on public.fertilizantes for all
  using (exists (select 1 from public.admin_users a where a.id = auth.uid()))
  with check (exists (select 1 from public.admin_users a where a.id = auth.uid()));

-- Nadie puede leer/escribir admin_users desde el cliente (solo se administra desde el SQL Editor)
drop policy if exists "admin_users_no_access" on public.admin_users;
create policy "admin_users_no_access"
  on public.admin_users for all
  using (false)
  with check (false);

-- 5) Función segura para que el cliente pregunte "¿el usuario logueado es admin?"
--    sin necesitar acceso directo de lectura a admin_users.
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (select 1 from public.admin_users a where a.id = auth.uid());
$$;

grant execute on function public.is_admin() to authenticated, anon;
