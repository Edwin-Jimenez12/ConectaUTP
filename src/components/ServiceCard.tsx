import { Heart, LockKeyhole, Star } from 'lucide-react';
import type { ServiceCardData } from '../types/service';

interface ServiceCardProps {
  service: ServiceCardData;
  featured?: boolean;
  href?: string;
  layout?: 'list' | 'grid';
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

export function ServiceCard({ service, featured = false, href, layout = 'grid', isFavorite = false, onToggleFavorite }: ServiceCardProps) {
  const isList = layout === 'list';
  const favoriteButton = onToggleFavorite ? <button className={`inline-flex shrink-0 cursor-pointer items-center justify-center rounded-full p-2 transition-colors focus-visible:outline-2 focus-visible:outline-[#7b32ca] ${isFavorite ? 'text-[#7b32ca] drop-shadow-[0_0_7px_rgba(123,50,202,0.65)]' : 'text-[#8b8b99] hover:text-[#7b32ca]'}`} type="button" onClick={onToggleFavorite} aria-label={isFavorite ? `Quitar ${service.title} de favoritos` : `Agregar ${service.title} a favoritos`} aria-pressed={isFavorite}><Heart aria-hidden="true" className={`${isList ? 'h-5 w-5' : 'h-4 w-4'} ${isFavorite ? 'fill-current' : ''}`} /></button> : null;
  const providerBlock = <a className="flex min-w-0 items-start gap-3 focus-visible:outline-2 focus-visible:outline-[#7b32ca]" href={href}>
    {service.providerImageUrl ? <img className={`${isList ? 'h-14 w-14' : 'h-8 w-8'} shrink-0 rounded-full object-cover`} src={service.providerImageUrl} alt="" /> : <span className={`${isList ? 'h-14 w-14' : 'h-8 w-8'} shrink-0 rounded-full bg-linear-to-br from-[#454545] to-[#aaa]`} aria-hidden="true" />}
    <div className="min-w-0">
      <h3 className={`${isList ? 'text-lg' : 'text-xs'} font-semibold leading-tight`}>{service.title}</h3>
      <p className={`mt-1 ${isList ? 'text-base' : 'text-xs'} text-[#777784]`}>{service.provider}</p>
      <p className={`mt-0.5 ${isList ? 'text-base' : 'text-xs'} text-[#777784]`}>{service.category}</p>
      {isList && <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[#676878]">{service.description}</p>}
    </div>
  </a>;

  return (
    <article className={`min-w-0 overflow-hidden rounded-[7px] border border-[#e2e2e8] bg-white ${isList ? 'flex' : ''} ${featured ? 'col-span-1' : ''}`}>
      <a className={`relative block aspect-[3/2] overflow-hidden bg-[#f5f4f8] focus-visible:outline-2 focus-visible:outline-[#7b32ca] ${isList ? 'w-72 shrink-0 max-sm:w-36' : 'w-full'}`} href={href} aria-label={`Ver ${service.title}`}>
        {service.imageUrl ? (
          <img className="block h-full w-full object-contain" src={service.imageUrl} alt={service.imageAlt ?? service.title} />
        ) : (
          <div className="h-full w-full bg-linear-to-br from-[#d9c6b0] via-[#89715f] to-[#2e4058]" />
        )}
        {featured && <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-sm bg-[#7b32ca] px-2 py-1 text-xs text-white"><Star aria-hidden="true" className="h-3 w-3 fill-current" />Destacada</span>}
        {service.locked && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 text-center text-white backdrop-blur-[4px]">
            <LockKeyhole aria-hidden="true" className="h-5 w-5" />
            <p className="mt-2 text-xs leading-tight">Regístrate para ver<br />la publicación completa</p>
          </div>
        )}
      </a>
      <div className={`${isList ? 'flex min-w-0 flex-1 flex-col p-5' : 'p-3'} pb-4`}>
        {isList ? <div className="mb-5 flex items-start justify-between gap-5">{providerBlock}{favoriteButton}</div> : <><div className="mb-3 flex justify-end">{favoriteButton}</div>{providerBlock}</>}
        <div className={`${isList ? 'mt-auto pt-4 text-sm' : 'mt-4 text-xs'} flex items-center justify-between gap-2`}>
          <span className="font-medium text-[#7b32ca]">{service.price}</span>
          {service.requestHref && <button className={`cursor-pointer rounded-md bg-[#7b32ca] font-semibold text-white transition-colors hover:bg-[#6422b0] ${isList ? 'px-4 py-2.5 text-sm' : 'px-3 py-2 text-[11px]'}`} type="button" onClick={() => { window.location.hash = service.requestHref ?? ''; }}>Solicitar servicio</button>}
        </div>
      </div>
    </article>
  );
}
