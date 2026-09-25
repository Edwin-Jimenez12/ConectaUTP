import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Heart, LockKeyhole, Star } from 'lucide-react';
import type { ServiceCardData } from '../types/service';

interface ServiceCardProps {
  service: ServiceCardData;
  featured?: boolean;
  promoted?: boolean;
  imageHref?: string;
  layout?: 'list' | 'grid';
  mediaSize?: 'default' | 'bounded';
  preview?: boolean;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

export function ServiceCard({ service, featured = false, promoted = false, imageHref, layout = 'grid', mediaSize = 'default', preview = false, isFavorite = false, onToggleFavorite }: ServiceCardProps) {
  const isList = layout === 'list';
  const mediaClassName = mediaSize === 'bounded'
    ? `${isList ? 'h-48 w-72 max-sm:h-36 max-sm:w-36' : 'h-52 w-full'} aspect-auto`
    : `aspect-[3/2] ${isList ? 'w-72 max-sm:w-36' : 'w-full'}`;
  const images = service.galleryImages?.length
    ? service.galleryImages
    : service.imageUrl ? [{ url: service.imageUrl, altText: service.imageAlt ?? service.title }] : [];
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => setActiveImageIndex(0), [service.id, images.length]);

  const moveImage = (direction: -1 | 1) => {
    setActiveImageIndex((current) => (current + direction + images.length) % images.length);
  };
  const profileHref = `#perfil/${service.providerId}`;
  const favoriteButton = onToggleFavorite || preview ? <button className={`inline-flex shrink-0 items-center justify-center rounded-full p-2 transition-colors ${preview ? 'cursor-default text-[#8b8b99]' : `cursor-pointer focus-visible:outline-2 focus-visible:outline-[#7b32ca] ${isFavorite ? 'text-[#7b32ca] drop-shadow-[0_0_7px_rgba(123,50,202,0.65)]' : 'text-[#8b8b99] hover:text-[#7b32ca]'}`}`} type="button" onClick={onToggleFavorite} disabled={preview} aria-label={isFavorite ? `Quitar ${service.title} de favoritos` : `Agregar ${service.title} a favoritos`} aria-pressed={preview ? undefined : isFavorite}><Heart aria-hidden="true" className={`${isList ? 'h-5 w-5' : 'h-4 w-4'} ${isFavorite ? 'fill-current' : ''}`} /></button> : null;
  const providerBlock = <div className="flex min-w-0 items-start gap-3">
    <a className="shrink-0 rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7b32ca]" href={profileHref} aria-label={`Ver perfil de ${service.provider}`}>
      {service.providerImageUrl ? <img className={`${isList ? 'h-14 w-14' : 'h-8 w-8'} rounded-full object-cover`} src={service.providerImageUrl} alt="" /> : <span className={`${isList ? 'h-14 w-14' : 'h-8 w-8'} block rounded-full bg-linear-to-br from-[#454545] to-[#aaa]`} aria-hidden="true" />}
    </a>
    <div className="min-w-0">
      <h3 className={`${isList ? 'text-lg' : 'text-xs'} break-words font-semibold leading-tight`}>{service.title}</h3>
      <a className={`mt-1 block w-fit max-w-full truncate text-[#777784] hover:text-[#7b32ca] hover:underline ${isList ? 'text-base' : 'text-xs'}`} href={profileHref}>{service.provider}</a>
      <p className={`mt-0.5 ${isList ? 'text-base' : 'text-xs'} text-[#777784]`}>{service.category}</p>
      {isList && <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[#676878]">{service.description}</p>}
    </div>
  </div>;

  return (
    <article className={`min-w-0 overflow-hidden rounded-[7px] border border-[#e2e2e8] bg-white ${isList ? 'flex' : ''} ${featured ? 'col-span-1' : ''}`}>
      <div className={`service-card-gallery relative shrink-0 overflow-hidden bg-[#f5f4f8] ${mediaClassName}`} aria-roledescription="carrusel" aria-label={`Imágenes de ${service.title}`}>
        {imageHref ? <a className="block h-full w-full focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-[#7b32ca]" href={imageHref} aria-label={`Ver información de ${service.title}`}>
          {images.length > 0 ? <div className="flex h-full w-full transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none" style={{ transform: `translate3d(-${activeImageIndex * 100}%, 0, 0)` }}>
            {images.map((image, index) => <div className="h-full w-full shrink-0" key={`${image.url}-${index}`}><img className="h-full w-full object-contain" src={image.url} alt={image.altText || service.title} loading="lazy" /></div>)}
          </div> : <div className="h-full w-full bg-linear-to-br from-[#d9c6b0] via-[#89715f] to-[#2e4058]" />}
        </a> : images.length > 0 ? <div className="flex h-full w-full transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none" style={{ transform: `translate3d(-${activeImageIndex * 100}%, 0, 0)` }}>
          {images.map((image, index) => <div className="h-full w-full shrink-0" key={`${image.url}-${index}`}><img className="h-full w-full object-contain" src={image.url} alt={image.altText || service.title} loading="lazy" /></div>)}
        </div> : <div className="h-full w-full bg-linear-to-br from-[#d9c6b0] via-[#89715f] to-[#2e4058]" />}
        {(featured || promoted) && <div className="absolute right-2 top-2 flex flex-col items-end gap-1">{featured && <span className="inline-flex items-center gap-1 rounded-sm bg-[#7b32ca] px-2 py-1 text-xs text-white"><Star aria-hidden="true" className="h-3 w-3 fill-current" />Destacada</span>}{promoted && <span className="inline-flex items-center rounded-sm bg-[#f59e0b] px-2 py-1 text-xs font-semibold text-[#432006]">Promoción</span>}</div>}
        {images.length > 1 && !service.locked && <>
          <button className="absolute left-2 top-1/2 flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-slate-950/75 text-white shadow-md transition-colors hover:bg-slate-950" type="button" onClick={() => moveImage(-1)} aria-label={`Imagen anterior de ${service.title}`}><ChevronLeft aria-hidden="true" className="h-5 w-5" /></button>
          <button className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-slate-950/75 text-white shadow-md transition-colors hover:bg-slate-950" type="button" onClick={() => moveImage(1)} aria-label={`Imagen siguiente de ${service.title}`}><ChevronRight aria-hidden="true" className="h-5 w-5" /></button>
          <span className="absolute bottom-2 right-2 rounded-full bg-slate-950/70 px-2 py-1 text-[10px] font-semibold text-white" aria-live="polite">{activeImageIndex + 1} / {images.length}</span>
        </>}
        {service.locked && <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 text-center text-white backdrop-blur-[4px]"><LockKeyhole aria-hidden="true" className="h-5 w-5" /><p className="mt-2 text-xs leading-tight">Regístrate para ver<br />la publicación completa</p></div>}
      </div>
      <div className={`${isList ? 'flex min-w-0 flex-1 flex-col p-5' : 'p-3'} pb-4`}>
        {isList ? <div className="mb-5 flex items-start justify-between gap-5">{providerBlock}{favoriteButton}</div> : <><div className="mb-3 flex justify-end">{favoriteButton}</div>{providerBlock}</>}
        <div className={`${isList ? 'mt-auto pt-4 text-sm' : 'mt-4 text-xs'} flex items-center justify-between gap-2`}>
          <span className="font-medium text-[#7b32ca]">{service.price}</span>
          {(service.requestHref || preview) && <button className={`rounded-md bg-[#7b32ca] font-semibold text-white transition-colors ${preview ? 'cursor-default opacity-80' : 'cursor-pointer hover:bg-[#6422b0]'} ${isList ? 'px-4 py-2.5 text-sm' : 'px-3 py-2 text-[11px]'}`} type="button" disabled={preview} onClick={() => { if (service.requestHref) window.location.hash = service.requestHref; }}>Solicitar servicio</button>}
        </div>
      </div>
    </article>
  );
}
