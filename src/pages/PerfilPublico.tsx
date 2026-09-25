import { useEffect, useState } from 'react';
import { ArrowLeft, MessageCircle, UserCircle2 } from 'lucide-react';
import { useAuth } from '../auth/useAuth';
import { Button } from '../components/Button';
import { ServiceCard } from '../components/ServiceCard';
import { getServiceCoverImages } from '../lib/services';
import { supabase } from '../lib/supabase';
import type { PublicService, ServiceCardData } from '../types/service';

interface PublicProfile {
  id: string;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  career: string | null;
  faculty: string | null;
}

function toServiceCard(service: PublicService, canView: boolean, viewerId?: string): ServiceCardData {
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
    galleryImages: service.gallery_images,
    providerImageUrl: service.provider_avatar_url,
    locked: !canView,
    requestHref: canView && service.owner_id !== viewerId ? `#chats/${service.id}` : undefined,
  };
}

export function PerfilPublico({ profileId }: { profileId: string }) {
  const { session } = useAuth();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [services, setServices] = useState<PublicService[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setLoadError('');

    void (async () => {
      const [profileResult, serviceResult] = await Promise.all([
        supabase.from('public_profiles').select('*').eq('id', profileId).maybeSingle(),
        supabase.from('public_services').select('*').eq('owner_id', profileId),
      ]);
      if (!active) return;
      if (profileResult.error || serviceResult.error) {
        setLoadError('No se pudo cargar este perfil. Intenta de nuevo.');
        setIsLoading(false);
        return;
      }

      const profileServices = (serviceResult.data ?? []) as PublicService[];
      if (session && profileServices.length > 0) {
        const galleryResult = await getServiceCoverImages(profileServices.map((service) => service.id));
        if (!active) return;
        setServices(profileServices.map((service) => ({
          ...service,
          cover_image_url: galleryResult.data.get(service.id)?.url,
          cover_image_alt: galleryResult.data.get(service.id)?.altText,
          gallery_images: galleryResult.data.get(service.id)?.galleryImages,
        })));
      } else {
        setServices(profileServices);
      }
      setProfile(profileResult.data as PublicProfile | null);
      setIsLoading(false);
    })().catch(() => {
      if (active) {
        setLoadError('No se pudo cargar este perfil. Intenta de nuevo.');
        setIsLoading(false);
      }
    });

    return () => { active = false; };
  }, [profileId, session]);

  if (isLoading) return <div className="mx-auto min-h-[620px] w-[calc(100%-48px)] max-w-7xl px-6 py-12 text-sm text-[#676878]">Cargando perfil...</div>;
  if (loadError) return <div className="mx-auto min-h-[620px] w-[calc(100%-48px)] max-w-7xl px-6 py-12 text-sm text-red-700" role="alert">{loadError}</div>;
  if (!profile) return <div className="mx-auto min-h-[620px] w-[calc(100%-48px)] max-w-7xl px-6 py-12 text-sm text-[#676878]">Perfil no disponible o privado.</div>;

  const displayName = [profile.first_name, profile.last_name].filter(Boolean).join(' ') || `@${profile.username}`;
  const isOwnProfile = session?.user.id === profile.id;
  const sendMessage = () => {
    window.location.hash = session ? `#chats/usuario/${profile.id}` : '#login';
  };

  return (
    <section className="mx-auto min-h-[620px] w-[calc(100%-48px)] max-w-7xl py-10">
      <a className="inline-flex items-center gap-1 text-xs text-[#7b32ca]" href="#explorar"><ArrowLeft aria-hidden="true" className="h-3.5 w-3.5" />Volver a explorar</a>
      <header className="mt-5 rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-5">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#eeeaff] text-[#5420a8]">{profile.avatar_url ? <img className="h-full w-full object-cover" src={profile.avatar_url} alt={`Foto de ${displayName}`} /> : <UserCircle2 aria-hidden="true" className="h-8 w-8" />}</div>
            <div className="min-w-0"><h1 className="text-2xl font-semibold">{displayName}</h1><p className="text-sm text-[#676878]">@{profile.username ?? 'usuario'}</p></div>
          </div>
          {!isOwnProfile && <Button className="shrink-0" onClick={sendMessage}><MessageCircle aria-hidden="true" className="mr-2 h-4 w-4" />{session ? 'Enviar mensaje' : 'Inicia sesión para escribir'}</Button>}
        </div>
        <p className="mt-4 text-sm text-[#676878]">{profile.bio || 'Este usuario todavía no ha agregado una biografía.'}</p>
        {profile.career && <p className="mt-3 text-xs text-[#676878]">{profile.career}{profile.faculty ? ` · ${profile.faculty}` : ''}</p>}
      </header>
      <div className="mt-6 flex items-center justify-between"><div><h2 className="text-xl font-semibold">Servicios publicados</h2><p className="mt-1 text-sm text-[#676878]">{services.length} publicaciones</p></div><Button variant="outline" onClick={() => { window.location.hash = '#explorar'; }}>Explorar</Button></div>
      {isLoading ? <p className="mt-4 rounded-lg border border-slate-200 p-5 text-sm text-[#676878]">Cargando publicaciones...</p> : services.length > 0 ? <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{services.map((service) => <ServiceCard key={service.id} service={toServiceCard(service, Boolean(session), session?.user.id)} imageHref={`#servicio/${service.id}`} />)}</div> : <p className="mt-4 rounded-lg border border-dashed border-slate-300 p-5 text-sm text-[#676878]">Este usuario todavía no tiene servicios publicados.</p>}
    </section>
  );
}
