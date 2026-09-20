import { useState } from 'react';
import { useAuth } from '../auth/useAuth';
import { supabase } from '../lib/supabase';
import { Button } from './Button';
import { SettingsLayout } from './SettingsLayout';

export function AccountSettingsPage() {
  const { session, signOut } = useAuth();
  const [message, setMessage] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  async function deleteAccount() {
    if (!window.confirm('¿Deseas eliminar tu cuenta? Esta acción no se puede deshacer.')) return;
    setIsDeleting(true);
    setMessage('');
    const { error } = await supabase.functions.invoke('delete-account');
    if (error) {
      setMessage('No se pudo eliminar la cuenta. Verifica que la función esté desplegada.');
      setIsDeleting(false);
      return;
    }
    await signOut();
  }

  return (
    <SettingsLayout active="Mi cuenta">
      <h1 className="text-3xl font-semibold">Mi cuenta</h1>
      <p className="mt-1 text-sm text-[#676878]">Administra los datos principales de tu cuenta.</p>
      <section className="mt-5 rounded-lg border border-slate-200 p-4">
        <h2 className="text-lg font-semibold">Datos de acceso</h2>
        <label className="mt-4 block text-sm text-[#676878]">Correo electrónico<input className="mt-1 h-11 w-full rounded border border-slate-200 bg-[#f8f8fb] px-3 text-base" value={session?.user.email ?? ''} readOnly /></label>
      </section>
      <section className="mt-4 rounded-lg border border-red-200 p-4">
        <h2 className="text-lg font-semibold text-[#b42318]">Zona de peligro</h2>
        <p className="mt-1 max-w-[620px] text-sm leading-[1.4] text-[#676878]">Eliminar tu cuenta quitará tu perfil y tus servicios. Esta acción requiere una función segura del servidor.</p>
        <Button variant="outline" className="mt-4 border-red-300 text-sm text-[#b42318]" onClick={deleteAccount} disabled={isDeleting}>{isDeleting ? 'Eliminando...' : 'Eliminar mi cuenta'}</Button>
      </section>
      <div className="mt-4 flex justify-end gap-3">{message && <p className="mr-auto self-center text-sm text-[#6040b5]">{message}</p>}<Button variant="outline" className="text-sm" onClick={signOut}>Cerrar sesión</Button></div>
    </SettingsLayout>
  );
}
