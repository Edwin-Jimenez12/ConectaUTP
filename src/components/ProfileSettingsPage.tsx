import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useAuth } from '../auth/useAuth';
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
  const { session } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [form, setForm] = useState<ProfileFormData>(emptyForm);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  async function loadProfile(userId: string) {
    setIsLoading(true);
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
    if (error) {
      setMessage('No se pudo cargar tu perfil.');
    } else if (data) {
      const currentProfile = data as Profile;
      setProfile(currentProfile);
      setForm(profileToForm(currentProfile));
    } else {
      const { data: created, error: createError } = await supabase.from('profiles').insert({ id: userId }).select().single();
      if (createError) {
        setMessage('No se pudo crear tu perfil.');
      } else {
        const createdProfile = created as Profile;
        setProfile(createdProfile);
        setForm(profileToForm(createdProfile));
      }
    }
    setIsLoading(false);
  }

  useEffect(() => {
    if (session) void Promise.resolve().then(() => loadProfile(session.user.id));
  }, [session]);

  function updateForm(changes: Partial<ProfileFormData>) {
    setForm((current) => ({ ...current, ...changes }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!session) return;
    setIsSaving(true);
    setMessage('');
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
    } else {
      const updatedProfile = data as Profile;
      setProfile(updatedProfile);
      setForm(profileToForm(updatedProfile));
      setMessage('Cambios guardados correctamente.');
    }
    setIsSaving(false);
  }

  if (isLoading) return <div className="flex min-h-[510px] items-center justify-center text-sm text-[#676878]">Cargando perfil...</div>;

  return (
    <SettingsLayout active="Mi perfil">
      <div className="flex items-center justify-between">
        <div><h1 className="text-[20px] font-semibold">Mi perfil</h1><p className="mt-1 text-[9px] text-[#676878]">Administra la información que compartes en ConectaUTP.</p></div>
      </div>
      <div className="mt-4 grid grid-cols-[minmax(0,1fr)_220px] gap-4 max-xl:grid-cols-1">
        <div>
          <div className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
            <div className="flex items-center gap-3"><span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#eef0f7] text-2xl text-[#24304c]">●</span><div><h2 className="text-[12px] font-semibold">{[form.first_name, form.last_name].filter(Boolean).join(' ') || 'Tu nombre'}</h2><p className="text-[9px] text-[#676878]">@{form.username || 'username'}</p><span className="mt-1 inline-block rounded bg-[#fff0c8] px-2 py-1 text-[8px] text-[#99751d]">◉ Verificación institucional pendiente</span></div></div>
            <Button variant="outline" className="min-h-7 text-[9px]" disabled>Cambiar foto</Button>
          </div>
          <form className="mt-3 rounded-lg border border-slate-200 p-3" onSubmit={handleSubmit}>
            <ProfileFormFields value={form} onChange={updateForm} />
            <div className="mt-4 flex justify-end gap-2 border-t border-slate-100 pt-3"><Button variant="outline" type="button" className="min-h-8 text-[9px]" onClick={() => profile && setForm(profileToForm(profile))}>Cancelar</Button><Button type="submit" className="min-h-8 text-[9px]" disabled={isSaving}>{isSaving ? 'Guardando...' : 'Guardar cambios'}</Button></div>
          </form>
          {message && <p className="mt-3 rounded-md bg-[#f0edff] p-3 text-[10px] text-[#6040b5]">{message}</p>}
        </div>
        <PublicProfilePreview value={form} verificationStatus={profile?.institutional_email_status ?? 'not_added'} />
      </div>
    </SettingsLayout>
  );
}
