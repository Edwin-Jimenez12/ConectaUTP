import { useEffect, useState } from 'react';
import { useAuth } from '../auth/useAuth';
import { supabase } from '../lib/supabase';
import type { InstitutionalEmailStatus } from '../types/profile';
import { Button } from './Button';
import { SettingsLayout } from './SettingsLayout';

const statusText: Record<InstitutionalEmailStatus, string> = {
  not_added: 'No agregado', pending: 'Pendiente', verified: 'Verificado', rejected: 'Rechazado',
};

export function AccountSettingsPage() {
  const { session, signOut } = useAuth();
  const [status, setStatus] = useState<InstitutionalEmailStatus>('not_added');
  const [message, setMessage] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!session) return;
    void supabase.from('profiles').select('institutional_email, institutional_email_status').eq('id', session.user.id).single()
      .then(({ data, error }) => {
        if (error) setMessage('No se pudo cargar el estado de la cuenta.');
        if (data?.institutional_email) setStatus(data.institutional_email_status as InstitutionalEmailStatus);
      });
  }, [session]);

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
        <div className="mt-3 flex items-center justify-between rounded bg-[#fff7df] p-4"><div><p className="text-sm font-semibold text-[#735d22]">Correo institucional</p><p className="mt-1 text-sm text-[#8b752c]">La verificación institucional se gestiona desde esta cuenta.</p></div><span className="rounded bg-[#ffe7a2] px-2 py-1 text-xs text-[#735d22]">{statusText[status]}</span></div>
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
