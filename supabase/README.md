# Configurar el panel de administrador (Supabase)

Sigue estos pasos una sola vez, en tu proyecto de Supabase (https://ovbasquswnaepngdapje.supabase.co).

## 1. Crear las tablas

Ve a **SQL Editor → New query**, pega todo el contenido de [`schema.sql`](./schema.sql) y dale **Run**.

Esto crea:
- `fertilizantes` — el catálogo que el admin va a editar (nombre, fabricante, presentación, precio, ficha técnica).
- `admin_users` — la lista de quién tiene permiso de escribir. Está protegida: nadie puede leerla ni escribirla desde la app, solo tú desde el SQL Editor.
- Reglas de seguridad (RLS): cualquiera puede **leer** fertilizantes, pero solo quien esté en `admin_users` puede **crear, editar o borrar**.

## 2. Crear tu cuenta de administrador

Ve a **Authentication → Users → Add user → Create new user**. Pon tu correo y una contraseña. Esta es la cuenta con la que vas a entrar al panel — no es un registro público, solo tú (o quien tú decidas) la tiene.

Después de crearla, copia su **User UID** (aparece en la lista de usuarios).

## 3. Darle permiso de administrador

De vuelta en **SQL Editor**, corre (reemplazando el UID que copiaste):

```sql
insert into public.admin_users (id) values ('PEGA-AQUÍ-EL-UID');
```

Listo. Con eso, esa cuenta ya puede iniciar sesión en la pantalla de administrador y editar el catálogo de fertilizantes. Para dar acceso a alguien más, repite el paso 2 y 3 con su correo.

## 4. Cargar los fertilizantes existentes (opcional)

Si quieres partir de los fertilizantes que ya estaban en la demo (Yara, Haifa, Mosaic, etc.) en vez de capturarlos a mano, corre esto una vez en el SQL Editor:

```sql
insert into public.fertilizantes (name, mfg, presentation, price, ficha_tecnica) values
  ('YaraVita', 'Yara', '1 L', 310, 'https://www.yara.com'),
  ('YaraMila', 'Yara', '25 kg', 890, 'https://www.yara.com'),
  ('Agroleaf Power', 'ICL', '20 kg', 1050, 'https://www.icl-group.com'),
  ('Ultrasol', 'SQM', '25 kg', 960, 'https://www.sqm.com'),
  ('Multi-K', 'Haifa', '25 kg', 980, 'https://www.haifa-group.com'),
  ('Haifa Cal', 'Haifa', '25 kg', 750, 'https://www.haifa-group.com'),
  ('MicroEssentials', 'Mosaic', '50 kg', 1100, 'https://www.mosaicco.com'),
  ('Aspire', 'Mosaic', '25 kg', 890, 'https://www.mosaicco.com'),
  ('ESN', 'Nutrien Ag Solutions', '25 kg', 920, 'https://www.nutrien.com'),
  ('Suståin', 'Nutrien Ag Solutions', '25 kg', 860, 'https://www.nutrien.com'),
  ('Basfoliar', 'Compo Expert', '1 L', 420, 'https://www.compo-expert.com'),
  ('Novatec', 'Compo Expert', '25 kg', 940, 'https://www.compo-expert.com'),
  ('Kristalon', 'Van Iperen', '25 kg', 1020, 'https://www.vaniperen.com');
```
