import { useState } from 'react';
import type { FormEvent } from 'react';
import { useAuth } from '../auth/useAuth';
import { Button } from '../components/Button';
import { supabase } from '../lib/supabase';

const topics = [
  { icon: '?', title: 'Consultas generales', text: 'Resuelve tus dudas sobre ConectaUTP.' },
  { icon: '!', title: 'Reportar un problema', text: 'Ayúdanos a mejorar la plataforma.' },
  { icon: '✦', title: 'Comparte una sugerencia', text: 'Tu opinión nos ayuda a crecer.' },
];
const questions = ['¿Cómo puedo publicar un servicio?', '¿Cómo contacto a un proveedor?', '¿Cómo reporto un problema?'];

function TopicCard({ icon, title, text }: (typeof topics)[number]) {
  return <button className="flex w-full items-center gap-4 rounded-lg border border-slate-200 bg-white p-4 text-left" type="button"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#f0eaff] text-xl font-semibold text-[#7b32ca]">{icon}</span><span className="flex-1"><strong className="block text-sm">{title}</strong><small className="mt-1 block text-xs text-[#676878]">{text}</small></span><span className="text-xl text-[#676878]">›</span></button>;
}

function ContactHero() {
  return <section className="border-b border-slate-100 bg-linear-to-r from-white via-[#f8f7ff] to-[#e9e4ff]"><div className="mx-auto flex min-h-[250px] w-[calc(100%-48px)] max-w-7xl items-center justify-between max-md:py-8"><div><h1 className="text-4xl font-bold tracking-[-1px] max-sm:text-3xl">Estamos aquí para ayudarte</h1><p className="mt-4 max-w-[520px] text-base leading-[1.45] text-[#5c5e70]">¿Tienes alguna pregunta, sugerencia o necesitas<br />reportar un problema? Escríbenos.</p></div><div className="relative hidden h-[130px] w-[390px] items-center justify-center overflow-hidden sm:flex"><div className="absolute h-[110px] w-[110px] rounded-full border border-[#bda3f1]" /><div className="absolute h-20 w-[270px] rotate-[-12deg] rounded-[50%] border border-[#bda3f1]" /><div className="flex h-20 w-20 items-center justify-center rounded-full bg-white p-5 shadow-[0_4px_20px_rgba(61,68,218,0.18)]"><img className="h-10 w-10 object-contain" src="/Logo.svg" alt="" aria-hidden="true" /></div><span className="absolute right-4 rounded border-2 border-[#6842dd] px-5 py-3 text-3xl text-[#6842dd]">✉</span></div></div></section>;
}

function ContactForm() {
  const { session } = useAuth();
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  async function submitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSending(true);
    setMessage('');
    const form = new FormData(event.currentTarget);
    const result = await supabase.from('contact_messages').insert({
      sender_id: session?.user.id ?? null,
      full_name: String(form.get('full_name') ?? '').trim(),
      email: String(form.get('email') ?? '').trim(),
      topic: String(form.get('topic') ?? '').trim(),
      message: String(form.get('message') ?? '').trim(),
    });
    setMessage(result.error ? 'No se pudo enviar el mensaje. Ejecuta la migración de contacto en Supabase.' : 'Mensaje enviado correctamente.');
    if (!result.error) event.currentTarget.reset();
    setIsSending(false);
  }

  return <form className="rounded-lg border border-slate-200 bg-white p-5" onSubmit={submitForm}><h2 className="text-lg font-semibold">Envíanos un mensaje</h2><label className="mt-5 block text-sm font-medium" htmlFor="contact-name">Nombre completo</label><input className="mt-2 h-10 w-full rounded-md border border-slate-200 px-3 text-sm" id="contact-name" name="full_name" required minLength={2} /><label className="mt-4 block text-sm font-medium" htmlFor="contact-email">Correo electrónico</label><input className="mt-2 h-10 w-full rounded-md border border-slate-200 px-3 text-sm" id="contact-email" name="email" type="email" required /><label className="mt-4 block text-sm font-medium" htmlFor="contact-topic">Motivo de contacto</label><select className="mt-2 h-10 w-full rounded-md border border-slate-200 px-3 text-sm" id="contact-topic" name="topic" defaultValue="" required><option value="" disabled>Selecciona una opción</option><option>Consulta general</option><option>Reportar un problema</option><option>Compartir una sugerencia</option></select><label className="mt-4 block text-sm font-medium" htmlFor="contact-message">Mensaje</label><textarea className="mt-2 min-h-28 w-full resize-none rounded-md border border-slate-200 p-3 text-sm" id="contact-message" name="message" required minLength={10} /><Button className="mt-4 w-full text-sm" type="submit" disabled={isSending}>{isSending ? 'Enviando...' : 'Enviar mensaje'}</Button><p className="mt-3 text-xs text-[#676878]">Usaremos tus datos únicamente para responder a tu mensaje.</p>{message && <p className="mt-3 rounded bg-[#f0edff] p-3 text-xs text-[#6040b5]">{message}</p>}</form>;
}

export function Contactanos() {
  return <><ContactHero /><section className="mx-auto grid w-[calc(100%-48px)] max-w-7xl gap-6 py-8 lg:grid-cols-[1fr_1fr]"><ContactForm /><div className="flex flex-col gap-3">{topics.map((topic) => <TopicCard key={topic.title} {...topic} />)}<div className="rounded-lg border border-slate-200 bg-white p-4"><h2 className="mb-3 text-base font-semibold">Preguntas frecuentes</h2><div className="flex flex-col gap-2">{questions.map((question) => <button className="flex min-h-9 items-center justify-between rounded border border-slate-200 px-3 text-left text-xs" key={question} type="button">{question}<span>⌄</span></button>)}</div></div></div></section><section className="mx-auto mb-4 flex w-[calc(100%-48px)] max-w-7xl items-center justify-between rounded-lg bg-linear-to-r from-[#6422d0] to-[#2671eb] px-8 py-5 text-white max-md:flex-wrap max-md:gap-4 max-md:px-5"><div><h2 className="text-xl font-semibold">Tu opinión también conecta</h2><p className="mt-1 text-sm">Construyamos juntos una mejor comunidad UTP.</p></div><Button variant="secondary" className="min-h-10 border-white bg-transparent text-sm text-white">Crear una cuenta</Button></section></>;
}
