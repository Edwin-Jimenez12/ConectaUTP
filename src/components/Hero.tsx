import heroBase from '../assets/hero.png';
import { Button } from './Button';

export function Hero() {
  return (
    <section className="bg-linear-to-r from-white via-[#f1f1ff] to-[#e2d9ff]" id="inicio">
      <div className="relative mx-auto flex min-h-[274px] w-[calc(100%-48px)] max-w-[1080px] items-center">
        <div className="relative z-10">
          <p className="mb-[9px] text-[11px] font-semibold text-[#7b32ca]">Conecta con tu comunidad UTP</p>
          <h1 className="m-0 text-[clamp(30px,4vw,41px)] font-bold leading-[1.08] tracking-[-1.7px]">
            Lo que necesitas,
            <br />dentro de tu <span className="text-[#7b32ca]">comunidad.</span>
          </h1>
          <p className="my-[10px] mb-[15px] max-w-[355px] text-[10px] leading-[1.45] text-[#575a6c]">
            Encuentra u ofrece servicios dentro de la comunidad UTP y
            conecta con estudiantes que pueden ayudarte a lograr más.
          </p>
          <div className="flex max-w-[300px]">
            <label htmlFor="service-search" className="sr-only">
              Buscar un servicio
            </label>
            <input
              className="min-w-0 w-full rounded-l-[6px] border border-[#dedee8] px-3 text-[10px]"
              id="service-search"
              type="search"
              placeholder="¿Qué estás buscando?"
            />
            <Button className="rounded-l-none rounded-r-[6px] px-[17px] text-[9px]">Buscar servicio</Button>
          </div>
          <Button variant="outline" className="mt-[15px] min-w-[130px]">
            + Publicar mi servicio
          </Button>
        </div>
        <div className="absolute right-[-30px] top-0 h-full w-[58%]" aria-hidden="true">
          <img className="h-full w-full object-cover" src={heroBase} alt="" />
        </div>
      </div>
    </section>
  );
}
