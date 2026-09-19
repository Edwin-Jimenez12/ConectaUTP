import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

async function readProjectFile(relativePath) {
  return readFile(resolve(root, relativePath), 'utf8');
}

test('la migración de servicios define el catálogo y sus políticas', async () => {
  const migration = await readProjectFile('supabase/migrations/20260914000004_create_services_and_storage.sql');
  for (const table of ['service_categories', 'services', 'service_images', 'service_messages']) {
    assert.match(migration, new RegExp(`create table public\\.${table}`));
  }
  assert.match(migration, /enable row level security/);
  assert.match(migration, /create view public\.public_services/);
  assert.match(migration, /service-images/);
});

test('la vista pública expone la fecha usada por el catálogo', async () => {
  const migration = await readProjectFile('supabase/migrations/20260915000000_expose_service_created_at.sql');
  assert.match(migration, /create or replace view public\.public_services/);
  assert.match(migration, /services\.created_at/);
});

test('el flujo de publicación usa estados y compresión antes de subir imágenes', async () => {
  const createPage = await readProjectFile('src/pages/CrearServicio.tsx');
  const uploadHelper = await readProjectFile('src/lib/imageUpload.ts');
  assert.match(createPage, /value="draft"/);
  assert.match(createPage, /value="published"/);
  assert.match(uploadHelper, /MAX_FILES = 5/);
  assert.match(uploadHelper, /MAX_FILE_SIZE = 5 \* 1024 \* 1024/);
  assert.match(uploadHelper, /image\/webp/);
});

test('la aplicación tiene rutas para gestión, detalle y perfil público', async () => {
  const app = await readProjectFile('src/App.tsx');
  assert.match(app, /#publicar/);
  assert.match(app, /#mis-servicios/);
  assert.match(app, /#servicio\//);
  assert.match(app, /#perfil\//);
});

test('el inicio usa el catálogo real y no datos simulados', async () => {
  const home = await readProjectFile('src/pages/Inicio.tsx');
  const card = await readProjectFile('src/components/ServiceCard.tsx');
  const filters = await readProjectFile('src/components/ExploreFilters.tsx');
  assert.match(home, /listPublicServices/);
  assert.doesNotMatch(home, /data\/services/);
  assert.doesNotMatch(card, /Reparaciones · Limpieza/);
  assert.doesNotMatch(filters, /data\/services/);
});

test('el documento no fuerza un ancho mínimo incompatible con móviles pequeños', async () => {
  const styles = await readProjectFile('src/index.css');
  assert.match(styles, /width: 100%/);
  assert.doesNotMatch(styles, /min-width: 320px/);
});

test('la información comercial está disponible en una página pública', async () => {
  const app = await readProjectFile('src/App.tsx');
  const menu = await readProjectFile('src/components/Menu.tsx');
  const plans = await readProjectFile('src/pages/Planes.tsx');
  const plansData = await readProjectFile('src/pages/planes.data.ts');
  assert.match(app, /#planes/);
  assert.match(menu, /Planes/);
  assert.match(plansData, /Publicaciones de servicios sin costo/);
  assert.match(plansData, /B\/\.1\.00/);
  assert.match(plansData, /Promoción de lanzamiento/);
  assert.match(plans, /Promociones/);
  assert.match(plans, /por servicio seleccionado/);
});

test('el perfil permite editar, guardar y sincronizar el nombre del menú', async () => {
  const button = await readProjectFile('src/components/Button.tsx');
  const profilePage = await readProjectFile('src/components/ProfileSettingsPage.tsx');
  const profileFields = await readProjectFile('src/components/ProfileFormFields.tsx');
  const authContext = await readProjectFile('src/auth/AuthContext.ts');
  const menu = await readProjectFile('src/components/Menu.tsx');
  assert.match(button, /cursor-pointer/);
  assert.match(profilePage, /updateProfile/);
  assert.match(profilePage, /setIsEditing\(false\)/);
  assert.match(profileFields, /disabled\?: boolean/);
  assert.match(profileFields, /a-z0-9\._/);
  assert.match(authContext, /profile: Profile \| null/);
  assert.match(menu, /profile\?\.first_name/);
});

test('opiniones y eliminación de cuenta tienen límites de seguridad', async () => {
  const contactMigration = await readProjectFile('supabase/migrations/20260914000005_create_contact_messages.sql');
  const deleteFunction = await readProjectFile('supabase/functions/delete-account/index.ts');
  const contactPage = await readProjectFile('src/pages/Contactanos.tsx');
  const feedbackFunction = await readProjectFile('supabase/functions/send-feedback/index.ts');
  assert.match(contactMigration, /create table public\.contact_messages/);
  assert.match(contactMigration, /enable row level security/);
  assert.doesNotMatch(contactPage, /contact_messages/);
  assert.match(contactPage, /send-feedback/);
  assert.match(feedbackFunction, /conectautp507@gmail\.com/);
  assert.match(feedbackFunction, /RESEND_API_KEY/);
  assert.match(deleteFunction, /Bearer/);
  assert.match(deleteFunction, /deleteUser/);
});

test('el chat separa conversaciones y solicitudes de servicio', async () => {
  const chatMigration = await readProjectFile('supabase/migrations/20260919000000_create_chat_conversations.sql');
  const chatPage = await readProjectFile('src/pages/Chats.tsx');
  const chatLib = await readProjectFile('src/lib/chat.ts');
  const servicePage = await readProjectFile('src/pages/ServicioPublico.tsx');
  const menu = await readProjectFile('src/components/Menu.tsx');
  assert.match(chatMigration, /create table public\.chat_conversations/);
  assert.match(chatMigration, /supabase_realtime/);
  assert.match(chatPage, /Buscar usuario/);
  assert.match(chatLib, /SERVICE_REQUEST_MESSAGE/);
  assert.match(servicePage, /Solicitar servicio/);
  assert.match(menu, /Abrir chats/);
});
