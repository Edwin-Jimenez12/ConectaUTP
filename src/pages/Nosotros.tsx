import { Button } from '../components/Button';
import { ArrowRight, Camera, Check, Flag, Laptop, Lightbulb, Pencil, ShieldCheck, UserRound, UsersRound, Wrench } from 'lucide-react';

const values = [
  { icon: UsersRound, title: 'Comunidad', text: 'Fomentamos conexiones reales entre estudiantes para apoyarnos y crecer juntos.' },
  { icon: ShieldCheck, title: 'Confianza', text: 'Promovemos un entorno seguro, transparente y respetuoso en cada interacción.' },
  { icon: Lightbulb, title: 'Oportunidad', text: 'Impulsamos el talento y facilitamos el acceso a soluciones que generan impacto.' },
];

function ValueCard({ icon: Icon, title, text }: (typeof values)[number]) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-3 ">
      <div className="flex items-center gap-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#f0eaff] text-[#7b32ca]"><Icon aria-hidden="true" className="h-6 w-6" /></span>
        <div><h3 className="text-sm font-semibold">{title}</h3><p className="mt-1 text-xs leading-[1.4] text-[#676878]">{text}</p></div>
      </div>
    </article>
  );
}

function AboutHero() {
  return (
    <section className="border-b border-slate-100 bg-linear-to-r from-white via-[#f8f7ff] to-[#e9e4ff]">
      <div className="mx-auto flex min-h-[250px] w-[calc(100%-48px)] max-w-7xl items-center justify-between gap-8 max-lg:min-h-[280px] max-md:flex-col max-md:items-start max-md:py-7">
        <div className="max-w-[700px] shrink-0 max-md:max-w-full py-10">
          <h1 className="mt-5 text-5xl font-bold leading-[1.12] tracking-[-1px] max-md:text-4xl">Conectamos lo que necesitas<br className="hidden md:flex"/> con el talento de tu <br/> comunidad</h1>
          <p className="mt-4 max-w-[560px] text-lg leading-[1.45] text-[#5c5e70] max-md:text-base">ConectaUTP nace para facilitar que estudiantes encuentren servicios y que puedan compartir sus habilidades con otras personas.</p>
        </div>
        <div className="relative flex h-[180px] w-[390px] max-w-full items-center justify-center overflow-hidden max-md:hidden">
          <div className="absolute h-[150px] w-[150px] rounded-full border border-[#bda3f1]" />
          <div className="absolute h-[120px] w-[280px] rotate-[18deg] rounded-[50%] border border-[#d2c6fa]" />
          <div className="absolute h-[120px] w-[280px] rotate-[-18deg] rounded-[50%] border border-[#d2c6fa]" />
          <div className="flex h-[104px] w-[104px] items-center justify-center rounded-full bg-white p-6 shadow-[0_4px_20px_rgba(61,68,218,0.18)]"><img className="h-[58px] w-[58px] object-contain" src="/Logo.svg" alt="" aria-hidden="true" /></div>
          <span className="absolute left-5 top-7 rounded-full bg-white p-3 text-[#7b32ca] shadow"><Wrench aria-hidden="true" className="h-5 w-5" /></span><span className="absolute right-5 top-8 rounded-full bg-white p-3 text-[#7b32ca] shadow"><Laptop aria-hidden="true" className="h-5 w-5" /></span><span className="absolute bottom-5 left-12 rounded-full bg-white p-3 text-[#7b32ca] shadow"><Pencil aria-hidden="true" className="h-5 w-5" /></span><span className="absolute bottom-4 right-12 rounded-full bg-white p-3 text-[#7b32ca] shadow"><Camera aria-hidden="true" className="h-5 w-5" /></span>
        </div>
      </div>
    </section>
  );
}

export function Nosotros() {
  return (
    <>
      <AboutHero />
      <section className="mx-auto w-[calc(100%-48px)] max-w-7xl py-8">
        <div className="grid grid-cols-2 gap-4 max-[600px]:grid-cols-1">
          <article className="flex min-h-[150px] items-center gap-6 rounded-lg border border-slate-200 bg-white p-5 max-sm:flex-col max-sm:items-start"><div className="flex-1"><h2 className="text-lg font-semibold">Nuestra misión</h2><p className="mt-3 text-sm leading-[1.45] text-[#676878]">Crear un espacio confiable donde la comunidad UTP pueda descubrir, ofrecer y conectar servicios de forma sencilla.</p></div><div className="flex items-center gap-2 text-center text-xs max-sm:self-center"><span className="rounded-full bg-[#eee8ff] p-4 text-[#7b32ca]"><UserRound aria-hidden="true" className="h-6 w-6" /></span><ArrowRight aria-hidden="true" className="h-4 w-4" /><span className="rounded-full bg-[#7b32ca] p-4 text-white"><UsersRound aria-hidden="true" className="h-6 w-6" /></span><ArrowRight aria-hidden="true" className="h-4 w-4" /><span className="rounded-full bg-[#3d44da] p-4 text-white"><Check aria-hidden="true" className="h-6 w-6" /></span></div></article>
          <article className="relative min-h-[150px] overflow-hidden rounded-lg border border-slate-200 bg-white p-5"><h2 className="text-lg font-semibold">Nuestra visión</h2><p className="mt-3 max-w-[520px] text-sm leading-[1.45] text-[#676878]">Ser el espacio digital de referencia para que la comunidad UTP conecte su talento con oportunidades y soluciones en un entorno confiable, colaborativo y accesible.</p><div className="absolute bottom-0 right-8 h-16 w-36 bg-linear-to-tr from-[#d8d0fb] via-[#eeeaff] to-transparent [clip-path:polygon(0_100%,40%_40%,55%_60%,75%_0,100%_100%)]" /><Flag aria-hidden="true" className="absolute bottom-11 right-10 h-6 w-6 text-[#6842dd]" /></article>
        </div>
        <h2 className="my-6 text-center text-2xl font-semibold">Lo que nos guía</h2>
        <div className="grid grid-cols-3 gap-3 max-[600px]:grid-cols-1">{values.map((value) => <ValueCard key={value.title} {...value} />)}</div>
        <section className="mt-5 flex items-center justify-between rounded-lg bg-linear-to-r from-[#6422d0] to-[#2671eb] px-7 py-5 text-white"><div><h2 className="text-xl font-semibold">Se parte de ConectaUTP</h2><p className="mt-1 text-sm">Encuentra una solución o comparte lo que sabes hacer.</p></div><div className="flex gap-3 max-md:flex-wrap max-md:justify-end"><Button variant="secondary" className="min-h-10 text-sm" onClick={() => { window.location.hash = '#explorar'; }}>Explorar servicios</Button><Button className="min-h-10 border border-white bg-transparent text-sm text-white" onClick={() => { window.location.hash = '#publicar'; }}>Publica tu servicio</Button></div></section>
      </section>
    </>
  );
}
