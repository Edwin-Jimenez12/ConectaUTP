import { Button } from './Button';

const topics = [
  { icon: '?', title: 'Consultas generales', text: 'Resuelve tus dudas sobre ConectaUTP.' },
  { icon: '!', title: 'Reportar un problema', text: 'Ayúdanos a mejorar la plataforma.' },
  { icon: '✦', title: 'Comparte una sugerencia', text: 'Tu opinión nos ayuda a crecer.' },
];

const questions = [
  '¿Cómo puedo publicar un servicio?',
  '¿Cómo contacto a un proveedor?',
  '¿Cómo reporto un problema?',
];

function TopicCard({ icon, title, text }: (typeof topics)[number]) {
  return (
    <button className="flex w-full items-center gap-4 rounded-lg border border-slate-200 bg-white p-3 text-left" type="button">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f0eaff] text-xl font-semibold text-[#7b32ca]">{icon}</span>
      <span className="flex-1">
        <strong className="block text-[12px]">{title}</strong>
        <small className="mt-1 block text-[9px] text-[#676878]">{text}</small>
      </span>
      <span className="text-xl text-[#676878]">›</span>
    </button>
  );
}

export function ContactPage() {
  return (
    <>
      <section className="border-b border-slate-100 bg-linear-to-r from-white via-[#f8f7ff] to-[#e9e4ff]">
        <div className="mx-auto flex min-h-[180px] w-[calc(100%-48px)] max-w-[1080px] items-center justify-between">
          <div>
            <h1 className="text-[30px] font-bold tracking-[-1px]">Estamos aquí para ayudarte</h1>
            <p className="mt-3 max-w-[390px] text-[13px] leading-[1.45] text-[#5c5e70]">¿Tienes alguna pregunta, sugerencia o necesitas<br />reportar un problema? Escríbenos.</p>
          </div>
          <div className="relative hidden h-[130px] w-[390px] items-center justify-center overflow-hidden sm:flex">
            <div className="absolute h-[110px] w-[110px] rounded-full border border-[#bda3f1]" />
            <div className="absolute h-20 w-[270px] rotate-[-12deg] rounded-[50%] border border-[#bda3f1]" />
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white p-5 shadow-[0_4px_20px_rgba(61,68,218,0.18)]">
              <img className="h-10 w-10 object-contain" src="/Logo.svg" alt="" aria-hidden="true" />
            </div>
            <span className="absolute right-4 rounded border-2 border-[#6842dd] px-5 py-3 text-3xl text-[#6842dd]">✉</span>
          </div>
        </div>
      </section>
      <section className="mx-auto grid w-[calc(100%-48px)] max-w-[1080px] gap-4 py-6 lg:grid-cols-[1fr_1fr]">
        <form className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-[15px] font-semibold">Envíanos un mensaje</h2>
          <label className="mt-4 block text-[10px] font-medium" htmlFor="contact-name">Nombre completo</label>
          <input className="mt-1 h-8 w-full rounded-md border border-slate-200 px-2 text-[10px]" id="contact-name" />
          <label className="mt-3 block text-[10px] font-medium" htmlFor="contact-email">Correo electrónico</label>
          <input className="mt-1 h-8 w-full rounded-md border border-slate-200 px-2 text-[10px]" id="contact-email" type="email" />
          <label className="mt-3 block text-[10px] font-medium" htmlFor="contact-topic">Motivo de contacto</label>
          <select className="mt-1 h-8 w-full rounded-md border border-slate-200 px-2 text-[10px]" id="contact-topic" defaultValue="">
            <option value="" disabled>Selecciona una opción</option>
            <option>Consulta general</option>
            <option>Reportar un problema</option>
            <option>Compartir una sugerencia</option>
          </select>
          <label className="mt-3 block text-[10px] font-medium" htmlFor="contact-message">Mensaje</label>
          <textarea className="mt-1 h-20 w-full resize-none rounded-md border border-slate-200 p-2 text-[10px]" id="contact-message" />
          <Button className="mt-3 w-full min-h-8 text-[10px]">Enviar mensaje</Button>
          <p className="mt-2 text-[9px] text-[#676878]">Usaremos tus datos únicamente para responder a tu mensaje.</p>
        </form>
        <div className="flex flex-col gap-2">
          {topics.map((topic) => <TopicCard key={topic.title} {...topic} />)}
          <div className="rounded-lg border border-slate-200 bg-white p-3">
            <h2 className="mb-2 text-[13px] font-semibold">Preguntas frecuentes</h2>
            <div className="flex flex-col gap-1">
              {questions.map((question) => (
                <button className="flex h-7 items-center justify-between rounded border border-slate-200 px-2 text-left text-[9px]" key={question} type="button">
                  {question}<span>⌄</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>
      <section className="mx-auto mb-3 flex w-[calc(100%-48px)] max-w-[1080px] items-center justify-between rounded-lg bg-linear-to-r from-[#6422d0] to-[#2671eb] px-8 py-4 text-white">
        <div><h2 className="text-[17px] font-semibold">Tu opinión también conecta</h2><p className="mt-1 text-[10px]">Construyamos juntos una mejor comunidad UTP.</p></div>
        <Button variant="secondary" className="min-h-8 border-white bg-transparent text-white">Crear una cuenta</Button>
      </section>
    </>
  );
}
