import { compressImage } from './imageUpload';
import { supabase } from './supabase';

const BUCKET = 'profile-avatars';

function getAvatarPath(publicUrl: string | null) {
  if (!publicUrl) return null;
  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const markerIndex = publicUrl.indexOf(marker);
  return markerIndex === -1 ? null : decodeURIComponent(publicUrl.slice(markerIndex + marker.length));
}

export async function uploadProfileAvatar(userId: string, file: File, previousUrl: string | null) {
  const compressed = await compressImage(file);
  const path = `${userId}/${crypto.randomUUID()}.webp`;
  const upload = await supabase.storage.from(BUCKET).upload(path, compressed, {
    contentType: 'image/webp',
    cacheControl: '3600',
  });

  if (upload.error) return { url: null, error: upload.error };

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  const update = await supabase.from('profiles').update({ avatar_url: data.publicUrl }).eq('id', userId);
  if (update.error) {
    await supabase.storage.from(BUCKET).remove([path]);
    return { url: null, error: update.error };
  }

  const previousPath = getAvatarPath(previousUrl);
  if (previousPath && previousPath !== path) {
    await supabase.storage.from(BUCKET).remove([previousPath]);
  }

  return { url: data.publicUrl, error: null };
}
