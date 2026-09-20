import { useState } from 'react';
import type { FormEvent } from 'react';
import { Sparkles } from 'lucide-react';
import { useAuth } from '../auth/useAuth';
import { Button } from '../components/Button';
import { supabase } from '../lib/supabase';

interface FeedbackForm {
  firstName: string;
  lastName: string;
  email: string;
  feedback: string;
  website: string;
}

const emptyForm: FeedbackForm = { firstName: '', lastName: '', email: '', feedback: '', website: '' };

function FeedbackHero() {
  return <section className="relative overflow-hidden bg-linear-to-br from-[#241550] via-[#5922b6] to-[#2475e9] text-white"><div className="pointer-events-none absolute -right-20 -top-32 h-80 w-80 rounded-full border border-white/20" /><div className="pointer-events-none absolute right-24 top-12 h-44 w-44 rounded-full border border-white/15" /><div className="pointer-events-none absolute -bottom-36 left-1/3 h-80 w-80 rounded-full bg-white/10 blur-3xl" /><div className="relative mx-auto grid min-h-[330px] w-[calc(100%-48px)] max-w-7xl items-center gap-10 py-12 lg:grid-cols-[1.1fr_0.9fr]"><div><p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#d9c8ff]">Construyamos juntos</p><h1 className="mt-4 max-w-2xl text-5xl font-bold leading-[1.05] tracking-[-1.5px] max-md:text-4xl">Tu opinión ayuda a darle forma a ConectaUTP.</h1><p className="mt-5 max-w-xl text-base leading-7 text-white/80">Queremos crear una comunidad útil, cercana y hecha para estudiantes. Cuéntanos qué podemos mejorar.</p></div><div className="relative hidden min-h-48 items-center justify-center lg:flex"><div className="absolute h-48 w-48 rounded-full border border-white/25" /><div className="absolute h-28 w-64 rotate-[-18deg] rounded-[50%] border border-white/20" /><div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-white text-[#6b2bd3] shadow-2xl"><Sparkles aria-hidden="true" className="h-10 w-10" /></div><span className="absolute right-8 top-4 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs text-white/80">Ideas que conectan</span><span className="absolute bottom-3 left-5 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs text-white/80">Mejoras reales</span></div></div></section>;
}

export function Contactanos() {
  const { profile, session } = useAuth();
  const [form, setForm] = useState<FeedbackForm>({
    ...emptyForm,
    firstName: profile?.first_name ?? '',
    lastName: profile?.last_name ?? '',
    email: session?.user.email ?? '',
  });
  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  function updateForm(changes: Partial<FeedbackForm>) {
    setForm((current) => ({ ...current, ...changes }));
  }

  async function submitFeedback(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSending(true);
    setMessage('');
    const { data, error } = await supabase.functions.invoke('send-feedback', { body: form });
    const functionError = data?.error as string | undefined;
    if (error || functionError) {
      setMessage(functionError ?? 'No se pudo enviar tu opinión. Inténtalo nuevamente.');
      setMessageType('error');
    } else {
      setMessage('Tu opinión fue enviada correctamente a ConectaUTP.');
      setMessageType('success');
      setForm((current) => ({ ...emptyForm, firstName: current.firstName, lastName: current.lastName, email: current.email }));
    }
    setIsSending(false);
  }

  return <><FeedbackHero /><section className="mx-auto grid w-[calc(100%-48px)] max-w-7xl gap-8 py-12 lg:grid-cols-[0.85fr_1.15fr]"><div className="pt-3"><p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#7b32ca]">Tu opinión es importante para nosotros</p><h2 className="mt-4 text-3xl font-bold leading-tight">Mejoremos ConectaUTP contigo.</h2><p className="mt-5 text-base leading-7 text-[#676878]">Envíanos tus ideas, observaciones o sugerencias. Tu mensaje llegará directamente al equipo de ConectaUTP por correo electrónico.</p><div className="mt-8 space-y-4"><div className="flex gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#eeeaff] text-[#7b32ca]">1</span><p className="text-sm leading-6"><strong className="block">Cuéntanos qué piensas</strong><span className="text-[#676878]">No necesitas encontrar las palabras perfectas.</span></p></div><div className="flex gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#eeeaff] text-[#7b32ca]">2</span><p className="text-sm leading-6"><strong className="block">Lo revisamos</strong><span className="text-[#676878]">Cada opinión nos ayuda a priorizar mejoras.</span></p></div><div className="flex gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#eeeaff] text-[#7b32ca]">3</span><p className="text-sm leading-6"><strong className="block">Seguimos conectando</strong><span className="text-[#676878]">Construimos una mejor comunidad UTP juntos.</span></p></div></div></div><form className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm max-sm:p-4" onSubmit={submitFeedback}><div className="mb-6"><h2 className="text-xl font-semibold">Comparte tu opinión</h2><p className="mt-1 text-sm text-[#676878]">El mensaje será enviado a conectautp2@gmail.com.</p></div><div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-medium">Nombre<input className="mt-2 h-11 w-full rounded-lg border border-slate-200 px-3 text-sm" required minLength={2} maxLength={60} value={form.firstName} onChange={(event) => updateForm({ firstName: event.target.value })} /></label><label className="text-sm font-medium">Apellido<input className="mt-2 h-11 w-full rounded-lg border border-slate-200 px-3 text-sm" required minLength={2} maxLength={60} value={form.lastName} onChange={(event) => updateForm({ lastName: event.target.value })} /></label></div><label className="mt-4 block text-sm font-medium">Correo electrónico<input className="mt-2 h-11 w-full rounded-lg border border-slate-200 px-3 text-sm" required type="email" value={form.email} onChange={(event) => updateForm({ email: event.target.value })} /></label><label className="mt-4 block text-sm font-medium">¿Qué te gustaría mejorar?<textarea className="mt-2 min-h-40 w-full resize-y rounded-lg border border-slate-200 p-3 text-sm" required minLength={10} maxLength={3000} value={form.feedback} onChange={(event) => updateForm({ feedback: event.target.value })} placeholder="Escribe aquí tus ideas, sugerencias u observaciones..." /></label><input className="hidden" tabIndex={-1} autoComplete="off" value={form.website} onChange={(event) => updateForm({ website: event.target.value })} aria-hidden="true" /><Button className="mt-5 w-full" type="submit" disabled={isSending}>{isSending ? 'Enviando opinión...' : 'Enviar mi opinión'}</Button>{message && <p className={`mt-4 rounded-lg p-3 text-sm ${messageType === 'success' ? 'bg-[#eaf8ee] text-[#268044]' : 'bg-[#fff0f0] text-[#b42318]'}`} role="status" aria-live="polite">{message}</p>}</form></section></>;
}
