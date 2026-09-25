import { supabase } from './supabase';

const MAX_FILES = 5;
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_DIMENSION = 1600;

function canvasToBlob(canvas: HTMLCanvasElement) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('No se pudo comprimir la imagen.'));
      },
      'image/webp',
      0.82,
    );
  });
}

export async function compressImage(file: File) {
  if (!file.type.startsWith('image/')) {
    throw new Error('Solo puedes subir archivos de imagen.');
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('Cada imagen debe pesar máximo 5 MB.');
  }

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d')?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  const blob = await canvasToBlob(canvas);
  const baseName = file.name.replace(/\.[^.]+$/, '');
  return new File([blob], `${baseName}.webp`, { type: 'image/webp' });
}

export async function uploadServiceImages(serviceId: string, files: File[], altTexts: string[] = []) {
  if (files.length > MAX_FILES) {
    throw new Error('Puedes subir máximo 5 imágenes por servicio.');
  }

  const { data: existingImages, error: existingImagesError } = await supabase
    .from('service_images')
    .select('sort_order, is_cover')
    .eq('service_id', serviceId)
    .order('sort_order', { ascending: true });
  if (existingImagesError) throw existingImagesError;
  if ((existingImages?.length ?? 0) + files.length > MAX_FILES) {
    throw new Error('Puedes tener máximo 5 imágenes por servicio.');
  }

  const nextSortOrder = Math.max(-1, ...(existingImages ?? []).map((image) => Number(image.sort_order ?? -1))) + 1;
  const alreadyHasCover = (existingImages ?? []).some((image) => image.is_cover);

  const paths: string[] = [];
  const insertedImageIds: string[] = [];
  try {
    for (const [index, file] of files.entries()) {
      const compressed = await compressImage(file);
      const path = `${serviceId}/${crypto.randomUUID()}.webp`;
      const upload = await supabase.storage
        .from('service-images')
        .upload(path, compressed, { contentType: 'image/webp' });
      if (upload.error) throw upload.error;

      paths.push(path);
      const row = await supabase.from('service_images').insert({
        service_id: serviceId,
        storage_path: path,
        alt_text: altTexts[index]?.trim() || `Imagen del servicio ${index + 1}`,
        sort_order: nextSortOrder + index,
        is_cover: !alreadyHasCover && index === 0,
      }).select('id').single();
      if (row.error) throw row.error;
      insertedImageIds.push(row.data.id);
    }
  } catch (error) {
    if (insertedImageIds.length) {
      await supabase.from('service_images').delete().in('id', insertedImageIds);
    }
    if (paths.length) {
      await supabase.storage.from('service-images').remove(paths);
    }
    throw error;
  }

  return paths;
}

export async function replaceServiceImage(imageId: string, oldPath: string, file: File, altText: string) {
  const compressed = await compressImage(file);
  const newPath = `${oldPath.split('/')[0]}/${crypto.randomUUID()}.webp`;
  const upload = await supabase.storage
    .from('service-images')
    .upload(newPath, compressed, { contentType: 'image/webp' });
  if (upload.error) throw upload.error;

  const update = await supabase
    .from('service_images')
    .update({ storage_path: newPath, alt_text: altText.trim() })
    .eq('id', imageId);
  if (update.error) {
    await supabase.storage.from('service-images').remove([newPath]);
    throw update.error;
  }

  await supabase.storage.from('service-images').remove([oldPath]);
  return newPath;
}
