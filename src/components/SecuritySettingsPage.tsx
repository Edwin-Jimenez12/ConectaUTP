import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Button } from './Button';
import { SettingsLayout } from './SettingsLayout';

export function SecuritySettingsPage() {
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
    setIsSaving(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setMessage(error ? error.message : 'Contraseña actualizada correctamente.');
    if (!error) {
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
      <h1 className="text-[20px] font-semibold">Seguridad</h1>
      <p className="mt-1 text-[9px] text-[#676878]">Protege el acceso a tu cuenta de ConectaUTP.</p>
      <section className="mt-5 rounded-lg border border-slate-200 p-4">
        <h2 className="text-[12px] font-semibold">Cambiar contraseña</h2>
        <p className="mt-1 text-[9px] text-[#676878]">Usa una contraseña segura que no utilices en otros sitios.</p>
        <label className="mt-4 block text-[9px] text-[#676878]">Nueva contraseña<input className="mt-1 h-8 w-full rounded border border-slate-200 px-2 text-[10px]" type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} /></label>
        <label className="mt-3 block text-[9px] text-[#676878]">Confirmar contraseña<input className="mt-1 h-8 w-full rounded border border-slate-200 px-2 text-[10px]" type="password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} /></label>
        <Button className="mt-4 min-h-8 text-[9px]" onClick={updatePassword} disabled={isSaving}>{isSaving ? 'Actualizando...' : 'Actualizar contraseña'}</Button>
      </section>
      <section className="mt-4 rounded-lg border border-slate-200 p-4">
        <div className="flex items-center justify-between"><div><h2 className="text-[12px] font-semibold">Sesiones activas</h2><p className="mt-1 text-[9px] text-[#676878]">Navegador actual</p></div><span className="rounded bg-[#eaf8ee] px-2 py-1 text-[8px] text-[#268044]">Esta sesión</span></div>
        <button className="mt-4 text-[9px] text-[#7b32ca]" type="button" onClick={closeOtherSessions}>Cerrar todas las demás sesiones</button>
      </section>
      {message && <p className="mt-3 rounded-md bg-[#f0edff] p-3 text-[10px] text-[#6040b5]">{message}</p>}
    </SettingsLayout>
  );
}
