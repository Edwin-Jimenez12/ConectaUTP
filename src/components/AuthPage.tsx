import { useState } from 'react';
import type { FormEvent } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { signInWithIdentifier } from '../lib/auth';
import { Button } from './Button';

interface AuthPageProps {
  mode: 'login' | 'register';
  theme: 'light' | 'dark';
}

export function AuthPage({ mode, theme }: AuthPageProps) {
  const isRegister = mode === 'register';
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');
    setIsLoading(true);

    try {
      const result = isRegister
        ? await supabase.auth.signUp({
            email: identifier,
            password,
            options: { data: { first_name: firstName, last_name: lastName, username } },
          })
        : await signInWithIdentifier(identifier, password);

      if (result.error) {
        setMessage(result.error.message);
      } else if (isRegister && !result.data.session) {
        setMessage('Revisa tu correo para confirmar tu cuenta.');
      } else {
        window.location.hash = '#configuracion';
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudo conectar con Supabase. Inténtalo nuevamente.');
    } finally {
      setIsLoading(false);
    }
  }

  function updateUsername(value: string) {
    setUsername(value.toLowerCase().replace(/[^a-z0-9._]/g, '').slice(0, 30));
  }

  return (
    <section className="flex min-h-[560px] items-center justify-center bg-linear-to-br from-[#f8f7ff] to-[#e9e4ff] px-4 py-10">
      <form className="w-full max-w-[400px] rounded-xl border border-slate-200 bg-white p-7 shadow-[0_8px_30px_rgba(61,68,218,0.1)]" onSubmit={handleSubmit}>
        <div className="text-center"><img className="mx-auto h-10 w-auto" src={theme === 'dark' ? '/LogoBlanco.svg' : '/LogoCompleto.svg'} alt="ConectaUTP" /><h1 className="mt-5 text-3xl font-semibold">{isRegister ? 'Crea tu cuenta' : 'Bienvenido de nuevo'}</h1><p className="mt-2 text-sm text-[#676878]">{isRegister ? 'Únete a la comunidad UTP y comparte tu talento.' : 'Ingresa para continuar en ConectaUTP.'}</p></div>
        {isRegister && <div className="mt-6 grid grid-cols-2 gap-3 max-sm:grid-cols-1"><AuthField label="Nombre" value={firstName} onChange={setFirstName} /><AuthField label="Apellido" value={lastName} onChange={setLastName} /></div>}
        {isRegister && <AuthField className="mt-4" label="Nombre de usuario" value={username} onChange={updateUsername} placeholder="ejemplo_01" />}
        <AuthField className="mt-4" label={isRegister ? 'Correo electrónico' : 'Correo o nombre de usuario'} type={isRegister ? 'email' : 'text'} value={identifier} onChange={setIdentifier} required />
        <PasswordField value={password} showPassword={showPassword} onChange={setPassword} onToggle={() => setShowPassword(!showPassword)} />
        {message && <p className="mt-4 rounded-md bg-[#f0edff] p-3 text-sm text-[#6040b5]">{message}</p>}
        <Button type="submit" className="mt-5 w-full" disabled={isLoading}>{isLoading ? 'Procesando...' : isRegister ? 'Crear cuenta' : 'Iniciar sesión'}</Button>
        <p className="mt-5 text-center text-sm text-[#676878]">{isRegister ? '¿Ya tienes una cuenta?' : '¿Todavía no tienes una cuenta?'} <a className="font-semibold text-[#7b32ca]" href={isRegister ? '#login' : '#registro'}>{isRegister ? 'Inicia sesión' : 'Regístrate'}</a></p>
      </form>
    </section>
  );
}

interface AuthFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
  type?: 'text' | 'email' | 'password';
  minLength?: number;
  required?: boolean;
}

function AuthField({ label, value, onChange, className = '', placeholder, type = 'text', minLength, required = true }: AuthFieldProps) {
  return <label className={`block text-sm font-medium ${className}`}>{label}<input className="mt-1 h-11 w-full rounded-md border border-slate-200 px-3 text-base outline-none focus:border-[#7b32ca]" type={type} value={value} placeholder={placeholder} minLength={minLength} required={required} onChange={(event) => onChange(event.target.value)} /></label>;
}

interface PasswordFieldProps {
  value: string;
  showPassword: boolean;
  onChange: (value: string) => void;
  onToggle: () => void;
}

function PasswordField({ value, showPassword, onChange, onToggle }: PasswordFieldProps) {
  return (
    <label className="mt-4 block text-sm font-medium">
      Contraseña
      <span className="relative mt-1 block">
        <input
          className="h-11 w-full rounded-md border border-slate-200 px-3 pr-10 text-base outline-none focus:border-[#7b32ca]"
          type={showPassword ? 'text' : 'password'}
          value={value}
          minLength={6}
          required
          onChange={(event) => onChange(event.target.value)}
        />
        <button
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-[#676878] hover:bg-[#f0edff] hover:text-[#7b32ca]"
          type="button"
          aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          onClick={onToggle}
        >
          {showPassword ? <EyeOff aria-hidden="true" className="h-4 w-4" /> : <Eye aria-hidden="true" className="h-4 w-4" />}
        </button>
      </span>
    </label>
  );
}
