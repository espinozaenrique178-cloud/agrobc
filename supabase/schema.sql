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

-- ============================================================
-- 5) fabricantes / distribuidores — separados del producto.
--    Un producto pertenece a UN fabricante (quién lo produce) y puede
--    tener VARIOS distribuidores (quién lo vende) vía la tabla puente
--    producto_distribuidores. Esto permite que, al importar el catálogo
--    de otro distribuidor más adelante, un producto ya existente
--    (mismo fabricante + mismo grado/fórmula) solo sume un distribuidor
--    nuevo en vez de duplicarse.
-- ============================================================
create table if not exists public.fabricantes (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);
alter table public.fabricantes enable row level security;
drop policy if exists "fabricantes_public_read" on public.fabricantes;
create policy "fabricantes_public_read" on public.fabricantes for select using (true);
drop policy if exists "fabricantes_admin_write" on public.fabricantes;
create policy "fabricantes_admin_write" on public.fabricantes for all
  using (public.is_admin()) with check (public.is_admin());

create table if not exists public.distribuidores (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);
alter table public.distribuidores enable row level security;
drop policy if exists "distribuidores_public_read" on public.distribuidores;
create policy "distribuidores_public_read" on public.distribuidores for select using (true);
drop policy if exists "distribuidores_admin_write" on public.distribuidores;
create policy "distribuidores_admin_write" on public.distribuidores for all
  using (public.is_admin()) with check (public.is_admin());

create table if not exists public.producto_distribuidores (
  producto_id uuid not null references public.productos(id) on delete cascade,
  distribuidor_id uuid not null references public.distribuidores(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (producto_id, distribuidor_id)
);
alter table public.producto_distribuidores enable row level security;
drop policy if exists "producto_distribuidores_public_read" on public.producto_distribuidores;
create policy "producto_distribuidores_public_read" on public.producto_distribuidores for select using (true);
drop policy if exists "producto_distribuidores_admin_write" on public.producto_distribuidores;
create policy "producto_distribuidores_admin_write" on public.producto_distribuidores for all
  using (public.is_admin()) with check (public.is_admin());

-- Columnas nuevas en productos: fabricante estructurado + datos de ficha
-- técnica de fertilizantes. Quedan nulas/default para el resto del catálogo
-- (insecticidas/fungicidas/herbicidas), que sigue usando el campo `mfg`
-- de texto tal como antes — no se tocó nada de lo existente.
alter table public.productos add column if not exists fabricante_id uuid references public.fabricantes(id);
alter table public.productos add column if not exists grado_formula text;
alter table public.productos add column if not exists subcategoria text;
alter table public.productos add column if not exists n_pct text;
alter table public.productos add column if not exists p_pct text;
alter table public.productos add column if not exists k_pct text;
alter table public.productos add column if not exists s_pct text;
alter table public.productos add column if not exists ca_pct text;
alter table public.productos add column if not exists mg_pct text;
alter table public.productos add column if not exists otros_micronutrientes text;
alter table public.productos add column if not exists caracteristicas_fisicas text;
alter table public.productos add column if not exists compatibilidad text;
alter table public.productos add column if not exists incompatibilidad text;
alter table public.productos add column if not exists uso_dosis text;
alter table public.productos add column if not exists notas text;
alter table public.productos add column if not exists ficha_completa boolean not null default true;
alter table public.productos add column if not exists verificar_con_proveedor boolean not null default false;

-- ============================================================
-- 6) Catálogo de fertilizantes — Servicios NH3 (snh3.com.mx)
--    Generado automáticamente desde fichas_fertilizantes_NH3.xlsx
--    (37 productos, extraídos el 10 de septiembre de 2026).
--    Es seguro volver a correr: usa "where not exists" en todo.
-- ============================================================

insert into public.fabricantes (name)
select * from (values
  ('SQM'),
  ('Servicios NH3'),
  ('Wolf Trax'),
  ('Yara')
) as v(name)
where not exists (select 1 from public.fabricantes f where f.name = v.name);

insert into public.distribuidores (name)
select * from (values ('Servicios NH3')) as v(name)
where not exists (select 1 from public.distribuidores d where d.name = v.name);

insert into public.productos (
  name, mfg, type, ingredient, presentation, price, category, crops,
  ficha_tecnica, fabricante_id, grado_formula, subcategoria,
  n_pct, p_pct, k_pct, s_pct, ca_pct, mg_pct, otros_micronutrientes,
  caracteristicas_fisicas, compatibilidad, incompatibilidad, uso_dosis,
  notas, ficha_completa, verificar_con_proveedor
)
select
  v.name, v.mfg, 'Fertilizante', v.grado_formula, v.presentation, 0, 'nutricion', v.crops,
  v.ficha_tecnica, (select id from public.fabricantes f where f.name = v.mfg),
  v.grado_formula, v.subcategoria,
  v.n_pct, v.p_pct, v.k_pct, v.s_pct, v.ca_pct, v.mg_pct, v.otros_micronutrientes,
  v.caracteristicas_fisicas, v.compatibilidad, v.incompatibilidad, v.uso_dosis,
  v.notas, v.ficha_completa, v.verificar_con_proveedor
from (values
  ('Urea Granulada', 'Servicios NH3', '46-00-00 / CH4N2O', 'Granulado', 'http://www.snh3.com.mx/pdf/1.-%20Urea%20Granulada.pdf', 'Granulados', '46%', '0%', '0%', '0%', '0%', '0%', 'Biuret 0.5-1.5%', 'Gránulos blancos, 2-4.75mm, humedad 0.02%, sol. 1200g/L a 20°C, pH 7', 'ESN, Microessentials SZ, DAP, MAP, Cloruro de Potasio, Sulfato de Potasio, K-Mag', 'Nitrato de Amonio, CAN27, Sulfonit, Súper Fosfato Simple/Triple, productos con Calcio o moléculas de agua (Sulfato de Mg heptahidratado, Sulfato de Cobre pentahidratado)', 'Cereales, frutales, hortalizas. Aplicar directo al suelo e incorporar (evita pérdida por sublimación); fraccionar para evitar lixiviación. Soluble, sirve para fertirriego. Almacenar bajo techo.', null, true, false, '{"any"}'::text[]),
  ('Nitrato de Amonio (CAN 27)', 'Servicios NH3', '27-00-00-9Ca-3Mg', 'Granulado', 'http://www.snh3.com.mx/pdf/2.-%20Nitrato%20de%20Amonio.pdf', 'Granulados', '27% (NO3 13.4% / NH4 13.6%)', '0%', '0%', 'SO4 5.71%', 'CaO 9.0%', 'MgO 3.0%', null, 'Gránulos color café, 4-5mm, humedad 0.24%, pH 7.1', 'ESN, Microessentials SZ, DAP, MAP, K-Mag, Cloruro/Sulfato de Potasio (compat. limitada, puede reaccionar a 15 días)', 'Urea, Carbonato de Calcio, sales básicas, Superfosfato Triple, productos con moléculas de agua', 'Maíz, frijol, trigo, sorgo, pastos; arranque o fondo, manual o mecánico. Dosis según análisis de suelo.', null, true, false, '{"Maíz","Frijol","Trigo","Sorgo","Pastos y praderas"}'::text[]),
  ('Sulfonit', 'Servicios NH3', '33-00-00-3S / (NH4)NO3', 'Granulado', 'http://www.snh3.com.mx/pdf/3%20-%20Sulfonit.pdf', 'Granulados', '32.5% (NO3 15.25% / NH4 17.25%)', '0%', '0%', 'SO4 5.71%', '0%', '0%', null, 'Cristal blanco, 1-4mm, humedad 0.3%, sol. 1000g/L a 20°C, pH 6.8-7', 'ESN, Microessentials SZ, DAP, MAP, Cloruro/Sulfato de Potasio, K-Mag', 'Urea, CAN27, Carbonato de Calcio, sales básicas, Sulfato de Mg heptahidratado', 'Maíz, frijol, trigo, sorgo, pastos. Ideal para fertirriego (NH4+NO3, alta solubilidad).', null, true, false, '{"Maíz","Frijol","Trigo","Sorgo","Pastos y praderas"}'::text[]),
  ('Sulfato de Amonio Estándar', 'Servicios NH3', '21-00-00-24S / (NH4)2SO4', 'Granulado', 'http://www.snh3.com.mx/pdf/4.-%20Sulfato%20de%20Amonio%20Estandar.pdf', 'Granulados', '21%', '0%', '0%', '24%', '0%', '0%', null, 'Cristal blanco, 1-2mm, humedad 0.02%, sol. 770g/L a 20°C, pH 4.5-6', 'ESN, Urea, Microessentials SZ, DAP, MAP, Cloruro/Sulfato de Potasio, K-Mag (evitar mezclar por diferencia de granulometría)', null, 'Maíz, frijol, trigo, sorgo, pastos. Dosis según análisis de suelo.', null, true, false, '{"Maíz","Frijol","Trigo","Sorgo","Pastos y praderas"}'::text[]),
  ('Sulfato de Amonio Granulado', 'Servicios NH3', '21-00-00-24S / (NH4)2SO4', 'Granulado', 'http://www.snh3.com.mx/pdf/sulfato-de-amonio-granulado.pdf', 'Granulados', '21%', '0%', '0%', '24%', '0%', '0%', null, 'Cristal blanco, 2-4.5mm, humedad 0.02%, ángulo reposo 28°, 100% soluble', 'ESN, Urea, Microessentials SZ, DAP, MAP, Cloruro/Sulfato de Potasio, K-Mag', 'Productos con moléculas de agua (Sulfato de Mg), Calcio, sales básicas', 'Igual que estándar: maíz, frijol, trigo, sorgo, pastos.', null, true, false, '{"Maíz","Frijol","Trigo","Sorgo","Pastos y praderas"}'::text[]),
  ('Nitrato de Calcio (YaraLiva Tropicote)', 'Yara', '15.5-0-0', 'Granulado', 'http://www.snh3.com.mx/pdf/nitrato-de-calcio.pdf', 'Granulados', '15% (Nítrico 14.4% / Amoniacal 1.1%)', '0%', '0%', '0%', '19.0% Ca / CaO 27%', '0%', null, 'Granulado blanco sin polvo, higroscópico (requiere sellarse tras abrir), con "coating" hidrófugo', null, null, 'Fuente de N de cobertura de acción rápida + Ca soluble. Previene Bitter Pit (manzana/pera), pudrición apical (BER) en tomate, bordes quemados en lechuga/col. Mejora resistencia a hongos y estrés térmico.', 'Datos obtenidos de captura de imagen (PDF sin texto seleccionable)', true, false, '{"Manzana","Pera","Tomate","Lechuga","Col (repollo)"}'::text[]),
  ('Fosfato Monoamónico (MAP)', 'Servicios NH3', '11-52-0', 'Granulado', 'http://www.snh3.com.mx/pdf/fosfato-monoamonico.pdf', 'Granulados', '11% (100% amoniacal)', '52% P2O5 (27% P)', '0%', '1.8%', '0%', '0%', null, 'Polvo/gránulo; ángulo reposo 30°, pH (20% sol.) 4.0, sol. en agua 94% del P2O5', null, null, 'Arranque en granos pequeños, cultivos en surco, árboles, forraje. Reduce riesgo de daño a semilla. Efecto ácido ayuda en suelos calcáreos.', null, true, false, '{"any"}'::text[]),
  ('Micro Essentials SZ', 'Servicios NH3', '12-40-0-10S-1Zn', 'Granulado', 'http://www.snh3.com.mx/pdf/microessencials.pdf', 'Granulados', '12% amoniacal', '40% P2O5 (36% soluble en agua)', '0%', '10% (S elemental 5%)', '0%', '0%', 'Zn 1%', 'Gránulo gris oscuro, humedad 0.84%, granulometría 1-4mm 98%', 'ESN, Urea, Cloruro/Sulfato de Potasio, K-Mag', null, 'Grano, hortalizas, frutales, ornamentales. N y P influyen en raíz/tallo/follaje/flor/fruto.', null, true, false, '{"any"}'::text[]),
  ('KMag Premium (Sulfato de Potasio/Magnesio)', 'Servicios NH3', '00-00-22-11Mg-22S', 'Granulado', 'http://www.snh3.com.mx/pdf/sulfato-potasio-magnesio.pdf', 'Granulados', '0%', '0%', '22% K2O (18.26% K)', '22% (SO4 67.0%)', '0%', '18% MgO (11.0% Mg)', null, 'Gránulo gris, 2-4mm, densidad 1.3g/cm3, ángulo reposo 33°, humedad 0.20%, pH sol.10%=7.0', 'ESN, Urea, Sulfato de Amonio, Cloruro de Potasio, DAP, MAP', null, 'Grano, hortalizas, frutales, ornamentales. K influye en crecimiento/calidad de raíz/tallo/follaje/flor/fruto. Mineral de mina langbeinita, bajo cloro.', null, true, false, '{"any"}'::text[]),
  ('Yara Mila 15-15-15', 'Yara', '15-15-15', 'Granulado', 'http://www.snh3.com.mx/pdf/yara-mila.pdf', 'Granulados', '15.0% (Nitratos 6.3% / Amoniacal 8.7%)', '15.0% P2O5', '15.0% K2O', '6.1%', '0%', '0%', null, 'Prilado, color plomo, densidad 70lb/ft3, granulometría 2-4mm 87%, ángulo reposo 26°', null, null, 'N-P-K homogéneo por gránulo (sin segregación). Base SOP (bajo cloro), poli+ortofosfatos. Cultivos de alto valor.', null, true, false, '{"any"}'::text[]),
  ('Yeso Agrícola Soluble (SoluGyp)', 'Servicios NH3', 'Sulfato de Calcio (CaSO4·2H2O)', 'Granulado', 'http://www.snh3.com.mx/pdf/yeso-agricola.pdf', 'Granulados', '0%', '0%', '0%', '16-18%', '18-22%', '0%', null, 'Polvo blanco, saco 25kg, pureza 90-96%, pH 7-7.5, sol. 0.5g/100mL H2O', null, null, 'Uso en fertirriego (goteo, aspersión, entubado). Cultivos: almendra, cítricos, algodón, uva, durazno/manzana/fresa, aguacate, caña/papa, tomate/chile/lechuga/zanahoria. Mejora estructura del suelo y penetración de agua; corrige exceso de sodio.', null, true, false, '{"Algodón hueso","Uva","Vid","Durazno","Manzana","Fresa","Aguacate","Caña de azúcar","Papa","Tomate","Chile","Lechuga","Zanahoria"}'::text[]),
  ('MAP Técnico (MAP-T)', 'Servicios NH3', '100% soluble / NH4H2PO4', 'Granulado o líquido', 'http://www.snh3.com.mx/pdf/map-tecnico.pdf', 'Granulados/Líquidos', '12.0% mín (100% amoniacal)', '61.0% P2O5 mín (27.0% P mín)', '0%', '0%', '0%', '0%', null, 'Polvo blanco, humedad 0.2% máx, pH(1%) 4.3-5.0, densidad ~1.0g/cm3', null, null, 'Ideal para fertirriego. Solubilidad sube con temperatura (227 g/1000g a 0°C hasta 567 g/1000g a 40°C).', null, true, false, '{"any"}'::text[]),
  ('MKP - Fosfato Monopotásico', 'Servicios NH3', '0-52-34 / KH2PO4', 'Granulado', 'http://www.snh3.com.mx/pdf/mkp.pdf', 'Granulados', '0%', '52% P2O5', '34% K2O', '0%', '0%', '0%', 'CAS 7778-77-0', 'Cristalino blanco, inodoro, pH 4.2-4.5 (208g/L a 20°C), densidad a granel 1150-1200 kg/m3', null, null, 'No clasificado como peligroso; no inflamable, no explosivo. (Ficha disponible = Hoja de Seguridad, no ficha agronómica)', 'PDF publicado es Hoja de Seguridad (MSDS), no ficha técnica agronómica', true, false, '{"any"}'::text[]),
  ('Sulfato de Potasio Ultra Soluble', 'Servicios NH3', '00-00-51-18S / K2SO4', 'Granulado', 'http://www.snh3.com.mx/pdf/sulfato-de-potasio-ultrasoluble.pdf', 'Granulados', '0%', '0%', '51.0% K2O (42.33% K)', '18.6% (SO4 56.0%)', '0%', '0%', 'Cl 0.8% (bajo cloro)', 'Polvo blanco, insolubles <0.2%, pH(1%)=2.7', null, null, 'Libre de Cloro y Sodio. Aporta K sin N; ideal en cultivos sensibles al cloro. Usos: foliar, fertilizantes líquidos, fertirriego. Solubilidad 135g/1000mL a 20°C.', null, true, false, '{"any"}'::text[]),
  ('Sulfato de Magnesio Heptahidratado', 'Servicios NH3', 'MgSO4·7H2O', 'Granulado', 'http://www.snh3.com.mx/pdf/sulfato-magnesio-heptahidratado.pdf', 'Granulados', '0%', '0%', '0%', '12.84% mín', '0%', '16.18% MgO / 9.73% Mg (mín)', 'Pureza 98.7% mín, Cloruro 0.6% máx', 'Cristales rómbicos de alta pureza y solubilidad, obtenido de salmueras naturales', null, null, 'Aporta Mg esencial para clorofila; incrementa fotosíntesis y asimilación de P. Uso en producción orgánica, al suelo, fertirriego y foliar. Fuente mineral para mezclas de uso pecuario.', 'Datos obtenidos de captura de imagen (PDF sin texto seleccionable)', true, false, '{"any"}'::text[]),
  ('Ultrasol Inicial (SQM)', 'SQM', '15-30-15+1MgO+1S+M.E.', 'Líquido', 'http://www.snh3.com.mx/pdf/ultrasol-inicial.pdf', 'Líquidos', '15% (50% nítrico/50% amoniacal)', '30% P2O5', '15% K2O', '1%', '0%', '1% MgO', 'Fe/Zn/Mn/Cu/B/Mo según versión Norte/Centro/Sur (ver ficha)', 'Cristales blancos (versión Norte: levemente rojizos)', null, null, 'Estimula formación de raíces, tallos y hojas. CE(1g/L)=1.28dS/m, pH=4.84, solubilidad 150g/L a 15°C.', null, true, false, '{"any"}'::text[]),
  ('UMA Especial Crecimiento (Ultrasol Crecimiento SQM)', 'SQM', '25-10-10+1MgO+1S+M.E.', 'Líquido', 'http://www.snh3.com.mx/pdf/uma-crecimiento.pdf', 'Líquidos', '25% (50% nítrico/50% amoniacal)', '10% P2O5', '10% K2O', '1%', '0%', '1% MgO', 'Fe/Zn/Mn/Cu/B/Mo según versión Norte/Centro/Sur', 'Cristales blancos', null, null, 'Para etapa de crecimiento vegetativo. CE(1g/L)=1.43dS/m, pH=5.03, solubilidad 250g/L a 15°C.', null, true, false, '{"any"}'::text[]),
  ('NPK Máxima Triple 18', 'Servicios NH3', '18-18-18+1.8S+0.7MgO+M.E.', 'Líquido', 'http://www.snh3.com.mx/pdf/npk-triple-18.pdf', 'Líquidos', '18% (Nitrato 9.65%/Amonio 8.35%)', '18% P2O5 (7.85% P)', '18% K2O (14.94% K)', '1.8% (SO4 5.4%)', '0%', '0.7% MgO (0.42% Mg)', 'Fe 525ppm, Zn 49ppm, Mn 245ppm, Cu 19.6ppm, B 45.5ppm, Mo 21.0ppm', 'Polvo azul, insolubles <0.04%', null, null, '100% soluble, relación N-P-K 1:1:1 para etapa vegetativa. Fertirriego y foliar (dosis foliar 1-2%). Solubilidad 400g/1000g a 20°C, pH(1g/L)=5.52.', 'En el sitio, el mismo PDF también se usa para el listado "N-P-K líquido"', true, false, '{"any"}'::text[]),
  ('NKMG Ultrasoluble (Nitrato de Potasio + Magnesio)', 'Servicios NH3', 'N1:K3.5 / 100% soluble', 'Líquido', 'http://www.snh3.com.mx/pdf/nkmg-ultrasoluble.pdf', 'Líquidos', 'NO3 13.4%', '0%', '45.1% K2O (37.4% K)', '0%', '0%', '0.5% Mg', 'Insolubles 0.03%, agente anti-apelmazante 0.12%', 'Densidad 1.0-1.15 t/m3, pH 5.0-7.0', null, null, 'Libre de Cloro y Sodio. Solubilidad sube con temperatura (139g/1000g a 0°C hasta 613g/1000g a 40°C).', null, true, false, '{"any"}'::text[]),
  ('NPK Máxima Producción', 'Servicios NH3', '12-05-35+5S+0.7MgO+M.E.', 'Líquido', 'http://www.snh3.com.mx/pdf/npk-maxima-produccion.pdf', 'Líquidos', '12% (Nitrato 8.5%/Amonio 3.3%)', '5.0% P2O5 (2.1% P)', '35.0% K2O (29.05% K)', '5.0% (SO4 15.0%)', '0%', '0.7% MgO (0.42% Mg)', 'Fe 525ppm, Zn 49ppm, Mn 245ppm, Cu 19.6ppm, B 45.5ppm, Mo 21ppm', 'Polvo azul, insolubles <0.03%', null, null, 'Para fase reproductiva (floración/cuaje) o alta demanda de K. Relación N-P-K 1:0.3:2.3. Solubilidad 380g/1000g a 20°C, pH(1g/L)=5.8.', null, true, false, '{"any"}'::text[]),
  ('Amoníaco Anhidro', 'Servicios NH3', '82-00-00 / NH3', 'Líquido', 'http://www.snh3.com.mx/pdf/amoniaco.pdf', 'Líquidos', '82% (equiv. N, pureza 99.5% min)', '0%', '0%', '0%', '0%', '0%', null, 'Pureza 99.50% mín (típico 99.61%), agua 0.50% máx', null, null, 'Fuente de N más concentrada. Grasas/aceite máx 10 ppm.', null, true, false, '{"any"}'::text[]),
  ('UAN-32 (Nitrato de Amonio + Urea)', 'Servicios NH3', '32-00-00', 'Líquido', 'http://www.snh3.com.mx/pdf/nitrato-de-amonio-urea.pdf', 'Líquidos', '32% (7.75% amoniacal / 7.75% nitratos / 16.50% urea)', '0%', '0%', '0%', '0%', '0%', null, 'Peso específico 1.327 a 68°F, 11.06 lbs/gal', 'MAP líquido (10-34-0, 11-37-0, 9-30-0), cloruro/fosfato de potasio y amonio, muchos herbicidas (verificar etiqueta)', 'No usar cobre/aleaciones en almacén/transferencia; no mezclar con agua amoniacal', 'Presiembra, inyectado, en banda o vía riego. Fuente de N en mezclas líquidas con herbicidas. No rociar sobre pastos.', null, true, false, '{"any"}'::text[]),
  ('Ácido Sulfúrico + Urea', 'Servicios NH3', '10-0-0-18S', 'Líquido', 'http://www.snh3.com.mx/pdf/acido-sulfurico-urea.pdf', 'Líquidos', '10.0%', '0%', '0%', '18.0% (equiv. H2SO4 55.0%)', '0%', '0%', null, 'Peso específico 1.54 a 68°F, viscosidad 25cps, pH(10%)<1.0, precipita a 49±3°F', null, null, 'Fuente líquida combinada de N y S, acidificante.', null, true, false, '{"any"}'::text[]),
  ('Ácido Sulfúrico', 'Servicios NH3', '10-0-0-18S (según PDF publicado en el sitio)', 'Líquido', 'http://www.snh3.com.mx/pdf/acido-sulfurico-2.pdf', 'Líquidos', '10.0%', '0%', '0%', '18.0% (equiv. H2SO4 55.0%)', '0%', '0%', null, 'Igual a Ácido Sulfúrico + Urea', null, null, null, 'El enlace de "Ácido Sulfúrico" en el sitio apunta al mismo PDF que "Ácido Sulfúrico + Urea" (10-0-0-18S) — posible error del proveedor; no hay ficha específica de ácido sulfúrico puro', true, true, '{"any"}'::text[]),
  ('Polifosfato de Amonio', 'Servicios NH3', '11-37-0', 'Líquido', 'http://www.snh3.com.mx/pdf/polifosfato-de-amonio.pdf', 'Líquidos', '11.0% (100% amoniacal)', '37.0% P2O5 (71% polifosfato / 29% ortofosfato)', '0%', '0%', '0%', '0%', null, 'Peso 12.0 lbs/gal, viscosidad 100cps, pH 6.08, precipita a 32°F', 'La mayoría de fertilizantes líquidos', 'Agua amoniacal o amoníaco anhidro', 'Fuente soluble de acción rápida; ideal en mezclas líquidas para tomate, betabel, maíz, algodón, granos pequeños.', null, true, false, '{"Tomate","Betabel","Maíz","Algodón hueso"}'::text[]),
  ('N-P-K Líquido (listado en sitio)', 'Servicios NH3', '10-10-5', 'Líquido', 'http://www.snh3.com.mx/pdf/npk-triple-18.pdf', 'Líquidos', '10%', '10% P2O5', '5% K2O', '3.4%', '0%', '0%', null, '(el PDF vinculado en el sitio es el de NPK Máxima Triple 18, ver esa fila)', null, null, null, 'El enlace de "N-P-K" (10-10-5) en el sitio apunta al PDF de NPK Máxima Triple 18 (18-18-18); los valores de composición mostrados en la página de listado (10-10-5-3.4S) no coinciden con la ficha técnica vinculada — verificar con el proveedor', true, true, '{"any"}'::text[]),
  ('Ácido Fosfórico', 'Servicios NH3', '0-53-0 (P2O5 disp. 34.0% según análisis garantizado)', 'Líquido', 'http://www.snh3.com.mx/pdf/acido-fosforico.pdf', 'Líquidos', '0%', '53.0% P2O5 total (34.0% disponible según ficha)', '0.01% K2O', '2.70% SO4', '0.07% CaO', '0.75% MgO', 'Al2O3 1.20%, Fe2O3 0.75%', 'Líquido, peso específico 1.695 a 75°F, pH 1.0', 'La mayoría de fertilizantes (evitar mezcla directa con amoníaco anhidro/agua amoniacal; no mezclar con nitratos como UAN-32)', 'Amoníaco anhidro/agua amoniacal (salvo condiciones controladas), materiales con nitratos', 'Corrige deficiencia de P; preplanta, inyectado al suelo/riego; agente anticostra (180-200 lbs diluido en banda sobre semilla).', null, true, false, '{"any"}'::text[]),
  ('Tiosulfato de Potasio (KTS)', 'Servicios NH3', '0-0-25-17S', 'Líquido', 'http://www.snh3.com.mx/pdf/tiosulfato-de-potasio.pdf', 'Líquidos', '0%', '0%', '25% K2O soluble', '17% S combinado', '0%', '0%', '367 g K2O/L y 250 g S/L por litro de producto', 'Solución líquida clara, pH básico a neutro', null, 'No aplicar al follaje de plantas susceptibles a quemadura por azufre', 'APLICACIÓN AL SUELO - Fertilización inicial: 10-30 L/Ha (solo o con otros fertilizantes de inicio), colocado 5cm debajo y 5cm al lado de la semilla. Fertilización en germinación: trigo/granos pequeños 4-8 L/Ha; maíz y algodón 5-10 L/Ha; tomate y cultivos de semilla pequeña 5-10 L/Ha. Banda lateral o inyectado con cuchilla (fuente de K y S): 10-200 L/Ha según análisis de suelo y cultivo. POR CULTIVO (banda lateral): Algodón: iniciar en la 2a semana de floración, 10-15 L/Ha, repetir cada 7-10 días (3-4 aplicaciones). Papa: al inicio de formación de tubérculos, 2a aplicación a las 2-3 semanas, 3a durante desarrollo de tubérculos. Granos pequeños: desde ahijamiento hasta que la espiga abulta el último nudo del tallo. Alfalfa: al reverdecer la corona o brotar después del corte. Chícharos/lentejas: desde botón floral hasta 10% de floración. Tomate: desde que pegan los primeros frutos, cada 7-14 días. Manzano, chabacano, almendro, cítricos, nogal: 4-12 L/Ha en mínimo 900 L de solución, desde brotación total de hojas, repitiendo según desarrollo (con menos agua, ej. 500 L/Ha, reducir proporcionalmente a 2-6 L/Ha de KTS). Vid: iniciar 2 semanas post-floración, 5-10 L en mínimo 500 L de agua, repetir cada 7-10 días. FERTIRRIEGO - Riego rodado (plano/surco): árboles y vides 80-120 L/aplicación desde brotación total; cultivos de hilera/hortalizas 80-120 L/aplicación (2a aplicación según necesidad). Riego por aspersión/microaspersión (árboles): 40-120 L/aplicación cada 10-14 días. Goteo: 120-350 mL por cada 1,000 m² cada 1-3 semanas (inyectado en cada riego o en aplicaciones menos frecuentes). ADVERTENCIA: no aplicar al follaje de plantas susceptibles a quemadura por azufre.', 'Ficha de 5 páginas (imagen escaneada); páginas 1-2 (composición y dosis por cultivo/fertirriego) transcritas completas. Páginas 3-5 son manejo/primeros auxilios tipo hoja de seguridad, no incluidas.', true, false, '{"Algodón hueso","Papa","Alfalfa","Chícharo","Lenteja","Tomate","Manzana","Chabacano","Vid"}'::text[]),
  ('Zinc (Wolf Trax DDP)', 'Wolf Trax', 'Recubrimiento de fertilizante granulado', 'Recubrimiento (microelemento)', 'http://www.snh3.com.mx/pdf/zinc.pdf', 'Microelementos', null, null, null, null, null, null, 'Zn (dosis por deficiencia)', 'Tecnología de recubrimiento para mezclar con fertilizantes granulados NPK', null, null, 'Dosis mantenimiento: 400-500 g/ha mezclado en NPK. Deficiencia moderada: 500g-2kg/ha + foliar. Deficiencia severa: igual + aplicación foliar subsecuente. Indicador en suelo: <0.7 ppm DTPA-Zn (moderada 0.5-0.7, severa <0.5).', 'Datos obtenidos de captura de imagen (PDF sin texto seleccionable)', true, false, '{"any"}'::text[]),
  ('Boro (Wolf Trax DDP)', 'Wolf Trax', 'Recubrimiento de fertilizante granulado', 'Recubrimiento (microelemento)', 'http://www.snh3.com.mx/pdf/boro.pdf', 'Microelementos', null, null, null, null, null, null, 'B (dosis por deficiencia)', 'Tecnología de recubrimiento para mezclar con fertilizantes granulados NPK', null, null, 'Dosis mantenimiento: 100-350 g/ha mezclado en NPK. Deficiencia moderada: 350-700g/ha + 1-2 aplicaciones foliares (200-300g/ha). Deficiencia severa: hasta 2.0kg/ha por año. Indicador en suelo: 1-2 ppm B en agua caliente (moderada 0.5-1, severa <0.5).', 'Datos obtenidos de captura de imagen (PDF sin texto seleccionable)', true, false, '{"any"}'::text[]),
  ('Calcio (ficha vinculada = "Calcio Boro", Colinagro)', 'Servicios NH3', 'Líquido foliar/suelo', 'Recubrimiento (microelemento)', 'http://www.snh3.com.mx/pdf/calcio.pdf', 'Microelementos', null, null, null, null, '56% CaO', null, '10% B', 'Líquido color marrón oscuro, densidad 1.180 g/mL, pH(10%)=7.2, presentación 1/4/20 L', 'No mezclar con fosforados salvo aplicación en la hora siguiente (riesgo hidrólisis)', null, 'Tomate/pimentón: 2L/ha x5 (c/15 días desde floración). Algodón: 2L/ha (65-90 días o sequía). Hortalizas: 2L/ha (día 30 y 50). Corrige pudrición apical, corazón vacío (apio), mancha corchosa (zanahoria).', 'El PDF vinculado en el sitio para "Calcio" es en realidad de un producto "Calcio Boro" de la empresa Colinagro (Colombia, registro ICA 771), distinto al resto del catálogo (Servicios NH3/Wolf Trax) — posible error del proveedor', true, true, '{"Tomate","Chile","Algodón hueso","Apio","Zanahoria"}'::text[]),
  ('Cobre (Wolf Trax DDP)', 'Wolf Trax', 'Recubrimiento de fertilizante granulado', 'Recubrimiento (microelemento)', 'http://www.snh3.com.mx/pdf/cobre.pdf', 'Microelementos', null, null, null, null, null, null, 'Cu (dosis por deficiencia)', 'Tecnología de recubrimiento para mezclar con fertilizantes granulados NPK', null, null, 'Dosis mantenimiento: 100-500 g/ha mezclado en NPK. Deficiencia moderada: 500g-2kg/ha. Deficiencia severa: 500g-2kg/ha + foliar subsecuente (300g/ha). Indicador en suelo: <1 ppm DTPA-Cu (moderada 0.4-1, severa <0.4).', 'Datos obtenidos de captura de imagen (PDF sin texto seleccionable)', true, false, '{"any"}'::text[]),
  ('Magnesio (= Sulfato de Magnesio Heptahidratado)', 'Servicios NH3', 'MgSO4·7H2O', 'Recubrimiento (microelemento)', 'http://www.snh3.com.mx/pdf/sulfato-magnesio-heptahidratado.pdf', 'Microelementos', '0%', '0%', '0%', '12.84% mín', '0%', '16.18% MgO / 9.73% Mg (mín)', 'Pureza 98.7% mín', 'Cristales rómbicos de alta pureza y solubilidad', null, null, 'Ver fila "Sulfato de Magnesio Heptahidratado" — el sitio vincula la misma ficha para ambos productos.', null, true, false, '{"any"}'::text[]),
  ('Fierro (Wolf Trax DDP)', 'Wolf Trax', 'Recubrimiento de fertilizante granulado', 'Recubrimiento (microelemento)', 'http://www.snh3.com.mx/pdf/fierro.pdf', 'Microelementos', null, null, null, null, null, null, 'Fe (dosis por deficiencia)', 'Tecnología de recubrimiento para mezclar con fertilizantes granulados NPK', null, null, 'Dosis mantenimiento: 400-500 g/ha mezclado en NPK. Deficiencia moderada: 500g-2kg/ha + 1-2 aplicaciones foliares. Deficiencia severa: igual + foliar subsecuente. Indicador en suelo: <4 ppm DTPA-Fe (moderada 2-4, severa <2).', 'Datos obtenidos de captura de imagen (PDF sin texto seleccionable)', true, false, '{"any"}'::text[]),
  ('Nitrato de Calcio + Amonio', 'Servicios NH3', '19-00-00-8.8Ca', 'Sin especificar', '', 'Sin ficha', '19%', '0%', '0%', '0%', '8.8%', '0%', null, null, null, null, 'No disponible: el enlace de "ficha técnica" en la página del producto está roto (apunta a "#").', 'Ficha técnica no disponible en el sitio (enlace roto)', false, false, '{"any"}'::text[]),
  ('Nitrato de Calcio Líquido', 'Servicios NH3', '9-00-00-11Ca', 'Sin especificar', '', 'Sin ficha', '9%', '0%', '0%', '0%', '11%', '0%', null, null, null, null, 'No disponible: el enlace de "ficha técnica" en la página del producto está roto (apunta a "#").', 'Ficha técnica no disponible en el sitio (enlace roto)', false, false, '{"any"}'::text[]),
  ('Tiosulfato de Amonio', 'Servicios NH3', '20-00-00-26Ca (según listado; revisar, S no reportado en listado)', 'Sin especificar', '', 'Sin ficha', '20%', '0%', '0%', null, '26%', '0%', null, null, null, null, 'No disponible: el enlace de "ficha técnica" en la página del producto está roto (apunta a "#").', 'Ficha técnica no disponible en el sitio (enlace roto)', false, false, '{"any"}'::text[])
) as v(name, mfg, grado_formula, presentation, ficha_tecnica, subcategoria, n_pct, p_pct, k_pct, s_pct, ca_pct, mg_pct, otros_micronutrientes, caracteristicas_fisicas, compatibilidad, incompatibilidad, uso_dosis, notas, ficha_completa, verificar_con_proveedor, crops)
where not exists (
  select 1 from public.productos p
  where p.name = v.name and p.category = 'nutricion'
);

-- Vincula los 37 productos importados con el distribuidor Servicios NH3
-- (muchos-a-muchos: a futuro un producto puede tener más de un distribuidor).
insert into public.producto_distribuidores (producto_id, distribuidor_id)
select p.id, (select id from public.distribuidores where name = 'Servicios NH3')
from public.productos p
where p.category = 'nutricion'
  and p.name in (
    'Urea Granulada',
    'Nitrato de Amonio (CAN 27)',
    'Sulfonit',
    'Sulfato de Amonio Estándar',
    'Sulfato de Amonio Granulado',
    'Nitrato de Calcio (YaraLiva Tropicote)',
    'Fosfato Monoamónico (MAP)',
    'Micro Essentials SZ',
    'KMag Premium (Sulfato de Potasio/Magnesio)',
    'Yara Mila 15-15-15',
    'Yeso Agrícola Soluble (SoluGyp)',
    'MAP Técnico (MAP-T)',
    'MKP - Fosfato Monopotásico',
    'Sulfato de Potasio Ultra Soluble',
    'Sulfato de Magnesio Heptahidratado',
    'Ultrasol Inicial (SQM)',
    'UMA Especial Crecimiento (Ultrasol Crecimiento SQM)',
    'NPK Máxima Triple 18',
    'NKMG Ultrasoluble (Nitrato de Potasio + Magnesio)',
    'NPK Máxima Producción',
    'Amoníaco Anhidro',
    'UAN-32 (Nitrato de Amonio + Urea)',
    'Ácido Sulfúrico + Urea',
    'Ácido Sulfúrico',
    'Polifosfato de Amonio',
    'N-P-K Líquido (listado en sitio)',
    'Ácido Fosfórico',
    'Tiosulfato de Potasio (KTS)',
    'Zinc (Wolf Trax DDP)',
    'Boro (Wolf Trax DDP)',
    'Calcio (ficha vinculada = "Calcio Boro", Colinagro)',
    'Cobre (Wolf Trax DDP)',
    'Magnesio (= Sulfato de Magnesio Heptahidratado)',
    'Fierro (Wolf Trax DDP)',
    'Nitrato de Calcio + Amonio',
    'Nitrato de Calcio Líquido',
    'Tiosulfato de Amonio'
  )
  and not exists (
    select 1 from public.producto_distribuidores pd
    where pd.producto_id = p.id
      and pd.distribuidor_id = (select id from public.distribuidores where name = 'Servicios NH3')
  );
