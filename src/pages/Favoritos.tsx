import { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';
import { useAuth } from '../auth/useAuth';
import { ServiceCard } from '../components/ServiceCard';
import { getServiceCoverImages, listFavoriteServices, setServiceFavorite } from '../lib/services';
import type { PublicService, ServiceCardData } from '../types/service';

function toCard(service: PublicService, userId: string): ServiceCardData {
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
    requestHref: service.owner_id !== userId ? `#chats/${service.id}` : undefined,
  };
}

export function Favoritos() {
  const { session } = useAuth();
  const [services, setServices] = useState<PublicService[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!session) return undefined;
    let active = true;

    void (async () => {
      const result = await listFavoriteServices(session.user.id);
      if (!active) return;
      if (result.error) {
        setMessage('No se pudieron cargar tus favoritos.');
        setIsLoading(false);
        return;
      }

      const nextServices = result.data ?? [];
      const coverResult = await getServiceCoverImages(nextServices.map((service) => service.id));
      if (!active) return;
      setServices(nextServices.map((service) => ({
        ...service,
        cover_image_url: coverResult.data.get(service.id)?.url,
        cover_image_alt: coverResult.data.get(service.id)?.altText,
        gallery_images: coverResult.data.get(service.id)?.galleryImages,
      })));
      setIsLoading(false);
    })();

    return () => { active = false; };
  }, [session]);

  async function removeFavorite(serviceId: string) {
    if (!session) return;
    const previousServices = services;
    setServices((current) => current.filter((service) => service.id !== serviceId));
    const result = await setServiceFavorite(session.user.id, serviceId, false);
    if (result.error) {
      setServices(previousServices);
      setMessage('No se pudo quitar el favorito.');
    }
  }

  return (
    <section className="mx-auto w-[calc(100%-48px)] max-w-7xl py-12">
      <div className="mb-8 flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#f0e8ff] text-[#7b32ca]"><Heart aria-hidden="true" className="h-5 w-5 fill-current" /></div>
        <div>
          <h1 className="text-3xl font-bold">Favoritos</h1>
          <p className="mt-2 text-sm text-[#676878]">Guarda las publicaciones que quieres volver a consultar.</p>
        </div>
      </div>
      {message && <p className="mb-5 rounded-lg bg-[#fff7df] p-4 text-sm text-[#735d22]">{message}</p>}
      {isLoading ? <p className="rounded-lg border border-slate-200 p-6 text-sm text-[#676878]">Cargando favoritos...</p> : services.length === 0 ? <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center"><Heart aria-hidden="true" className="mx-auto h-8 w-8 text-[#7b32ca]" /><h2 className="mt-4 text-lg font-semibold">Todavía no tienes favoritos</h2><p className="mt-2 text-sm text-[#676878]">Toca el corazón de una publicación para guardarla aquí.</p><button className="mt-5 cursor-pointer rounded-md bg-[#7b32ca] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#6422b0]" type="button" onClick={() => { window.location.hash = '#explorar'; }}>Explorar servicios</button></div> : <div className="grid grid-cols-3 gap-5 max-2xl:grid-cols-2 max-sm:grid-cols-1">{services.map((service) => <ServiceCard key={service.id} service={toCard(service, session?.user.id ?? '')} imageHref={`#servicio/${service.id}`} isFavorite onToggleFavorite={() => void removeFavorite(service.id)} />)}</div>}
    </section>
  );
}
