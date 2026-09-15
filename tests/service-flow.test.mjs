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

test('contacto y eliminación de cuenta tienen límites de seguridad', async () => {
  const contactMigration = await readProjectFile('supabase/migrations/20260914000005_create_contact_messages.sql');
  const deleteFunction = await readProjectFile('supabase/functions/delete-account/index.ts');
  const contactPage = await readProjectFile('src/pages/Contactanos.tsx');
  assert.match(contactMigration, /create table public\.contact_messages/);
  assert.match(contactMigration, /enable row level security/);
  assert.match(contactPage, /contact_messages/);
  assert.match(deleteFunction, /Bearer/);
  assert.match(deleteFunction, /deleteUser/);
});
