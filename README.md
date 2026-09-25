# ConectaUTP

ConectaUTP es una plataforma web para que la comunidad universitaria de la UTP comparta habilidades y encuentre servicios. Permite publicar ofertas, explorar el catálogo, conocer perfiles, comunicarse por chat y acceder a planes y promociones.

## ¿Qué permite hacer?

- Crear una cuenta e iniciar sesión con correo o nombre de usuario.
- Crear y editar perfiles con biografía, información académica, avatar y opciones de privacidad.
- Publicar servicios como borradores o publicaciones visibles, con categoría, modalidad, precio e imágenes.
- Explorar y filtrar publicaciones, ver sus detalles y perfiles, cambiar entre las imágenes de una galería y guardar favoritos.
- Solicitar servicios e iniciar conversaciones directas; consultar el historial de chats.
- Consultar planes y promociones. Los pagos se solicitan mediante Yappy y los beneficios se activan después de la confirmación del pago.
- Administrar publicaciones, favoritos, preferencias de cuenta, seguridad y privacidad.
- Consultar actualizaciones, enviar comentarios y leer los documentos legales.
- Usar un panel administrativo para gestionar planes, promociones, suscripciones, pagos y contenido.

**Renovaciones:** la renovación automática de planes no está habilitada. Para continuar con un plan al terminar el periodo, la persona debe volver a elegirlo y completar el pago.

## Tecnologías

- React 19 y TypeScript
- Vite 8
- Tailwind CSS 4
- Supabase Auth, PostgreSQL, Row Level Security (RLS), Storage, Realtime y Edge Functions
- Yappy para solicitar pagos de planes y promociones
- Cloudflare Pages para alojar el frontend

## Rutas principales

La navegación usa hashes en la URL:

| Ruta | Contenido |
| --- | --- |
| `#inicio` | Página principal y servicios destacados |
| `#explorar` | Catálogo, filtros y publicaciones relevantes |
| `#servicio/<id>` | Detalle de una publicación |
| `#perfil/<id>` | Perfil público y servicios publicados |
| `#publicar` | Crear un servicio y revisar su vista previa |
| `#mis-servicios` | Administrar publicaciones y destacadas del plan |
| `#favoritos` | Servicios guardados |
| `#chats` | Conversaciones y mensajes |
| `#planes` | Planes y promociones disponibles |
| `#actualizaciones` | Novedades de la plataforma |
| `#configuracion` | Editar el perfil |
| `#privacidad`, `#seguridad`, `#mi-cuenta` | Preferencias y administración de la cuenta |
| `#login`, `#registro`, `#recuperar-contrasena` | Acceso y recuperación de cuenta |
| `#admin` | Panel administrativo para cuentas autorizadas |

## Estructura del proyecto

```text
src/
  auth/          Contexto y estado de autenticación
  components/    Componentes compartidos, menú, tarjetas y formularios
  lib/           Clientes y lógica de Supabase, servicios, chat e imágenes
  pages/         Vistas principales de la aplicación
  types/         Tipos de perfiles, servicios y conversaciones
  index.css      Estilos globales y temas claro/oscuro
supabase/
  functions/     Funciones Edge (pagos, autenticación, contacto y cuenta)
  migrations/    Cambios versionados del esquema y funciones SQL
tests/           Pruebas automatizadas
```

## Requisitos y ejecución local

El proyecto declara Yarn `4.9.1` en `package.json` y usa Corepack para administrar esa versión.

```bash
corepack enable
corepack yarn install
```

Configura las variables públicas del cliente en un archivo local `.env.local`:

```dotenv
VITE_SUPABASE_URL=<URL de tu proyecto Supabase>
VITE_SUPABASE_PUBLISHABLE_KEY=<clave publicable de Supabase>
```

Los valores anteriores son marcadores de posición. No subas `.env.local` al repositorio. La clave publicable está diseñada para el cliente y **no** reemplaza las políticas RLS.

```bash
corepack yarn dev       # Servidor local de desarrollo
corepack yarn build     # Verificación TypeScript y compilación de producción
corepack yarn preview   # Vista local de la compilación
corepack yarn lint      # ESLint
corepack yarn test      # Pruebas automatizadas
```

## Supabase

Supabase almacena las cuentas, perfiles, servicios, imágenes, conversaciones, favoritos, planes, promociones y registros de pagos. Las políticas RLS controlan qué datos puede consultar o modificar cada rol. Las imágenes de servicios usan el bucket privado `service-images` y se muestran mediante enlaces firmados.

### Migraciones

Los archivos de `supabase/migrations/` definen el esquema y las funciones SQL de la aplicación. Aplícalos en orden cronológico al proyecto Supabase correcto antes de depender de sus tablas, vistas, políticas o RPC. Por ejemplo, con Supabase CLI ya instalado y acceso autorizado:

```bash
supabase login
supabase link --project-ref <referencia-del-proyecto>
supabase db push
```

Revisa el proyecto enlazado y las migraciones pendientes antes de ejecutar cambios en producción. Un despliegue de Cloudflare no aplica migraciones SQL.

### Edge Functions

La carpeta `supabase/functions/` contiene:

| Función | Propósito |
| --- | --- |
| `yappy-payment` | Crea órdenes de pago y procesa la notificación de confirmación de Yappy. |
| `sign-in-with-username` | Permite iniciar sesión usando el nombre de usuario. |
| `delete-account` | Procesa la eliminación de la cuenta. |
| `send-feedback` | Valida y envía comentarios del formulario de contacto. |

Despliega cada función con Supabase CLI cuando haya cambios en su código; por ejemplo:

```bash
supabase functions deploy yappy-payment
```

Las funciones reciben variables de entorno y secretos desde la configuración de Supabase. Según la integración, pueden requerirse `YAPPY_DOMAIN`, `YAPPY_MERCHANT_ID`, `YAPPY_SECRET_KEY`, `YAPPY_IPN_URL`, `YAPPY_API_BASE_URL`, `RESEND_API_KEY` y `FEEDBACK_FROM_EMAIL`. Configura únicamente las que correspondan y **nunca publiques sus valores**. Las claves administrativas, como `SUPABASE_SERVICE_ROLE_KEY`, son exclusivas del backend y no deben incluirse en variables `VITE_*`, código frontend, documentación ni control de versiones.

## Despliegue

### Cloudflare Pages

Cloudflare Pages aloja el frontend. Configura:

- Comando de compilación: `yarn build` (o `corepack yarn build`).
- Directorio de salida: `dist`.
- Variables de entorno del cliente: `VITE_SUPABASE_URL` y `VITE_SUPABASE_PUBLISHABLE_KEY`.

Con integración Git, confirma y publica los cambios en la rama que Cloudflare despliega; la plataforma compila una revisión publicada, no los cambios sin commit que solo existan en el equipo local. Ajusta también las URL de autenticación y redirección en Supabase para el dominio de producción.

### Supabase y pagos

Cloudflare Pages y Supabase se despliegan por separado. Además del frontend, aplica las migraciones pendientes y despliega las Edge Functions modificadas. Configura los secretos de Yappy en Supabase y valida que el dominio registrado en Yappy coincida con el dominio público. El pago solo debe considerarse exitoso cuando la notificación de Yappy confirma que fue ejecutado; compilar o desplegar el frontend no verifica una transacción real.

## Seguridad y datos sensibles

- No guardes contraseñas, claves privadas, tokens, secretos de Yappy, credenciales de correo ni valores reales de entorno en este archivo o en Git.
- No coloques claves `service_role` en el navegador. Las operaciones privilegiadas deben permanecer en Edge Functions.
- Conserva activas las políticas RLS y las validaciones del servidor.
- Usa variables locales ignoradas por Git para desarrollo y variables/secretos del panel correspondiente para producción.
- Si un secreto se filtra, rótalo desde el proveedor; quitarlo del README no invalida la credencial.

## Marca y apariencia

La fuente principal de la interfaz es **Inter**, disponible en `src/font`. La paleta de marca usa principalmente púrpura (`#7B32CA`) y azul (`#3D44DA`). La aplicación admite tema claro y oscuro; los componentes deben conservar contraste y legibilidad en ambos.
