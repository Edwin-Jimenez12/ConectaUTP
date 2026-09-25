import { useEffect, useMemo, useState } from 'react';
import { Grid2X2, List } from 'lucide-react';
import { useAuth } from '../auth/useAuth';
import { Button } from '../components/Button';
import { ExploreFilters } from '../components/ExploreFilters';
import { ServiceCard } from '../components/ServiceCard';
import { HorizontalServiceRow } from '../components/HorizontalServiceRow';
import { getServiceCoverImages, listCategories, listFavoriteServiceIds, listPublicServices, setServiceFavorite } from '../lib/services';
import { comparePublicServices, hasVisibleHighlight } from '../lib/serviceRanking';
import type { PublicService, ServiceCardData } from '../types/service';

type ServiceLayout = 'list' | 'grid';
const SERVICE_LAYOUT_STORAGE_KEY = 'conectautp-service-layout';
const EMPTY_FAVORITES = new Set<string>();

function shuffleServices(items: PublicService[]) {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
  }
  return shuffled;
}

function toCard(service: PublicService, canView: boolean, userId?: string): ServiceCardData {
  return {
    id: service.id,
    providerId: service.owner_id,
    title: service.title,
    provider: service.provider_name,
    price: service.price === null ? 'Precio por definir' : `Desde B/.${service.price}`,
    category: service.category_name,
    description: service.description,
    imageUrl: service.cover_image_url,
    imageAlt: service.cover_image_alt,
    providerImageUrl: service.provider_avatar_url,
    galleryImages: service.gallery_images,
    locked: !canView,
    requestHref: service.owner_id !== userId && service.contact_clients_enabled !== false ? (canView ? `#chats/${service.id}` : '#login') : undefined,
  };
}

export function Explora() {
  const { session } = useAuth();
  const [query, setQuery] = useState(() => {
    const hashQuery = window.location.hash.split('?')[1] ?? '';
    return new URLSearchParams(hashQuery).get('query') ?? '';
  });
  const [category, setCategory] = useState('');
  const [services, setServices] = useState<PublicService[]>([]);
  const [categoryNames, setCategoryNames] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(() => new Set());
  const [favoriteOwnerId, setFavoriteOwnerId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [layout, setLayout] = useState<ServiceLayout>(() => {
    if (typeof window === 'undefined') return 'list';
    return window.localStorage.getItem(SERVICE_LAYOUT_STORAGE_KEY) === 'grid' ? 'grid' : 'list';
  });
  const servicesPerPage = 9;

  useEffect(() => {
    window.localStorage.setItem(SERVICE_LAYOUT_STORAGE_KEY, layout);
  }, [layout]);

  useEffect(() => {
    let active = true;
    void Promise.all([listPublicServices(), listCategories()]).then(async ([serviceResult, categoryResult]) => {
      if (!active) return;
      if (serviceResult.error || categoryResult.error) setMessage('No se pudo cargar el catálogo. Ejecuta la migración de servicios en Supabase.');
      const nextServices = serviceResult.data ?? [];
      if (session && nextServices.length > 0 && !serviceResult.error) {
        const coverResult = await getServiceCoverImages(nextServices.map((service) => service.id));
        if (!active) return;
        setServices(nextServices.map((service) => ({
          ...service,
          cover_image_url: coverResult.data.get(service.id)?.url,
          cover_image_alt: coverResult.data.get(service.id)?.altText,
          gallery_images: coverResult.data.get(service.id)?.galleryImages,
        })));
      } else {
        setServices(nextServices);
      }
      setCategoryNames((categoryResult.data ?? []).map((item) => item.name));
    });
    return () => { active = false; };
  }, [session]);

  useEffect(() => {
    if (!session) return;

    let active = true;
    void listFavoriteServiceIds(session.user.id).then((result) => {
      if (!active) return;
      setFavoriteIds(result.data);
      setFavoriteOwnerId(session.user.id);
      if (result.error) setMessage('No se pudieron cargar tus favoritos.');
    });
    return () => { active = false; };
  }, [session]);

  async function toggleFavorite(serviceId: string) {
    if (!session) {
      window.location.assign('#login');
      return;
    }

    const visibleFavoriteIds = favoriteOwnerId === session.user.id ? favoriteIds : EMPTY_FAVORITES;
    const nextValue = !visibleFavoriteIds.has(serviceId);
    setFavoriteIds((current) => {
      const next = new Set(current);
      if (nextValue) next.add(serviceId); else next.delete(serviceId);
      return next;
    });
    const result = await setServiceFavorite(session.user.id, serviceId, nextValue);
    if (result.error) {
      setFavoriteIds((current) => {
        const next = new Set(current);
        if (nextValue) next.delete(serviceId); else next.add(serviceId);
        return next;
      });
      setMessage('No se pudo actualizar el favorito.');
    }
  }

  const randomizedServices = useMemo(() => shuffleServices(services), [services]);
  const filteredServices = useMemo(() => randomizedServices
    .filter((service) => `${service.title} ${service.description} ${service.provider_name}`.toLowerCase().includes(query.toLowerCase()) && (!category || service.category_name === category)), [category, query, randomizedServices]);
  const featuredServices = useMemo(() => filteredServices.filter(hasVisibleHighlight).sort(comparePublicServices), [filteredServices]);
  const regularServices = useMemo(() => filteredServices.filter((service) => !hasVisibleHighlight(service)), [filteredServices]);
  const totalPages = Math.max(1, Math.ceil(regularServices.length / servicesPerPage));
  const page = Math.min(currentPage, totalPages);
  const visibleServices = regularServices.slice((page - 1) * servicesPerPage, page * servicesPerPage);
  const visibleFavoriteIds = favoriteOwnerId === session?.user.id ? favoriteIds : EMPTY_FAVORITES;

  function changePage(nextPage: number) {
    setCurrentPage(nextPage);
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }

  return (
    <>
      <section className="bg-linear-to-r from-white via-[#f5f4ff] to-[#e4dcff] py-10"><div className="mx-auto w-[calc(100%-48px)] max-w-7xl"><h1 className="text-3xl font-bold">Explora servicios</h1><p className="mt-2 text-sm">Encuentra personas de la comunidad UTP que pueden ayudarte.</p><div className="mt-4 flex gap-3 max-md:flex-col"><input className="h-11 w-[300px] rounded-md border border-[#d9d9df] bg-white px-4 text-sm max-md:w-full" placeholder="¿Qué estás buscando?" value={query} onChange={(event) => { setQuery(event.target.value); setCurrentPage(1); }} onKeyDown={(event) => { if (event.key === 'Enter') window.scrollTo({ top: 0, left: 0, behavior: 'smooth' }); }} /><Button className="min-h-11 px-6 text-sm max-md:w-full" onClick={() => window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })}>Buscar servicio</Button><Button variant="outline" className="min-h-11 px-5 text-sm max-md:w-full" onClick={() => { window.location.hash = '#publicar'; }}>＋ Publicar mi servicio</Button></div></div></section>
      <section className="mx-auto grid w-[calc(100%-48px)] max-w-7xl grid-cols-[220px_1fr] gap-6 py-12 max-lg:grid-cols-1 max-md:py-8"><ExploreFilters selectedCategory={category} onCategoryChange={(nextCategory) => { setCategory(nextCategory); setCurrentPage(1); }} categories={categoryNames} /><div className="min-w-0">{message && <p className="mb-4 rounded bg-[#fff7df] p-4 text-left text-sm text-[#735d22]">{message}</p>}<div className="mb-7 flex flex-wrap items-end justify-between gap-4 max-sm:items-start"><div><h2 className="text-base font-semibold">Servicios encontrados</h2><p className="text-sm">{filteredServices.length} servicios</p></div><div className="flex items-center gap-1 rounded-lg border border-[#dedee8] bg-white p-1" aria-label="Cambiar vista"><button className={`inline-flex cursor-pointer items-center gap-1 rounded-md px-2.5 py-2 text-xs font-semibold transition-colors ${layout === 'list' ? 'bg-[#7b32ca] text-white' : 'text-[#5420a8] hover:bg-[#f4f1ff]'}`} type="button" onClick={() => setLayout('list')} aria-label="Ver servicios en lista" aria-pressed={layout === 'list'}><List aria-hidden="true" className="h-4 w-4" />Lista</button><button className={`inline-flex cursor-pointer items-center gap-1 rounded-md px-2.5 py-2 text-xs font-semibold transition-colors ${layout === 'grid' ? 'bg-[#7b32ca] text-white' : 'text-[#5420a8] hover:bg-[#f4f1ff]'}`} type="button" onClick={() => setLayout('grid')} aria-label="Ver servicios en cuadrícula" aria-pressed={layout === 'grid'}><Grid2X2 aria-hidden="true" className="h-4 w-4" />Cuadrícula</button></div></div>{featuredServices.length > 0 && <section className="mb-8"><h3 className="mb-3 text-xl font-semibold">Publicaciones relevantes</h3><HorizontalServiceRow services={featuredServices} canView={Boolean(session)} userId={session?.user.id} favoriteIds={visibleFavoriteIds} onToggleFavorite={(serviceId) => void toggleFavorite(serviceId)} featured /></section>}<div className={`${layout === 'list' ? 'space-y-4' : 'grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3'} min-w-0`}>{visibleServices.map((service) => <ServiceCard key={service.id} service={toCard(service, Boolean(session), session?.user.id)} layout={layout} mediaSize="bounded" featured={false} promoted={Boolean(service.is_promoted)} imageHref={`#servicio/${service.id}`} isFavorite={visibleFavoriteIds.has(service.id)} onToggleFavorite={() => void toggleFavorite(service.id)} />)}</div>{!message && filteredServices.length === 0 && <p className="rounded-lg border border-slate-200 p-5 text-sm text-[#676878]">No hay servicios publicados todavía.</p>}{regularServices.length > 0 && <Pagination currentPage={page} totalPages={totalPages} onPageChange={changePage} />}</div></section>
    </>
  );
}

function Pagination({ currentPage, totalPages, onPageChange }: { currentPage: number; totalPages: number; onPageChange: (page: number) => void }) {
  const pages: Array<number | 'ellipsis'> = totalPages <= 7
    ? Array.from({ length: totalPages }, (_, index) => index + 1)
    : [1, ...(currentPage > 3 ? ['ellipsis' as const] : []), ...Array.from(new Set([currentPage - 1, currentPage, currentPage + 1].filter((page) => page > 1 && page < totalPages))), ...(currentPage < totalPages - 2 ? ['ellipsis' as const] : []), totalPages];

  return (
    <nav className="mt-8 flex flex-wrap items-center justify-center gap-2" aria-label="Paginación de servicios">
      <button className="cursor-pointer rounded-md border border-[#dedee8] px-3 py-2 text-sm text-[#5420a8] disabled:cursor-not-allowed disabled:opacity-40" type="button" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>Anterior</button>
      {pages.map((page, index) => page === 'ellipsis' ? <span className="px-1 text-sm text-[#676878]" key={`ellipsis-${index}`} aria-hidden="true">…</span> : <button className={`min-w-9 cursor-pointer rounded-md border px-3 py-2 text-sm ${page === currentPage ? 'border-[#7b32ca] bg-[#7b32ca] text-white' : 'border-[#dedee8] text-[#5420a8] hover:border-[#7b32ca]'}`} type="button" key={page} onClick={() => onPageChange(page)} aria-current={page === currentPage ? 'page' : undefined}>{page}</button>)}
      <button className="cursor-pointer rounded-md border border-[#dedee8] px-3 py-2 text-sm text-[#5420a8] disabled:cursor-not-allowed disabled:opacity-40" type="button" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}>Siguiente</button>
    </nav>
  );
}
