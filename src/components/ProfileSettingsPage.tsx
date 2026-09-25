import { useCallback, useEffect, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { UserCircle2 } from 'lucide-react';
import { useAuth } from '../auth/useAuth';
import { uploadProfileAvatar } from '../lib/profileImages';
import { supabase } from '../lib/supabase';
import type { Profile, ProfileFormData, ProfileUpdate } from '../types/profile';
import { Button } from './Button';
import { ProfileFormFields } from './ProfileFormFields';
import { PublicProfilePreview } from './PublicProfilePreview';
import { SettingsLayout } from './SettingsLayout';

const emptyForm: ProfileFormData = {
  first_name: '', last_name: '', username: null, bio: '', career: '',
  faculty: '', regional_center: '', identity_preference: 'name', show_location: false,
};

function profileToForm(profile: Profile): ProfileFormData {
  return {
    first_name: profile.first_name ?? '', last_name: profile.last_name ?? '',
    username: profile.username, bio: profile.bio ?? '', career: profile.career ?? '',
    faculty: profile.faculty ?? '', regional_center: profile.regional_center ?? '',
    identity_preference: profile.identity_preference, show_location: profile.show_location,
  };
}

export function ProfileSettingsPage() {
  const { session, updateProfile } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [form, setForm] = useState<ProfileFormData>(emptyForm);
  const [message, setMessage] = useState('');
  const [messageIsError, setMessageIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const avatarUrl = avatarPreview ?? profile?.avatar_url ?? null;

  useEffect(() => () => {
    if (avatarPreview?.startsWith('blob:')) URL.revokeObjectURL(avatarPreview);
  }, [avatarPreview]);

  const loadProfile = useCallback(async (userId: string) => {
    setIsLoading(true);
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
    if (error) {
      setMessage('No se pudo cargar tu perfil.');
      setMessageIsError(true);
    } else if (data) {
      const currentProfile = data as Profile;
      setProfile(currentProfile);
      updateProfile(currentProfile);
      setForm(profileToForm(currentProfile));
      setAvatarPreview(null);
      setMessage('');
      setMessageIsError(false);
    } else {
      const { data: created, error: createError } = await supabase.from('profiles').insert({ id: userId }).select().single();
      if (createError) {
        setMessage('No se pudo crear tu perfil.');
        setMessageIsError(true);
      } else {
        const createdProfile = created as Profile;
        setProfile(createdProfile);
        updateProfile(createdProfile);
        setForm(profileToForm(createdProfile));
        setAvatarPreview(null);
        setMessage('');
        setMessageIsError(false);
      }
    }
    setIsLoading(false);
  }, [updateProfile]);

  useEffect(() => {
    if (session) void Promise.resolve().then(() => loadProfile(session.user.id));
  }, [loadProfile, session]);

  function updateForm(changes: Partial<ProfileFormData>) {
    setForm((current) => ({ ...current, ...changes }));
  }

  async function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!session || !file) return;

    setAvatarPreview(URL.createObjectURL(file));
    setIsUploadingAvatar(true);
    setMessage('');
    setMessageIsError(false);
    try {
      const result = await uploadProfileAvatar(session.user.id, file, profile?.avatar_url ?? null);
      if (result.error || !result.url) {
        setAvatarPreview(null);
        setMessage(result.error instanceof Error ? result.error.message : 'No se pudo subir la foto de perfil.');
        setMessageIsError(true);
        return;
      }
      const updatedProfile = profile ? { ...profile, avatar_url: result.url } : null;
      if (updatedProfile) {
        setProfile(updatedProfile);
        updateProfile(updatedProfile);
      }
      setAvatarPreview(result.url);
      setMessage('Foto de perfil actualizada correctamente.');
      setMessageIsError(false);
    } catch (error) {
      setAvatarPreview(null);
      setMessage(error instanceof Error ? error.message : 'No se pudo subir la foto de perfil.');
      setMessageIsError(true);
    } finally {
      setIsUploadingAvatar(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!session) return;
    setIsSaving(true);
    setMessage('');
    setMessageIsError(false);
    const update: ProfileUpdate = {
      ...form,
      first_name: form.first_name?.trim() || null,
      last_name: form.last_name?.trim() || null,
      username: form.username?.trim() || null,
      bio: form.bio?.trim() || null,
      career: form.career?.trim() || null,
      faculty: form.faculty?.trim() || null,
      regional_center: form.regional_center?.trim() || null,
    };
    const { data, error } = await supabase.from('profiles').update(update).eq('id', session.user.id).select().single();
    if (error) {
      setMessage(error.message.includes('profiles_username_unique') ? 'Ese username ya está en uso.' : 'No se pudieron guardar los cambios.');
      setMessageIsError(true);
    } else {
      const updatedProfile = data as Profile;
      setProfile(updatedProfile);
      updateProfile(updatedProfile);
      setForm(profileToForm(updatedProfile));
      setMessage('Cambios guardados correctamente.');
      setMessageIsError(false);
      setIsEditing(false);
    }
    setIsSaving(false);
  }

  if (isLoading) return <div className="flex min-h-[510px] items-center justify-center text-sm text-[#676878]">Cargando perfil...</div>;

  return (
    <SettingsLayout active="Mi perfil">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Mi perfil</h1>
          <p className="mt-1 text-sm text-[#676878]">Administra la información que compartes en ConectaUTP.</p>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-[minmax(0,1fr)_220px] gap-4 max-xl:grid-cols-1">
        <div>
          <div className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
            <div className="flex items-center gap-3"><div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#eef0f7] text-[#24304c]">{avatarUrl ? <img className="h-full w-full object-cover" src={avatarUrl} alt="Foto de perfil" /> : <UserCircle2 aria-hidden="true" className="h-8 w-8" />}</div><div><h2 className="text-base font-semibold">{[form.first_name, form.last_name].filter(Boolean).join(' ') || 'Tu nombre'}</h2><p className="text-sm text-[#676878]">@{form.username || 'username'}</p></div></div>
            <label className={`inline-flex min-h-10 cursor-pointer items-center rounded-md border border-[#7b32ca] px-4 text-sm text-[#7b32ca] ${isUploadingAvatar ? 'cursor-wait opacity-60' : ''}`}>
              {isUploadingAvatar ? 'Subiendo...' : 'Cambiar foto'}
              <input className="sr-only" type="file" accept="image/*" disabled={isUploadingAvatar} onChange={handleAvatarChange} />
            </label>
          </div>
          <form className="mt-3 rounded-lg border border-slate-200 p-3" onSubmit={handleSubmit}>
            <ProfileFormFields value={form} onChange={updateForm} disabled={!isEditing} />
            <div className="mt-5 flex justify-end gap-3 border-t border-slate-100 pt-4">
              {!isEditing ? (
                <Button variant="outline" type="button" className="text-sm" onClick={() => { setIsEditing(true); setMessage(''); setMessageIsError(false); }}>
                  Editar
                </Button>
              ) : <>
                <Button variant="outline" type="button" className="text-sm" disabled={isSaving} onClick={() => { if (profile) setForm(profileToForm(profile)); setIsEditing(false); setMessage(''); setMessageIsError(false); }}>
                  Cancelar
                </Button>
                <Button type="submit" className="text-sm" disabled={isSaving}>
                  {isSaving ? 'Guardando...' : 'Guardar cambios'}
                </Button>
              </>}
            </div>
            {message && <p className={`mt-3 rounded-md p-3 text-sm ${messageIsError ? 'bg-red-50 text-red-700' : 'bg-[#eaf8ee] text-[#268044]'}`} role={messageIsError ? 'alert' : 'status'} aria-live="polite">{message}</p>}
          </form>
        </div>
        <PublicProfilePreview value={form} avatarUrl={avatarUrl} />
      </div>
    </SettingsLayout>
  );
}
