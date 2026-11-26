# Preparación del CRM

El CRM funciona bajo `/crm` dentro del mismo proyecto de Next.js y usa las tablas existentes de Supabase para administrar repuestos, motos y cargueros.

## Acceso privado

El inicio de sesión usa **Supabase Auth**. No hay formulario de registro dentro de la web, así que cada cuenta se crea desde el panel de Supabase en **Authentication → Users → Add user** o mediante una invitación enviada desde allí. La identidad y contraseña quedan gestionadas por Supabase en `auth.users`; el proyecto nunca guarda contraseñas.

Además, `public.crm_users` es la lista de empleados habilitados y sus permisos. La migración crea esta tabla con RLS activo y sin permisos de lectura o escritura para `anon` y `authenticated`, de modo que se administra desde Supabase Dashboard (Table Editor o SQL Editor). Para habilitar una cuenta hay que crear primero el usuario en Auth y luego agregar una fila aquí con el mismo UUID, correo, perfil y permisos. Si la fila está inactiva o no existe, el login no da acceso al panel.

Pasos desde Supabase:

1. Aplica la migración `20261125090000_add_crm_users` a la base de datos.
2. En **Authentication → Users**, crea el usuario o envíale una invitación. Copia su UUID.
3. En **Table Editor → crm_users**, agrega una fila con ese UUID y correo. Elige `ADMIN` para acceso completo o `EMPLOYEE` y activa solo los permisos que necesite.
4. Para quitar el acceso sin borrar la cuenta, marca `active` como `false`.

También puedes crear una cuenta y su perfil desde SQL Editor después de crear la cuenta en Auth:

```sql
insert into public.crm_users
  (id, email, full_name, role, can_manage_catalog, can_manage_orders, can_manage_chats)
select id, email, 'Administrador', 'ADMIN', false, false, false
from auth.users
where email = 'admin@tuempresa.com';
```

El rol `ADMIN` concede los tres permisos automáticamente. Para `EMPLOYEE`, cada permiso se controla con sus columnas `can_manage_*`.

Para conservar el alta manual, desactiva los registros públicos de correo en la configuración de Auth de Supabase. Los permisos de catálogo, pedidos y chats para empleados se controlan por separado en las columnas `can_manage_catalog`, `can_manage_orders` y `can_manage_chats`.

Configura estas variables en el entorno local y en Vercel:

- `NEXT_PUBLIC_SUPABASE_URL`: URL del proyecto.
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: clave pública del proyecto. El código también reconoce `NEXT_PUBLIC_SUPABASE_ANON_KEY` para proyectos que aún usan el nombre anterior.
- `DATABASE_URL` y `DIRECT_URL`: conexiones PostgreSQL ya usadas por Prisma para consultar el catálogo y verificar el permiso de cada usuario.

En Vercel, se agregan en **Project → Settings → Environment Variables** y se vuelve a desplegar el proyecto. No incluyas claves `service_role` o secretas en variables `NEXT_PUBLIC_`.

Las páginas y operaciones del CRM verifican la sesión de Supabase y el permiso guardado en `crm_users` en el servidor. Nunca configures una clave `service_role` en el navegador.

## Catálogo

El panel trabaja sobre `Product`, `Moto`, `Motocarro` y sus tablas de imágenes. Las imágenes se guardan como direcciones https, por lo que se pueden usar enlaces de Cloudinary. La eliminación es permanente y requiere confirmación en el panel.

## WhatsApp

La bandeja visual está preparada como punto de entrada, pero los mensajes aún no se reciben ni envían. Para activarlos hace falta una cuenta y número de WhatsApp Business Platform en Meta, además de credenciales privadas y un webhook público HTTPS. Esas credenciales se añadirán como variables de entorno cuando se configure la cuenta.
