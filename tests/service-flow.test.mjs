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

test('la vista pública expone la descripción de los servicios', async () => {
  const migration = await readProjectFile('supabase/migrations/20260920000000_expose_service_description.sql');
  assert.match(migration, /create or replace view public\.public_services/);
  assert.match(migration, /services\.description/);
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

test('la navegación restablece la posición y el login vuelve al inicio', async () => {
  const app = await readProjectFile('src/App.tsx');
  const authPage = await readProjectFile('src/components/AuthPage.tsx');
  const explore = await readProjectFile('src/pages/Explora.tsx');
  assert.match(authPage, /: '#inicio'/);
  assert.match(app, /window\.requestAnimationFrame\(\(\) => window\.scrollTo\(\{ top: 0, left: 0, behavior: 'auto' \}\)\)/);
  assert.match(explore, /function changePage\(nextPage: number\)/);
  assert.match(explore, /onPageChange=\{changePage\}/);
});

test('la sección Nosotros se oculta para usuarios autenticados', async () => {
  const menu = await readProjectFile('src/components/Menu.tsx');
  const footer = await readProjectFile('src/components/Footer.tsx');
  const app = await readProjectFile('src/App.tsx');
  assert.match(menu, /item\.href !== '#nosotros'/);
  assert.match(footer, /link\.href !== '#nosotros'/);
  assert.match(app, /session && isAboutPage/);
});

test('el enlace de WhatsApp usa el número de ConectaUTP', async () => {
  const footer = await readProjectFile('src/components/Footer.tsx');
  assert.match(footer, /https:\/\/wa\.me\/50765591976/);
});

test('el panel administrativo y las actualizaciones tienen acceso separado', async () => {
  const app = await readProjectFile('src/App.tsx');
  const authPage = await readProjectFile('src/components/AuthPage.tsx');
  const menu = await readProjectFile('src/components/Menu.tsx');
  const admin = await readProjectFile('src/pages/AdminPanel.tsx');
  const updates = await readProjectFile('src/pages/Actualizaciones.tsx');
  assert.match(app, /#admin/);
  assert.match(app, /isAdmin/);
  assert.match(authPage, /hasAdminRole\(result\.data\.session\.user\.id\)/);
  assert.match(menu, /Actualizaciones/);
  assert.match(menu, /Panel administrativo/);
  assert.match(admin, /Rendimiento del proyecto/);
  assert.match(admin, /chartType/);
  assert.match(admin, /Suscripciones/);
  assert.match(admin, /PaymentPeriod/);
  assert.match(admin, /Esta semana/);
  assert.match(admin, /Este mes/);
  assert.doesNotMatch(admin, /Pendiente/);
  assert.match(admin, /showAxis/);
  assert.match(admin, /loadAdminData/);
  assert.match(admin, /is_most_used/);
  assert.match(admin, /AdminResourceDialog/);
  assert.match(updates, /Actualizaciones/);
  assert.match(updates, /expandedUpdateId/);
  assert.doesNotMatch(updates, /readTime/);
});

test('los planes y promociones tienen reglas funcionales aplicables', async () => {
  const adminData = await readProjectFile('src/lib/adminData.ts');
  const dialog = await readProjectFile('src/components/AdminResourceDialog.tsx');
  const services = await readProjectFile('src/lib/services.ts');
  const migration = await readProjectFile('supabase/migrations/20260925000000_add_plan_entitlements_and_promotion_rules.sql');
  assert.match(adminData, /PlanEntitlements/);
  assert.match(adminData, /getPlanFeatureLabels/);
  assert.match(dialog, /Servicios publicados/);
  assert.match(dialog, /Beneficio funcional/);
  assert.match(services, /get_effective_plan_entitlements/);
  assert.match(migration, /provider_promotions/);
  assert.match(migration, /enforce_service_plan_limit/);
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

test('los favoritos reemplazan las calificaciones y se guardan por usuario', async () => {
  const card = await readProjectFile('src/components/ServiceCard.tsx');
  const services = await readProjectFile('src/lib/services.ts');
  const favoritesPage = await readProjectFile('src/pages/Favoritos.tsx');
  const app = await readProjectFile('src/App.tsx');
  const menu = await readProjectFile('src/components/Menu.tsx');
  const migration = await readProjectFile('supabase/migrations/20260927000000_create_service_favorites.sql');
  assert.match(card, /Heart/);
  assert.doesNotMatch(card, /Calificación|service\.rating/);
  assert.match(services, /service_favorites/);
  assert.match(favoritesPage, /listFavoriteServices/);
  assert.match(app, /#favoritos/);
  assert.match(menu, />Favoritos<\/a>/);
  assert.match(migration, /unique \(user_id, service_id\)/);
  assert.match(migration, /enable row level security/);
});

test('los documentos legales son públicos y el registro exige aceptación', async () => {
  const app = await readProjectFile('src/App.tsx');
  const footer = await readProjectFile('src/components/Footer.tsx');
  const authPage = await readProjectFile('src/components/AuthPage.tsx');
  const terms = await readProjectFile('src/pages/Terminos.tsx');
  const privacy = await readProjectFile('src/pages/PoliticaPrivacidad.tsx');
  const migration = await readProjectFile('supabase/migrations/20260928000000_store_legal_acceptance.sql');
  assert.match(app, /#terminos/);
  assert.match(app, /#politica-privacidad/);
  assert.match(footer, /Términos y condiciones/);
  assert.match(footer, /Política de privacidad/);
  assert.match(authPage, /acceptedTerms/);
  assert.match(authPage, /required onChange/);
  assert.match(authPage, /terms_accepted_at/);
  assert.match(terms, /Términos y condiciones/);
  assert.match(privacy, /Política de privacidad/);
  assert.match(migration, /terms_accepted_at/);
  assert.match(migration, /privacy_policy_version/);
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
  assert.match(plansData, /Hasta 1 publicación/);
  assert.match(plansData, /B\/\.1\.00/);
  assert.doesNotMatch(plansData, /Promoción de lanzamiento/);
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
  assert.match(feedbackFunction, /conectautp2@gmail\.com/);
  assert.match(feedbackFunction, /RESEND_API_KEY/);
  assert.match(deleteFunction, /Bearer/);
  assert.match(deleteFunction, /deleteUser/);
});

test('el chat unifica conversaciones y conserva solicitudes de servicio', async () => {
  const chatMigration = await readProjectFile('supabase/migrations/20260919000000_create_chat_conversations.sql');
  const unifyMigration = await readProjectFile('supabase/migrations/20260921000000_unify_chat_conversations.sql');
  const chatPage = await readProjectFile('src/pages/Chats.tsx');
  const chatLib = await readProjectFile('src/lib/chat.ts');
  const servicePage = await readProjectFile('src/pages/ServicioPublico.tsx');
  const menu = await readProjectFile('src/components/Menu.tsx');
  assert.match(chatMigration, /create table public\.chat_conversations/);
  assert.match(chatMigration, /supabase_realtime/);
  assert.match(unifyMigration, /row_number\(\) over/);
  assert.match(unifyMigration, /disable trigger protect_chat_message_content/);
  assert.match(unifyMigration, /enable trigger protect_chat_message_content/);
  assert.match(unifyMigration, /on public\.chat_conversations \(participant_one_id, participant_two_id\)/);
  assert.match(chatPage, /Buscar usuario/);
  assert.match(chatPage, /alreadyRequested/);
  assert.match(chatLib, /SERVICE_REQUEST_MESSAGE/);
  assert.match(chatLib, /serviceId = conversation\.service_id/);
  assert.match(chatLib, /subscribeToChatNotifications/);
  assert.match(menu, /unreadMessages/);
  assert.match(servicePage, /Solicitar servicio/);
  assert.match(menu, /Abrir chats/);
});
