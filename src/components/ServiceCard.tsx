import type { Service } from '../data/services';

interface ServiceCardProps {
  service: Service;
  featured?: boolean;
}

export function ServiceCard({ service, featured = false }: ServiceCardProps) {
  return (
    <article className={`min-w-0 overflow-hidden rounded-[7px] border border-[#e2e2e8] bg-white ${featured ? 'col-span-1' : ''}`}>
      <div className={`relative h-[103px] overflow-hidden ${featured ? 'h-[145px]' : ''}`}>
        <div className="h-full w-full bg-linear-to-br from-[#d9c6b0] via-[#89715f] to-[#2e4058]" />
        <span className="absolute right-1 top-1 rounded-sm bg-[#7b32ca] px-1.5 py-0.5 text-[7px] text-white">
          ★ Destacada
        </span>
        {service.locked && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 text-center text-white backdrop-blur-[4px]">
            <span className="text-xl" aria-hidden="true">⌑</span>
            <p className="mt-[7px] text-[9px] leading-tight">Regístrate para ver<br />la publicación completa</p>
          </div>
        )}
      </div>
      <div className="p-[9px] pb-[10px]">
        <div className="flex items-center gap-[7px]">
          <span className="h-[22px] w-[22px] shrink-0 rounded-full bg-linear-to-br from-[#454545] to-[#aaa]" aria-hidden="true" />
          <div>
            <h3 className="text-[9px] font-semibold">{service.title}</h3>
            <p className="mt-0.5 text-[8px] text-[#777784]">{service.provider}</p>
            <p className="mt-0.5 text-[7px] text-[#777784]">Reparaciones · Limpieza</p>
          </div>
        </div>
        <div className="mt-[9px] flex justify-between text-[9px]">
          <span className="text-[#7b32ca]">{service.price}</span>
          <span>★ {service.rating}</span>
        </div>
      </div>
    </article>
  );
}
