import type { ServiceCardData } from '../types/service';

interface ServiceCardProps {
  service: ServiceCardData;
  featured?: boolean;
  href?: string;
}

export function ServiceCard({ service, featured = false, href }: ServiceCardProps) {
  const content = (
    <article className={`min-w-0 overflow-hidden rounded-[7px] border border-[#e2e2e8] bg-white ${featured ? 'col-span-1' : ''}`}>
      <div className={`relative h-[145px] overflow-hidden ${featured ? 'h-[190px]' : ''}`}>
        <div className="h-full w-full bg-linear-to-br from-[#d9c6b0] via-[#89715f] to-[#2e4058]" />
        {featured && <span className="absolute right-2 top-2 rounded-sm bg-[#7b32ca] px-2 py-1 text-[10px] text-white">★ Destacada</span>}
        {service.locked && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 text-center text-white backdrop-blur-[4px]">
            <span className="text-xl" aria-hidden="true">⌑</span>
            <p className="mt-2 text-xs leading-tight">Regístrate para ver<br />la publicación completa</p>
          </div>
        )}
      </div>
      <div className="p-3 pb-4">
        <div className="flex items-center gap-2">
          <span className="h-8 w-8 shrink-0 rounded-full bg-linear-to-br from-[#454545] to-[#aaa]" aria-hidden="true" />
          <div>
            <h3 className="text-xs font-semibold">{service.title}</h3>
            <p className="mt-0.5 text-[10px] text-[#777784]">{service.provider}</p>
            <p className="mt-0.5 text-[9px] text-[#777784]">{service.category}</p>
          </div>
        </div>
        <div className="mt-3 flex justify-between text-xs">
          <span className="text-[#7b32ca]">{service.price}</span>
          <span>★ {service.rating}</span>
        </div>
      </div>
    </article>
  );
  return href ? <a className="block" href={href}>{content}</a> : content;
}
