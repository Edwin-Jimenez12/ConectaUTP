import { useEffect, useState } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../auth/useAuth';
import { Button } from '../components/Button';
import { ServiceCard } from '../components/ServiceCard';
import { getPublicService, getServiceCoverImages, getServiceImages, listExplorePublicServices, listFavoriteServiceIds, listRelatedPublicServices, recordServiceView, setServiceFavorite } from '../lib/services';
import { supabase } from '../lib/supabase';
import type { DatabaseService, PublicService } from '../types/service';

function toCard(service: PublicService, canView: boolean, userId?: string) {
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

export function ServicioPublico({ serviceId }: { serviceId: string }) {
  const { session } = useAuth();
  const [service, setService] = useState<PublicService | null>(null);
  const [details, setDetails] = useState<DatabaseService | null>(null);
  const [signedImages, setSignedImages] = useState<Array<{ url: string; altText: string }>>([]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [relatedServices, setRelatedServices] = useState<PublicService[]>([]);
  const [moreServices, setMoreServices] = useState<PublicService[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    setActiveImageIndex(0);
    setSignedImages([]);
    void recordServiceView(serviceId);
    void getPublicService(serviceId).then(async ({ data }) => {
      setService(data);
      if (!data) return;
      const [relatedResult, moreResult] = await Promise.all([
        listRelatedPublicServices(data),
        listExplorePublicServices(data.id),
      ]);
      const related = relatedResult.data ?? [];
      const more = moreResult.data ?? [];
      if (session) {
        const coverResult = await getServiceCoverImages([...related, ...more].map((item) => item.id));
        const withCovers = (items: PublicService[]) => items.map((item) => ({ ...item, cover_image_url: coverResult.data.get(item.id)?.url, cover_image_alt: coverResult.data.get(item.id)?.altText, gallery_images: coverResult.data.get(item.id)?.galleryImages }));
        setRelatedServices(withCovers(related));
        setMoreServices(withCovers(more));
        const [serviceResult, imageResult] = await Promise.all([
          supabase.from('services').select('*').eq('id', serviceId).maybeSingle(),
          getServiceImages(serviceId),
        ]);
        setDetails(serviceResult.data as DatabaseService | null);
        const imageRows = imageResult.data ?? [];
        const imageItems = await Promise.all(imageRows.map(async (image) => {
          const signedResult = await supabase.storage.from('service-images').createSignedUrl(image.storage_path, 600);
          return signedResult.data?.signedUrl ? { url: signedResult.data.signedUrl, altText: image.alt_text ?? data.title } : null;
        }));
        setSignedImages(imageItems.filter((image): image is { url: string; altText: string } => image !== null));
      } else {
        setRelatedServices(related);
        setMoreServices(more);
      }
    });
  }, [serviceId, session]);

  useEffect(() => {
    if (!session) {
      return;
    }
    void listFavoriteServiceIds(session.user.id).then(({ data }) => setFavoriteIds(data));
  }, [session]);

  async function toggleFavorite(targetServiceId: string) {
    if (!session) {
      window.location.hash = '#login';
      return;
    }
    const nextValue = !favoriteIds.has(targetServiceId);
    setFavoriteIds((current) => {
      const next = new Set(current);
      if (nextValue) next.add(targetServiceId); else next.delete(targetServiceId);
      return next;
    });
    const result = await setServiceFavorite(session.user.id, targetServiceId, nextValue);
    if (result.error) {
      setFavoriteIds((current) => {
        const next = new Set(current);
        if (nextValue) next.delete(targetServiceId); else next.add(targetServiceId);
        return next;
      });
    }
  }

  if (!service) return <div className="mx-auto min-h-[620px] w-[calc(100%-48px)] max-w-7xl px-6 py-12 text-sm text-[#676878]">Servicio no disponible.</div>;
  const isOwner = session?.user.id === service.owner_id;
  const visibleFavoriteIds = session ? favoriteIds : new Set<string>();
  const showPreviousImage = () => setActiveImageIndex((current) => (current - 1 + signedImages.length) % signedImages.length);
  const showNextImage = () => setActiveImageIndex((current) => (current + 1) % signedImages.length);

  return (
    <section className="mx-auto min-h-[620px] w-[calc(100%-48px)] max-w-7xl py-10">
      <a className="inline-flex items-center gap-1 text-xs text-[#7b32ca]" href="#explorar"><ArrowLeft aria-hidden="true" className="h-3.5 w-3.5" />Volver a explorar</a>
      <article className="mt-5 overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="grid gap-4 p-5 sm:grid-cols-2">
          <div>{session && signedImages.length > 0 ? <div className="relative flex h-64 items-center justify-center overflow-hidden rounded-lg bg-[#f5f4f8] sm:h-80">
            <img className="h-full w-full object-contain" src={signedImages[activeImageIndex]?.url} alt={signedImages[activeImageIndex]?.altText || service.title} />
            {signedImages.length > 1 ? <>
              <button aria-label="Imagen anterior" className="absolute left-3 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-black/80" onClick={showPreviousImage} type="button"><ChevronLeft aria-hidden="true" className="h-6 w-6" /></button>
              <button aria-label="Imagen siguiente" className="absolute right-3 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-black/80" onClick={showNextImage} type="button"><ChevronRight aria-hidden="true" className="h-6 w-6" /></button>
            </> : null}
            <span aria-live="polite" className="absolute right-3 top-3 rounded-full bg-black/70 px-2.5 py-1 text-xs font-medium text-white">{activeImageIndex + 1} / {signedImages.length}</span>
          </div> : <div className="flex h-64 items-center justify-center rounded-lg bg-linear-to-br from-[#eeeaff] to-[#d9d2eb] text-sm text-[#6040b5] sm:h-80">{session ? 'Este servicio no tiene imágenes.' : 'Regístrate para ver las imágenes.'}</div>}</div>
          <div><span className="text-xs text-[#7b32ca]">{service.category_name}</span><h1 className="mt-2 text-2xl font-semibold">{service.title}</h1><p className="mt-2 text-sm text-[#676878]">Por {service.provider_name}</p><p className="mt-4 text-sm">{details?.description ?? 'Inicia sesión para consultar la descripción completa del servicio.'}</p><p className="mt-5 font-semibold text-[#7b32ca]">{service.price === null ? 'Precio por definir' : `Desde B/.${service.price}`}</p></div>
        </div>
        {session && !isOwner && service.contact_clients_enabled !== false ? <div className="border-t border-slate-100 p-5"><p className="text-sm text-[#676878]">¿Te interesa este servicio? Solicita información directamente al proveedor.</p><Button className="mt-3" onClick={() => { window.location.hash = `#chats/${service.id}`; }}>Solicitar servicio</Button></div> : !session ? <div className="border-t border-slate-100 p-5 text-sm text-[#676878]">Inicia sesión para solicitar este servicio.</div> : null}
      </article>
      <RelatedServices title={`Más publicaciones de ${service.category_name}`} services={relatedServices} session={session} userId={session?.user.id} favoriteIds={visibleFavoriteIds} onToggleFavorite={toggleFavorite} emptyMessage="Todavía no hay otras publicaciones en esta categoría." />
      <RelatedServices title="Explora más servicios" services={moreServices} session={session} userId={session?.user.id} favoriteIds={visibleFavoriteIds} onToggleFavorite={toggleFavorite} emptyMessage="Todavía no hay más servicios publicados." />
    </section>
  );
}

function RelatedServices({ title, services, session, userId, favoriteIds, onToggleFavorite, emptyMessage }: { title: string; services: PublicService[]; session: ReturnType<typeof useAuth>['session']; userId?: string; favoriteIds: Set<string>; onToggleFavorite: (serviceId: string) => void; emptyMessage: string }) {
  return <section className="mt-10"><div className="flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-2xl font-semibold">{title}</h2><p className="mt-1 text-sm text-[#676878]">{title.startsWith('Más') ? 'Publicaciones de la misma categoría.' : 'Servicios destacados y no destacados, priorizando los destacados.'}</p></div><Button variant="outline" onClick={() => { window.location.hash = '#explorar'; }}>Ver todos</Button></div>{services.length > 0 ? <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{services.slice(0, 6).map((item) => <ServiceCard key={item.id} service={toCard(item, Boolean(session), userId)} layout="grid" featured={Boolean(item.is_featured || item.is_interest_featured)} promoted={Boolean(item.is_promoted)} imageHref={`#servicio/${item.id}`} isFavorite={favoriteIds.has(item.id)} onToggleFavorite={() => void onToggleFavorite(item.id)} />)}</div> : <p className="mt-4 rounded-lg border border-dashed border-slate-300 p-5 text-sm text-[#676878]">{emptyMessage}</p>}</section>;
}
