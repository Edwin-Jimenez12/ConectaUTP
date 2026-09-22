import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ServiceCard } from './ServiceCard';
import type { PublicService, ServiceCardData } from '../types/service';

const EMPTY_FAVORITES = new Set<string>();

function toCard(service: PublicService, canView: boolean, userId?: string): ServiceCardData {
  return {
    id: service.id,
    title: service.title,
    provider: service.provider_name,
    price: service.price === null ? 'Precio por definir' : `Desde B/.${service.price}`,
    category: service.category_name,
    description: service.description,
    imageUrl: service.cover_image_url,
    imageAlt: service.cover_image_alt,
    providerImageUrl: service.provider_avatar_url,
    locked: !canView,
    requestHref: service.owner_id !== userId && service.contact_clients_enabled !== false ? (canView ? `#chats/${service.id}` : '#login') : undefined,
  };
}

export function HorizontalServiceRow({ services, canView, userId, favoriteIds = EMPTY_FAVORITES, onToggleFavorite = () => undefined, featured = false }: { services: PublicService[]; canView: boolean; userId?: string; favoriteIds?: Set<string>; onToggleFavorite?: (serviceId: string) => void; featured?: boolean }) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [canScroll, setCanScroll] = useState({ left: false, right: false });
  const visibleServices = services.slice(0, 20);

  useEffect(() => {
    const element = rowRef.current;
    if (!element) return undefined;

    const updateScrollState = () => {
      const maxScroll = element.scrollWidth - element.clientWidth;
      setCanScroll({ left: element.scrollLeft > 0, right: element.scrollLeft < maxScroll - 1 });
    };

    updateScrollState();
    element.addEventListener('scroll', updateScrollState);
    window.addEventListener('resize', updateScrollState);
    return () => {
      element.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('resize', updateScrollState);
    };
  }, [visibleServices.length]);

  function moveRow(direction: -1 | 1) {
    rowRef.current?.scrollBy({ left: direction * (featured ? 323 : 263), behavior: 'smooth' });
  }

  return (
    <div className="relative">
      <div className="flex gap-[13px] overflow-x-auto pb-3 pr-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" ref={rowRef}>
        {visibleServices.map((service) => (
          <div className={`${featured ? 'w-[310px]' : 'w-[250px]'} shrink-0 max-sm:w-[82vw]`} key={service.id}>
            <ServiceCard service={toCard(service, canView, userId)} layout="grid" featured={Boolean(service.is_featured || service.is_interest_featured)} promoted={Boolean(service.is_promoted)} href={`#servicio/${service.id}`} isFavorite={favoriteIds.has(service.id)} onToggleFavorite={() => onToggleFavorite(service.id)} />
          </div>
        ))}
      </div>
      <button className="absolute left-2 top-1/2 flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-[#dedee8] bg-white text-lg text-[#5420a8] shadow-md disabled:cursor-not-allowed disabled:opacity-0" type="button" onClick={() => moveRow(-1)} disabled={!canScroll.left} aria-label="Ver servicios anteriores"><ChevronLeft aria-hidden="true" className="h-5 w-5" /></button>
      <button className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-[#dedee8] bg-white text-lg text-[#5420a8] shadow-md disabled:cursor-not-allowed disabled:opacity-0" type="button" onClick={() => moveRow(1)} disabled={!canScroll.right} aria-label="Ver más servicios"><ChevronRight aria-hidden="true" className="h-5 w-5" /></button>
    </div>
  );
}
