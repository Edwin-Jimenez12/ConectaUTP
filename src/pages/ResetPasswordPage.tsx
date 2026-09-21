import { useState } from 'react';
import type { FormEvent } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Button } from '../components/Button';

export function ResetPasswordPage({ theme }: { theme: 'light' | 'dark' }) {
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [message, setMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');
    if (password.length < 8) {
      setMessage('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (password !== confirmation) {
      setMessage('Las contraseñas no coinciden.');
      return;
    }

    setIsSaving(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setMessage('El enlace no es válido o ya expiró. Solicita otro enlace de recuperación.');
    } else {
      await supabase.auth.signOut();
      window.location.hash = '#login';
    }
    setIsSaving(false);
  }

  return (
    <section className="flex min-h-[560px] items-center justify-center bg-linear-to-br from-[#f8f7ff] to-[#e9e4ff] px-4 py-10">
      <form className="w-full max-w-[400px] rounded-xl border border-slate-200 bg-white p-7 shadow-[0_8px_30px_rgba(61,68,218,0.1)]" onSubmit={handleSubmit}>
        <div className="text-center"><img className="mx-auto h-10 w-auto" src={theme === 'dark' ? '/LogoBlanco.svg' : '/LogoCompleto.svg'} alt="ConectaUTP" /><h1 className="mt-5 text-3xl font-semibold">Crea una nueva contraseña</h1><p className="mt-2 text-sm text-[#676878]">Elige una contraseña segura para volver a entrar.</p></div>
        <PasswordField label="Nueva contraseña" value={password} showPassword={showPassword} autoComplete="new-password" onChange={setPassword} onToggle={() => setShowPassword((current) => !current)} />
        <PasswordField label="Confirmar contraseña" value={confirmation} showPassword={showConfirmation} autoComplete="new-password" onChange={setConfirmation} onToggle={() => setShowConfirmation((current) => !current)} />
        {message && <p className="mt-4 rounded-md bg-[#f0edff] p-3 text-sm text-[#6040b5]">{message}</p>}
        <Button type="submit" className="mt-5 w-full" disabled={isSaving}>{isSaving ? 'Guardando...' : 'Guardar nueva contraseña'}</Button>
        <p className="mt-5 text-center text-sm text-[#676878]"><a className="font-semibold text-[#7b32ca]" href="#login">Volver al inicio de sesión</a></p>
      </form>
    </section>
  );
}

function PasswordField({ label, value, showPassword, autoComplete, onChange, onToggle }: { label: string; value: string; showPassword: boolean; autoComplete: string; onChange: (value: string) => void; onToggle: () => void }) {
  return <label className="mt-4 block text-sm font-medium">{label}<span className="relative mt-1 block"><input className="h-11 w-full rounded-md border border-slate-200 px-3 pr-10 text-base outline-none focus:border-[#7b32ca]" type={showPassword ? 'text' : 'password'} value={value} minLength={8} autoComplete={autoComplete} required onChange={(event) => onChange(event.target.value)} /><button className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-[#676878] hover:bg-[#f0edff] hover:text-[#7b32ca]" type="button" aria-label={showPassword ? `Ocultar ${label.toLowerCase()}` : `Mostrar ${label.toLowerCase()}`} onClick={onToggle}>{showPassword ? <EyeOff aria-hidden="true" className="h-4 w-4" /> : <Eye aria-hidden="true" className="h-4 w-4" />}</button></span></label>;
}
