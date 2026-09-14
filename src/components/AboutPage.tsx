import { Button } from './Button';

const values = [
  {
    icon: '♧',
    title: 'Comunidad',
    text: 'Fomentamos conexiones reales entre estudiantes para apoyarnos y crecer juntos.',
  },
  {
    icon: '♢',
    title: 'Confianza',
    text: 'Promovemos un entorno seguro, transparente y respetuoso en cada interacción.',
  },
  {
    icon: '♧',
    title: 'Oportunidad',
    text: 'Impulsamos el talento y facilitamos el acceso a soluciones que generan impacto.',
  },
];

function ValueCard({ icon, title, text }: (typeof values)[number]) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-3">
      <div className="flex items-center gap-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#f0eaff] text-2xl text-[#7b32ca]">
          {icon}
        </span>
        <div>
          <h3 className="text-[12px] font-semibold">{title}</h3>
          <p className="mt-1 text-[9px] leading-[1.4] text-[#676878]">{text}</p>
        </div>
      </div>
    </article>
  );
}

export function AboutPage() {
  return (
    <>
      <section className="border-b border-slate-100 bg-linear-to-r from-white via-[#f8f7ff] to-[#e9e4ff]">
        <div className="mx-auto flex min-h-[205px] w-[calc(100%-48px)] max-w-[1080px] items-center justify-between gap-8">
          <div className="max-w-[480px] shrink-0">
            <span className="rounded-full bg-[#eee8ff] px-3 py-1 text-[9px] font-semibold text-[#7b32ca]">
              Sobre ConectaUTP
            </span>
            <h1 className="mt-4 text-[27px] font-bold leading-[1.12] tracking-[-1px]">
              Conectamos lo que necesitas<br />con el talento de nuestra comunidad
            </h1>
            <p className="mt-3 text-[11px] leading-[1.45] text-[#5c5e70]">
              ConectaUTP nace para facilitar que estudiantes encuentren servicios
              y que puedan compartir sus habilidades con otras personas.
            </p>
          </div>
          <div className="relative flex h-[180px] w-[390px] items-center justify-center overflow-hidden">
            <div className="absolute h-[150px] w-[150px] rounded-full border border-[#bda3f1]" />
            <div className="absolute h-[120px] w-[280px] rotate-[18deg] rounded-[50%] border border-[#d2c6fa]" />
            <div className="absolute h-[120px] w-[280px] rotate-[-18deg] rounded-[50%] border border-[#d2c6fa]" />
            <div className="flex h-[104px] w-[104px] items-center justify-center rounded-full bg-white p-6 shadow-[0_4px_20px_rgba(61,68,218,0.18)]">
              <img className="h-[58px] w-[58px] object-contain" src="/Logo.svg" alt="" aria-hidden="true" />
            </div>
            <span className="absolute left-5 top-7 rounded-full bg-white p-3 text-xl text-[#7b32ca] shadow">⚒</span>
            <span className="absolute right-5 top-8 rounded-full bg-white p-3 text-xl text-[#7b32ca] shadow">▱</span>
            <span className="absolute bottom-5 left-12 rounded-full bg-white p-3 text-xl text-[#7b32ca] shadow">✎</span>
            <span className="absolute bottom-4 right-12 rounded-full bg-white p-3 text-xl text-[#7b32ca] shadow">▣</span>
          </div>
        </div>
      </section>

      <section className="mx-auto w-[calc(100%-48px)] max-w-[1080px] py-5">
        <div className="grid grid-cols-2 gap-4 max-[600px]:grid-cols-1">
          <article className="flex min-h-[112px] items-center gap-5 rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex-1">
              <h2 className="text-[13px] font-semibold">Nuestra misión</h2>
              <p className="mt-3 text-[9px] leading-[1.45] text-[#676878]">Crear un espacio confiable donde la comunidad UTP pueda descubrir, ofrecer y conectar servicios de forma sencilla.</p>
            </div>
            <div className="flex items-center gap-2 text-center text-[8px]">
              <span className="rounded-full bg-[#eee8ff] px-3 py-3 text-xl text-[#7b32ca]">♙</span>
              <b>→</b><span className="rounded-full bg-[#7b32ca] px-3 py-3 text-xl text-white">♧</span>
              <b>→</b><span className="rounded-full bg-[#3d44da] px-3 py-3 text-xl text-white">✓</span>
            </div>
          </article>
          <article className="relative min-h-[112px] overflow-hidden rounded-lg border border-slate-200 bg-white p-4">
            <h2 className="text-[13px] font-semibold">Nuestra visión</h2>
            <p className="mt-3 max-w-[360px] text-[9px] leading-[1.45] text-[#676878]">Ser el espacio digital de referencia para que la comunidad UTP conecte su talento con oportunidades y soluciones en un entorno confiable, colaborativo y accesible.</p>
            <div className="absolute bottom-0 right-8 h-12 w-28 bg-linear-to-tr from-[#d8d0fb] via-[#eeeaff] to-transparent [clip-path:polygon(0_100%,40%_40%,55%_60%,75%_0,100%_100%)]" />
            <span className="absolute bottom-9 right-10 text-xl text-[#6842dd]">⚑</span>
          </article>
        </div>
        <h2 className="my-4 text-center text-[16px] font-semibold">Lo que nos guía</h2>
        <div className="grid grid-cols-3 gap-3 max-[600px]:grid-cols-1">
          {values.map((value) => <ValueCard key={value.title} {...value} />)}
        </div>
        <section className="mt-4 flex items-center justify-between rounded-lg bg-linear-to-r from-[#6422d0] to-[#2671eb] px-6 py-4 text-white">
          <div>
            <h2 className="text-[15px] font-semibold">Forma parte de ConectaUTP</h2>
            <p className="mt-1 text-[10px]">Encuentra una solución o comparte lo que sabes hacer.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" className="min-h-8 text-[9px]">Explorar servicios</Button>
            <Button className="min-h-8 border border-white bg-transparent text-[9px] text-white">Crear una cuenta</Button>
          </div>
        </section>
      </section>
    </>
  );
}
