# ConectaUTP

Plataforma para conectar a estudiantes de la UTP con personas que ofrecen o
buscan servicios dentro de la comunidad universitaria.

## Tipografia

El proyecto utiliza **Inter** como fuente principal en toda la interfaz.

| Peso | Archivo | Uso recomendado |
| --- | --- | --- |
| 400 | `Inter_18pt-Regular.ttf` | Texto normal |
| 500 | `Inter_18pt-Medium.ttf` | Texto resaltado |
| 600 | `Inter_18pt-SemiBold.ttf` | Botones y subtitulos |
| 700 | `Inter_18pt-Bold.ttf` | Titulos y encabezados |

Las fuentes se encuentran en `src/font` y se cargan desde `src/index.css`.

## Paleta de colores

### Colores principales

| Nombre | Hexadecimal | Uso |
| --- | --- | --- |
| Purpura Conecta | `#7B32CA` | Acciones, enlaces y acentos |
| Azul Conecta | `#3D44DA` | Acciones secundarias y degradados |

### Colores neutros

| Nombre | Hexadecimal | Uso |
| --- | --- | --- |
| Negro | `#000000` | Elementos de alto contraste |
| Gris oscuro | `#141414` | Texto principal |
| Gris claro | `#F4F4F4` | Fondos y superficies secundarias |
| Fondo de pantalla | `#FDFDFD` | Fondo general de la aplicación |
| Blanco | `#FFFFFF` | Tarjetas y superficies |

## Degradados

El degradado de marca combina Purpura Conecta y Azul Conecta. Debe utilizarse
principalmente en banners, llamadas a la acción y elementos visuales de marca.
No se recomienda aplicarlo como fondo de textos extensos.

## Tecnologias

- React
- TypeScript
- Vite
- Tailwind CSS v4
- Supabase

## Vistas actuales

- `#inicio`: página principal.
- `#explorar`: catálogo de servicios.
- `#nosotros`: información de ConectaUTP.
- `#contactanos`: formulario de contacto.
- `#planes`: información de planes y publicaciones promocionadas.
- `#configuracion`: configuración del perfil.
- `#privacidad`, `#seguridad` y `#mi-cuenta`: configuración de cuenta.
- `#login` y `#registro`: autenticación con Supabase.

## Servicios y Supabase

Ejecuta en el SQL Editor de Supabase, en este orden, las migraciones nuevas:

`supabase/migrations/20260914000004_create_services_and_storage.sql`

Para guardar el formulario general de contacto, ejecuta después:

`supabase/migrations/20260914000005_create_contact_messages.sql`

`supabase/migrations/20260915000000_expose_service_created_at.sql`

Despliega también la función `supabase/functions/delete-account` antes de
habilitar la eliminación de cuentas en producción.

La migración crea categorías, servicios, imágenes, mensajes, políticas RLS,
la vista `public_services` y el bucket privado `service-images`.

Flujo disponible después de ejecutar la migración:

- `#inicio` y `#explorar`: consultan únicamente servicios publicados desde `public_services`.
- `#publicar`: crea un servicio como borrador o publicado.
- `#mis-servicios`: edita, publica, devuelve a borrador o elimina servicios.
- `#servicio/<id>`: muestra el detalle y permite contactar al proveedor con sesión.
- `#perfil/<id>`: muestra el perfil público y sus servicios publicados.

Las imágenes aceptan máximo 5 archivos de 5 MB cada uno. Se redimensionan a
1600 px como máximo y se convierten a WebP antes de subirlas. El bucket es
privado; los visitantes no reciben URLs de imágenes protegidas.

## Verificacion manual del flujo

1. Ejecuta la migración anterior en Supabase y confirma que el bucket `service-images` exista como privado.
2. Inicia sesión, abre `#publicar`, crea un borrador y verifica la fila en `public.services`.
3. Publica el servicio y confirma que aparezca en `#explorar`.
4. Abre el mismo catálogo en una ventana sin sesión y confirma que las tarjetas estén borrosas.
5. Desde otra cuenta autenticada, abre `#servicio/<id>` y envía un mensaje.
6. Abre `#mis-servicios` y verifica edición, cambio de estado y eliminación.
7. Prueba `yarn build` antes de desplegar en Cloudflare Pages.
8. Despliega `delete-account` y prueba la eliminación únicamente con una cuenta de prueba.
