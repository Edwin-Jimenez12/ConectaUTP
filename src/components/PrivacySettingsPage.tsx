import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from '../auth/useAuth';
import { supabase } from '../lib/supabase';
import type { IdentityPreference } from '../types/profile';
import { Button } from './Button';
import { SettingsLayout } from './SettingsLayout';

interface PrivacyForm {
  profile_visible: boolean;
  show_location: boolean;
  identity_preference: IdentityPreference;
}

const defaultForm: PrivacyForm = {
  profile_visible: true,
  show_location: false,
  identity_preference: 'name',
};

function PrivacyRow({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-100 py-4 last:border-0">
      <div>
        <h2 className="text-base font-semibold">{title}</h2>
        <p className="mt-1 max-w-[520px] text-sm leading-[1.4] text-[#676878]">{description}</p>
      </div>
      {children}
    </div>
  );
}

function Toggle({ checked, label, onChange }: { checked: boolean; label: string; onChange: () => void }) {
  return (
    <button className={`h-5 w-9 rounded-full p-0.5 ${checked ? 'bg-[#7b32ca]' : 'bg-slate-300'}`} type="button" role="switch" aria-checked={checked} aria-label={label} onClick={onChange}>
      <span className={`block h-4 w-4 rounded-full bg-white transition-transform ${checked ? 'translate-x-4' : ''}`} />
    </button>
  );
}

export function PrivacySettingsPage() {
  const { session } = useAuth();
  const [form, setForm] = useState(defaultForm);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!session) return;
    void supabase.from('profiles').select('profile_visible, show_location, identity_preference').eq('id', session.user.id).single()
      .then(({ data, error }) => {
        if (error) setMessage('No se pudo cargar tu configuración.');
        if (data) setForm(data as PrivacyForm);
        setIsLoading(false);
      });
  }, [session]);

  async function saveChanges() {
    if (!session) return;
    setIsSaving(true);
    setMessage('');
    const { error } = await supabase.from('profiles').update(form).eq('id', session.user.id);
    setMessage(error ? 'No se pudieron guardar los cambios.' : 'Privacidad actualizada correctamente.');
    setIsSaving(false);
  }

  if (isLoading) return <div className="flex min-h-[510px] items-center justify-center text-sm text-[#676878]">Cargando privacidad...</div>;

  return (
    <SettingsLayout active="Privacidad">
      <h1 className="text-3xl font-semibold">Privacidad</h1>
      <p className="mt-1 text-sm text-[#676878]">Controla qué información pueden ver otros usuarios.</p>
      <div className="mt-5 rounded-lg border border-slate-200 px-4">
        <PrivacyRow title="Perfil público" description="Permite que otros estudiantes encuentren tu perfil y conozcan tus servicios.">
          <Toggle checked={form.profile_visible} label="Perfil público" onChange={() => setForm({ ...form, profile_visible: !form.profile_visible })} />
        </PrivacyRow>
        <PrivacyRow title="Mostrar mi ubicación" description="Muestra tu distrito y provincia en tu perfil público.">
          <Toggle checked={form.show_location} label="Mostrar mi ubicación" onChange={() => setForm({ ...form, show_location: !form.show_location })} />
        </PrivacyRow>
        <PrivacyRow title="Mostrar mi correo electrónico" description="Tu correo permanecerá oculto para otros usuarios por seguridad.">
          <Toggle checked={false} label="Correo oculto" onChange={() => undefined} />
        </PrivacyRow>
        <PrivacyRow title="Preferencia de identidad" description="Elige cómo quieres que aparezca tu nombre en las publicaciones.">
          <select className="h-11 rounded border border-slate-200 px-3 text-sm" value={form.identity_preference} onChange={(event) => setForm({ ...form, identity_preference: event.target.value as IdentityPreference })}>
            <option value="name">Mostrar mi nombre</option>
            <option value="username">Mostrar mi username</option>
          </select>
        </PrivacyRow>
      </div>
      <div className="mt-4 flex justify-end gap-3">
        {message && <p className="mr-auto self-center text-sm text-[#6040b5]">{message}</p>}
        <Button className="text-sm" onClick={saveChanges} disabled={isSaving}>{isSaving ? 'Guardando...' : 'Guardar cambios'}</Button>
      </div>
    </SettingsLayout>
  );
}
