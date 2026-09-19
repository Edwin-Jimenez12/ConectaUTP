import { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../auth/useAuth';
import { Button } from '../components/Button';
import { getPublicService, getServiceImages } from '../lib/services';
import { supabase } from '../lib/supabase';
import type { DatabaseService, PublicService, ServiceImage } from '../types/service';

export function ServicioPublico({ serviceId }: { serviceId: string }) {
  const { session } = useAuth();
  const [service, setService] = useState<PublicService | null>(null);
  const [details, setDetails] = useState<DatabaseService | null>(null);
  const [images, setImages] = useState<ServiceImage[]>([]);
  const [signedImages, setSignedImages] = useState<string[]>([]);

  useEffect(() => {
    void getPublicService(serviceId).then(async ({ data }) => {
      setService(data);
      if (!session || !data) return;
      const [serviceResult, imageResult] = await Promise.all([
        supabase.from('services').select('*').eq('id', serviceId).maybeSingle(),
        getServiceImages(serviceId),
      ]);
      setDetails(serviceResult.data as DatabaseService | null);
      const imageRows = imageResult.data ?? [];
      setImages(imageRows);
      const urls = await Promise.all(imageRows.map(async (image) => supabase.storage.from('service-images').createSignedUrl(image.storage_path, 600)));
      setSignedImages(urls.map((result) => result.data?.signedUrl).filter((url): url is string => Boolean(url)));
    });
  }, [serviceId, session]);

  if (!service) return <div className="mx-auto min-h-[620px] w-[calc(100%-48px)] max-w-7xl px-6 py-12 text-sm text-[#676878]">Servicio no disponible.</div>;
  const isOwner = session?.user.id === service.owner_id;

  return (
    <section className="mx-auto min-h-[620px] w-[calc(100%-48px)] max-w-7xl py-10">
      <a className="inline-flex items-center gap-1 text-xs text-[#7b32ca]" href="#explorar"><ArrowLeft aria-hidden="true" className="h-3.5 w-3.5" />Volver a explorar</a>
      <article className="mt-5 overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="grid gap-4 p-5 sm:grid-cols-2">
          <div className="space-y-2">{session && signedImages.length > 0 ? signedImages.map((url, index) => <img className="h-48 w-full rounded-lg bg-[#f5f4f8] object-contain" key={url} src={url} alt={images[index]?.alt_text ?? service.title} />) : <div className="flex h-48 items-center justify-center rounded-lg bg-linear-to-br from-[#eeeaff] to-[#d9d2eb] text-sm text-[#6040b5]">{session ? 'Este servicio no tiene imágenes.' : 'Regístrate para ver las imágenes.'}</div>}</div>
          <div><span className="text-xs text-[#7b32ca]">{service.category_name}</span><h1 className="mt-2 text-2xl font-semibold">{service.title}</h1><p className="mt-2 text-sm text-[#676878]">Por {service.provider_name}</p><p className="mt-4 text-sm">{details?.description ?? 'Inicia sesión para consultar la descripción completa del servicio.'}</p><p className="mt-5 font-semibold text-[#7b32ca]">{service.price === null ? 'Precio por definir' : `Desde B/.${service.price}`}</p></div>
        </div>
        {session && !isOwner ? <div className="border-t border-slate-100 p-5"><p className="text-sm text-[#676878]">¿Te interesa este servicio? Solicita información directamente al proveedor.</p><Button className="mt-3" onClick={() => { window.location.hash = `#chats/${service.id}`; }}>Solicitar servicio</Button></div> : !session ? <div className="border-t border-slate-100 p-5 text-sm text-[#676878]">Inicia sesión para solicitar este servicio.</div> : null}
      </article>
    </section>
  );
}
