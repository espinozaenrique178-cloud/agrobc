-- AgroBC — esquema completo de base de datos (panel de administrador)
-- Ejecutar en Supabase: Dashboard → SQL Editor → New query → pegar todo y Run.
-- Es seguro volver a correr este script completo (usa "if not exists" / "or replace").

-- ============================================================
-- 0) admin_users + is_admin() — ya deberían existir de antes,
--    se dejan aquí por si este es tu primer run.
-- ============================================================
create table if not exists public.admin_users (
  id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admin_users enable row level security;
drop policy if exists "admin_users_no_access" on public.admin_users;
create policy "admin_users_no_access"
  on public.admin_users for all
  using (false) with check (false);

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (select 1 from public.admin_users a where a.id = auth.uid());
$$;
grant execute on function public.is_admin() to authenticated, anon;

-- Dale admin a tu cuenta (reemplaza el UID si es otra cuenta)
insert into public.admin_users (id) values ('7bde39f9-f9cd-47b4-a79f-f4c0d2c713b2')
on conflict (id) do nothing;

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ============================================================
-- 1) productos — TODO el catálogo (insecticidas, fungicidas,
--    herbicidas y fertilizantes), no solo fertilizantes.
-- ============================================================
create table if not exists public.productos (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in ('plaga','enfermedad','maleza','nutricion')),
  name text not null,
  mfg text not null default '',
  type text not null default '',
  ingredient text not null default '',
  presentation text not null default '',
  price numeric not null default 0,
  ficha_tecnica text not null default '',
  crops text[] not null default '{any}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_productos_updated_at on public.productos;
create trigger trg_productos_updated_at
  before update on public.productos
  for each row execute function public.set_updated_at();

alter table public.productos enable row level security;

drop policy if exists "productos_public_read" on public.productos;
create policy "productos_public_read"
  on public.productos for select
  using (true);

drop policy if exists "productos_admin_write" on public.productos;
create policy "productos_admin_write"
  on public.productos for all
  using (public.is_admin())
  with check (public.is_admin());

-- Migra lo que ya hubiera en `fertilizantes` (de la versión anterior del panel)
insert into public.productos (name, mfg, type, presentation, price, ficha_tecnica, category, crops)
select name, mfg, 'Fertilizante', presentation, price, ficha_tecnica, 'nutricion', '{any}'
from public.fertilizantes
where not exists (
  select 1 from public.productos p where p.name = fertilizantes.name and p.category = 'nutricion'
);

-- Catálogo inicial (el mismo que ya traía la demo) para que el admin
-- empiece con datos reales que editar, no una tabla vacía.
insert into public.productos (name, mfg, type, ingredient, presentation, price, category, crops)
select * from (values
  ('Sivanto Prime','Bayer','Insecticida','Flupyradifurona','1 L',480,'plaga','{Tomate,Fresa,Chile,Pepino,Lechuga}'::text[]),
  ('Confidor','Bayer','Insecticida','Imidacloprid','1 L',410,'plaga','{Tomate,Cebolla,Brócoli}'::text[]),
  ('Decis','Bayer','Insecticida','Deltametrina','500 ml',365,'plaga','{Fresa,Chile,Lechuga}'::text[]),
  ('Movento','Bayer','Insecticida','Espirotetramat','1 L',590,'plaga','{Vid,Aguacate}'::text[]),
  ('Fitoraz','Bayer','Fungicida','Propineb + Cimoxanilo','1 kg',445,'enfermedad','{Tomate,Vid,Aguacate}'::text[]),
  ('Aliette','Bayer','Fungicida','Fosetil-Al','1 kg',520,'enfermedad','{Vid,Aguacate,Fresa}'::text[]),
  ('Actara','Syngenta','Insecticida','Tiametoxam','1 kg',520,'plaga','{Tomate,Chile,Lechuga,Brócoli}'::text[]),
  ('Engeo','Syngenta','Insecticida','Tiametoxam + Lambdacihalotrina','1 L',610,'plaga','{Fresa,Pepino,Chile}'::text[]),
  ('Amistar','Syngenta','Fungicida','Azoxistrobina','1 L',680,'enfermedad','{Tomate,Vid,Fresa}'::text[]),
  ('Gramoxone','Syngenta','Herbicida','Paraquat','5 L',390,'maleza','{any}'::text[]),
  ('Coragen','Corteva','Insecticida','Clorantraniliprol','1 L',730,'plaga','{Tomate,Chile,Lechuga,Brócoli}'::text[]),
  ('Lannate','Corteva','Insecticida','Metomilo','1 L',340,'plaga','{Tomate,Fresa,Pepino}'::text[]),
  ('Tordon','Corteva','Herbicida','Picloram','1 L',455,'maleza','{Trigo,Alfalfa}'::text[]),
  ('Lancer Gold','UPL','Insecticida','Acetamiprid','500 g',295,'plaga','{Tomate,Chile}'::text[]),
  ('Manzate','UPL','Fungicida','Mancozeb','1 kg',260,'enfermedad','{Tomate,Fresa,Vid,Cebolla}'::text[]),
  ('Cabrio','BASF','Fungicida','Piraclostrobina','1 L',715,'enfermedad','{Vid,Fresa,Aguacate}'::text[]),
  ('Priori Xtra','BASF','Fungicida','Azoxistrobina + Ciproconazol','1 L',750,'enfermedad','{Tomate,Cebolla,Lechuga}'::text[]),
  ('Basta','BASF','Herbicida','Glufosinato de amonio','1 L',470,'maleza','{any}'::text[])
) as seed(name, mfg, type, ingredient, presentation, price, category, crops)
where not exists (select 1 from public.productos p where p.name = seed.name and p.category = seed.category::text);

-- ============================================================
-- 2) crops — cultivos administrables (en vez de una lista fija)
-- ============================================================
create table if not exists public.crops (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  emoji text not null default '🌱',
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.crops enable row level security;
drop policy if exists "crops_public_read" on public.crops;
create policy "crops_public_read" on public.crops for select using (true);
drop policy if exists "crops_admin_write" on public.crops;
create policy "crops_admin_write" on public.crops for all
  using (public.is_admin()) with check (public.is_admin());

insert into public.crops (name, emoji, sort_order)
select * from (values
  ('Tomate','🍅',1),('Fresa','🍓',2),('Trigo','🌾',3),('Lechuga','🥬',4),
  ('Pepino','🥒',5),('Vid','🍇',6),('Chile','🌶️',7),('Cebolla','🧅',8),
  ('Brócoli','🥦',9),('Aguacate','🥑',10),('Espárrago','🌱',11),('Alfalfa','🌾',12)
) as seed(name, emoji, sort_order)
where not exists (select 1 from public.crops c where c.name = seed.name);

-- ============================================================
-- 3) search_logs — analítica de qué busca la gente
-- ============================================================
create table if not exists public.search_logs (
  id uuid primary key default gen_random_uuid(),
  crop text not null,
  problem text not null,
  category text,
  created_at timestamptz not null default now()
);

alter table public.search_logs enable row level security;

-- Cualquiera puede REGISTRAR una búsqueda (insert), pero nadie puede leer
-- la tabla directamente: solo se consulta agregada vía search_stats().
drop policy if exists "search_logs_public_insert" on public.search_logs;
create policy "search_logs_public_insert"
  on public.search_logs for insert
  with check (true);

drop policy if exists "search_logs_no_read" on public.search_logs;
create policy "search_logs_no_read"
  on public.search_logs for select
  using (false);

create or replace function public.search_stats()
returns table(crop text, problem text, category text, total bigint)
language sql
security definer
set search_path = public
as $$
  select crop, problem, category, count(*) as total
  from public.search_logs
  where public.is_admin()
  group by crop, problem, category
  order by total desc
  limit 50;
$$;
grant execute on function public.search_stats() to authenticated, anon;

create or replace function public.search_totals()
returns table(total_searches bigint, total_since timestamptz)
language sql
security definer
set search_path = public
as $$
  select count(*), min(created_at) from public.search_logs where public.is_admin();
$$;
grant execute on function public.search_totals() to authenticated, anon;

-- ============================================================
-- 4) site_content — textos editables del sitio (mini CMS)
-- ============================================================
create table if not exists public.site_content (
  key text primary key,
  value text not null default '',
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_site_content_updated_at on public.site_content;
create trigger trg_site_content_updated_at
  before update on public.site_content
  for each row execute function public.set_updated_at();

alter table public.site_content enable row level security;
drop policy if exists "site_content_public_read" on public.site_content;
create policy "site_content_public_read" on public.site_content for select using (true);
drop policy if exists "site_content_admin_write" on public.site_content;
create policy "site_content_admin_write" on public.site_content for all
  using (public.is_admin()) with check (public.is_admin());

insert into public.site_content (key, value) values
  ('hero_eyebrow', 'Baja California · Piloto 2026'),
  ('hero_title', 'Busca un cultivo y un problema.'),
  ('hero_title_accent', 'Compara antes de comprar.'),
  ('hero_lede', 'AgroBC reúne los productos agrícolas disponibles en Baja California —fertilizantes, insecticidas, fungicidas y más— para que agricultores y agrónomos comparen ficha técnica, presentación y precio en un solo lugar, sin favoritismos de marca.'),
  ('como_funciona_lede', 'Empezamos acotados a propósito: solo Baja California, solo los cultivos más relevantes de la región, para poder validar con productores y agrónomos reales antes de crecer.'),
  ('validar_lede', 'Antes de construir el ecosistema completo —cuentas de fabricante, catálogo nacional, historial— queremos confirmar algo simple: ¿esto le resuelve un problema real a quien compra insumos en Baja California?')
on conflict (key) do nothing;
