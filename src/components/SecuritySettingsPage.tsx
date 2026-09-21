import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Button } from './Button';
import { SettingsLayout } from './SettingsLayout';
import { useAuth } from '../auth/useAuth';

export function SecuritySettingsPage() {
  const { session } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [message, setMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  async function updatePassword() {
    setMessage('');
    if (newPassword.length < 8) {
      setMessage('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (newPassword !== confirmation) {
      setMessage('Las contraseñas no coinciden.');
      return;
    }
    if (!session?.user.email) {
      setMessage('No se pudo identificar el correo de tu cuenta para verificar la contraseña actual.');
      return;
    }
    setIsSaving(true);
    const verification = await supabase.auth.signInWithPassword({ email: session.user.email, password: currentPassword });
    if (verification.error) {
      setMessage('La contraseña actual no es correcta.');
      setIsSaving(false);
      return;
    }
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setMessage(error ? error.message : 'Contraseña actualizada correctamente.');
    if (!error) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmation('');
    }
    setIsSaving(false);
  }

  async function closeOtherSessions() {
    const { error } = await supabase.auth.signOut({ scope: 'others' });
    setMessage(error ? 'No se pudieron cerrar las otras sesiones.' : 'Las otras sesiones fueron cerradas.');
  }

  return (
    <SettingsLayout active="Seguridad">
      <h1 className="text-3xl font-semibold">Seguridad</h1>
      <p className="mt-1 text-sm text-[#676878]">Protege el acceso a tu cuenta de ConectaUTP.</p>
      <section className="mt-5 rounded-lg border border-slate-200 p-4">
        <h2 className="text-lg font-semibold">Cambiar contraseña</h2>
        <p className="mt-1 text-sm text-[#676878]">Confirma tu contraseña actual antes de establecer una nueva.</p>
        <label className="mt-4 block text-sm text-[#676878]">Contraseña actual<input className="mt-1 h-11 w-full rounded border border-slate-200 px-3 text-base" type="password" autoComplete="current-password" minLength={6} required value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} /></label>
        <label className="mt-3 block text-sm text-[#676878]">Nueva contraseña<input className="mt-1 h-11 w-full rounded border border-slate-200 px-3 text-base" type="password" autoComplete="new-password" minLength={8} required value={newPassword} onChange={(event) => setNewPassword(event.target.value)} /></label>
        <label className="mt-3 block text-sm text-[#676878]">Confirmar contraseña<input className="mt-1 h-11 w-full rounded border border-slate-200 px-3 text-base" type="password" autoComplete="new-password" minLength={8} required value={confirmation} onChange={(event) => setConfirmation(event.target.value)} /></label>
        <Button className="mt-4 text-sm" onClick={updatePassword} disabled={isSaving}>{isSaving ? 'Actualizando...' : 'Actualizar contraseña'}</Button>
      </section>
      <section className="mt-4 rounded-lg border border-slate-200 p-4">
        <div className="flex items-center justify-between"><div><h2 className="text-lg font-semibold">Sesiones activas</h2><p className="mt-1 text-sm text-[#676878]">Navegador actual</p></div><span className="rounded bg-[#eaf8ee] px-2 py-1 text-xs text-[#268044]">Esta sesión</span></div>
        <button className="mt-4 text-sm text-[#7b32ca]" type="button" onClick={closeOtherSessions}>Cerrar todas las demás sesiones</button>
      </section>
      {message && <p className="mt-3 rounded-md bg-[#f0edff] p-3 text-sm text-[#6040b5]">{message}</p>}
    </SettingsLayout>
  );
}
