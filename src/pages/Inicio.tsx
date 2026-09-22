import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Share2 } from 'lucide-react';
import { useAuth } from '../auth/useAuth';
import { Button } from '../components/Button';
import { ServiceCard } from '../components/ServiceCard';
import { getServiceCoverImages, listFavoriteServiceIds, listPublicServices, setServiceFavorite } from '../lib/services';
import { comparePublicServices, hasVisibleHighlight } from '../lib/serviceRanking';
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

function HeroVisual() {
  const [pointer, setPointer] = useState({ x: 0, y: 0 });
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotionPreference = () => setReducedMotion(mediaQuery.matches);
    updateMotionPreference();
    mediaQuery.addEventListener?.('change', updateMotionPreference);
    return () => mediaQuery.removeEventListener?.('change', updateMotionPreference);
  }, []);

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (reducedMotion) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    setPointer({
      x: (event.clientX - bounds.left) / bounds.width - 0.5,
      y: (event.clientY - bounds.top) / bounds.height - 0.5,
    });
  }

  return (
    <div
      className="relative h-full min-h-[300px] w-full overflow-hidden max-md:min-h-[240px]"
      aria-hidden="true"
      onPointerMove={handlePointerMove}
      onPointerLeave={() => setPointer({ x: 0, y: 0 })}
    >
      <div className="absolute inset-0">
        <div className="absolute right-[-10%] top-[-25%] h-[125%] w-[68%] rounded-[50%] bg-[#e8e1ff]" />
        <div className="absolute right-[10%] top-[15%] h-64 w-64 rounded-full bg-[#b9a2f4]/30 blur-3xl" />
        <div className="absolute bottom-[-20%] right-[20%] h-72 w-72 rounded-full bg-[#9dbbff]/25 blur-3xl" />
        <div className="hero-network-line absolute left-[42%] top-[35%] h-px w-[47%] rotate-[18deg]" />
        <div className="hero-network-line absolute left-[43%] top-[62%] h-px w-[45%] rotate-[-19deg]" />
        <div className="hero-network-line absolute left-[67%] top-[16%] h-[68%] w-px -translate-x-1/2 rotate-[25deg]" />

        <div
          className="hero-network-stage absolute inset-y-0 left-[38%] right-0"
          style={{ transform: `translate3d(${pointer.x * 12}px, ${pointer.y * 9}px, 0)` }}
        >
          <span className="hero-node absolute left-[17%] top-[34%]" />
          <span className="hero-node absolute right-[20%] top-[24%] [animation-delay:-1s]" />
          <span className="hero-node absolute bottom-[25%] left-[19%] [animation-delay:-2s]" />
          <span className="hero-node absolute bottom-[20%] right-[22%] [animation-delay:-3s]" />

          <div className="hero-service-card hero-motion absolute left-[4%] top-[17%] [animation-delay:-1s]">
            <span className="hero-card-dot bg-[#f59e0b]" />
            <span><b>Diseño gráfico</b><small>Disponible hoy · B/.15</small></span>
          </div>
          <div className="hero-service-card hero-motion absolute right-[5%] top-[42%] [animation-delay:-3s]">
            <span className="hero-card-dot bg-[#10b981]" />
            <span><b>Tutorías</b><small>Disponible hoy</small></span>
          </div>
          <div className="hero-service-card hero-motion absolute bottom-[13%] left-[9%] [animation-delay:-4s]">
            <span className="hero-card-dot bg-[#60a5fa]" />
            <span><b>Desarrollo web</b><small>12 estudiantes conectados</small></span>
          </div>

          <div className="hero-network-core hero-motion absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center [animation-delay:-2s]">
            <div className="flex h-28 w-28 items-center justify-center rounded-full border-[10px] border-white bg-[#7b32ca] text-6xl font-bold text-white shadow-[0_18px_45px_rgba(84,32,168,0.25)] ring-8 ring-[#cfc4f6]/50 max-md:h-20 max-md:w-20 max-md:border-[7px] max-md:text-4xl">C</div>
            <div className="hero-brand-label mt-3 rounded-full border border-white/80 bg-white/75 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#5420a8] shadow-sm backdrop-blur-sm">ConectaUTP</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function HeroSection() {
  const [query, setQuery] = useState('');

  return (
    <section className="hero-section relative overflow-hidden bg-[#f3f0ff]" id="inicio">
      <div className="hero-visual-layer absolute inset-0">
        <HeroVisual />
      </div>
      <div className="relative z-10 mx-auto flex min-h-[380px] w-[calc(100%-48px)] max-w-7xl items-center max-lg:min-h-[470px] max-md:min-h-[500px]">
        <div className="relative max-w-[600px] max-md:mt-5">
          <h1 className="m-0 text-5xl font-bold max-md:text-4xl">Lo que necesitas,<br />dentro de tu <span className="text-[#7b32ca]">comunidad</span></h1>
          <p className="hero-subtitle my-3 mb-4 max-w-[480px] text-base leading-[1.45] text-[#000000]/75 max-md:text-sm">Encuentra u ofrece servicios dentro de la comunidad UTP y conecta con estudiantes que pueden ayudarte a lograr más.</p>
          <div className="flex max-w-[475px] max-sm:flex-col max-sm:gap-2">
            <input className="min-w-0 w-full rounded-l-[6px] border border-[#000000]/60 px-4 py-3 text-base max-sm:rounded-md" id="service-search" type="search" placeholder="¿Qué estás buscando?" value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') window.location.hash = `#explorar?query=${encodeURIComponent(query.trim())}`; }} />
            <Button className="shrink-0 cursor-pointer whitespace-nowrap rounded-l-none rounded-r-[6px] px-6 text-sm max-sm:rounded-md" onClick={() => { window.location.hash = `#explorar?query=${encodeURIComponent(query.trim())}`; }}>Buscar servicio</Button>
          </div>
          <Button variant="outline" className="mt-4 min-w-[160px] cursor-pointer text-sm" onClick={() => { window.location.hash = '#publicar'; }}>+ Publicar mi servicio</Button>
        </div>
      </div>
    </section>
  );
}

function HorizontalServiceRow({ services, canView, userId, favoriteIds, onToggleFavorite, featured = false }: { services: PublicService[]; canView: boolean; userId?: string; favoriteIds: Set<string>; onToggleFavorite: (serviceId: string) => void; featured?: boolean }) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [canScroll, setCanScroll] = useState({ left: false, right: false });
  const visibleServices = services.slice(0, 10);

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
      <div className="flex gap-[13px] overflow-x-hidden pb-3 pr-1" ref={rowRef}>
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

const CATEGORY_SECTIONS = [
  { title: 'Desarrollo web', terms: ['desarrollo web'] },
  { title: 'Diseño', terms: ['diseno'] },
  { title: 'Fotografía', terms: ['fotografia'] },
  { title: 'Marketing', terms: ['marketing'] },
  { title: 'Tutorías', terms: ['tutoria', 'tutorias'] },
] as const;

function normalizeCategory(value: string) {
  return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function ServicesSection({ services, canView, message, userId, favoriteIds, onToggleFavorite }: { services: PublicService[]; canView: boolean; message: string; userId?: string; favoriteIds: Set<string>; onToggleFavorite: (serviceId: string) => void }) {
  const featured = services.filter(hasVisibleHighlight).sort(comparePublicServices).slice(0, 10);
  const categorySections = CATEGORY_SECTIONS.map((category) => ({
    ...category,
    services: services.filter((service) => category.terms.some((term) => normalizeCategory(service.category_name).includes(term))),
  })).filter((category) => category.services.length >= 5);
  return (
    <section className="mx-auto w-[calc(100%-48px)] max-w-7xl pb-12 pt-7 text-center" id="explorar">
      {message && <p className="mb-4 rounded bg-[#fff7df] p-4 text-left text-sm text-[#735d22]">{message}</p>}
      {featured.length >= 10 && <div className="text-left"><h2 className="mb-2 text-2xl font-semibold">Servicios destacados</h2><p className="mb-3 text-sm text-[#676878]">Publicaciones recientes y relevantes de la comunidad.</p><HorizontalServiceRow services={featured} canView={canView} userId={userId} favoriteIds={favoriteIds} onToggleFavorite={onToggleFavorite} featured /></div>}
      <div className="mt-8 text-left">
        <h2 className="mb-3 text-2xl font-semibold">Explora servicios</h2>
        {services.length > 0 ? <HorizontalServiceRow services={services} canView={canView} userId={userId} favoriteIds={favoriteIds} onToggleFavorite={onToggleFavorite} /> : !message && <p className="rounded-lg border border-slate-200 p-5 text-sm text-[#676878]">No hay servicios publicados todavía.</p>}
      </div>
      {categorySections.map((category) => <div className="mt-8 text-left" key={category.title}><h2 className="mb-3 text-2xl font-semibold">{category.title}</h2><HorizontalServiceRow services={category.services} canView={canView} userId={userId} favoriteIds={favoriteIds} onToggleFavorite={onToggleFavorite} /></div>)}
    </section>
  );
}

function ShareBanner() {
  return <section className="mx-auto mb-12 flex min-h-[110px] w-[calc(100%-48px)] max-w-7xl items-center gap-7 rounded-xl bg-linear-to-r from-[#3d44da] to-[#7b32ca] px-9 py-5 text-white max-md:flex-wrap max-md:gap-4 max-md:px-5"><div className="flex h-14 w-14 items-center justify-center rounded-lg border border-white/70" aria-hidden="true"><Share2 className="h-7 w-7" /></div><div><h2 className="mb-1 text-xl font-semibold">¿Tienes una habilidad que compartir?</h2><p className="text-sm leading-[1.35]">Publica tu servicio y conecta con personas<br />de tu comunidad.</p></div><Button variant="secondary" className="ml-auto min-w-[180px] text-sm max-md:ml-0" onClick={() => { window.location.hash = '#publicar'; }}>Publicar mi servicio</Button></section>;
}

export function Inicio() {
  const { session } = useAuth();
  const [services, setServices] = useState<PublicService[]>([]);
  const [message, setMessage] = useState('');
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(() => new Set());
  const [favoriteOwnerId, setFavoriteOwnerId] = useState<string | null>(null);
  const [favoriteError, setFavoriteError] = useState('');
  useEffect(() => {
    let active = true;
    void (async () => {
      const serviceResult = await listPublicServices();
      if (!active) return;
      if (serviceResult.error) {
        setMessage('No se pudo cargar el catálogo. Verifica las migraciones de servicios en Supabase.');
        setServices([]);
        return;
      }

      const nextServices = serviceResult.data ?? [];
      if (!session || nextServices.length === 0) {
        setServices(nextServices);
        return;
      }

      const coverResult = await getServiceCoverImages(nextServices.map((service) => service.id));
      if (!active) return;
      setServices(nextServices.map((service) => ({
        ...service,
        cover_image_url: coverResult.data.get(service.id)?.url,
        cover_image_alt: coverResult.data.get(service.id)?.altText,
      })));
    })();
    return () => { active = false; };
  }, [session]);

  useEffect(() => {
    if (!session) return;

    let active = true;
    void listFavoriteServiceIds(session.user.id).then((result) => {
      if (!active) return;
      setFavoriteIds(result.data);
      setFavoriteOwnerId(session.user.id);
      if (result.error) setFavoriteError('No se pudieron cargar tus favoritos.');
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
      setFavoriteError('No se pudo actualizar el favorito.');
    } else {
      setFavoriteError('');
    }
  }

  const visibleFavoriteIds = favoriteOwnerId === session?.user.id ? favoriteIds : EMPTY_FAVORITES;
  return <><HeroSection /><ServicesSection services={services} canView={Boolean(session)} userId={session?.user.id} message={message || favoriteError} favoriteIds={visibleFavoriteIds} onToggleFavorite={(serviceId) => void toggleFavorite(serviceId)} /><ShareBanner /></>;
}
