import { useEffect, useMemo, useState } from 'react';
import heroBase from '../assets/hero.png';
import { useAuth } from '../auth/useAuth';
import { Button } from '../components/Button';
import { ServiceCard } from '../components/ServiceCard';
import { listCategories, listPublicServices } from '../lib/services';
import type { ServiceCategory } from '../lib/services';
import type { PublicService, ServiceCardData } from '../types/service';

function toCard(service: PublicService, canView: boolean): ServiceCardData {
  return {
    id: service.id,
    title: service.title,
    provider: service.provider_name,
    price: service.price === null ? 'Precio por definir' : `Desde $${service.price}`,
    rating: service.rating.toFixed(1),
    category: service.category_name,
    locked: !canView,
  };
}

function CategoryPills({ categories, selected, onSelect }: { categories: ServiceCategory[]; selected: string; onSelect: (category: string) => void }) {
  const options = [{ name: 'Todos' }, ...categories];
  return (
    <div className="mb-3 flex flex-wrap gap-2" aria-label="Filtrar por categoría">
      {options.map((category) => (
        <button className={`min-h-9 rounded-[15px] border px-4 text-xs ${selected === category.name ? 'border-[#7b32ca] bg-[#7b32ca] text-white' : 'border-[#e2e2e7] bg-white text-[#4c4c55]'}`} key={category.name} type="button" onClick={() => onSelect(category.name === 'Todos' ? '' : category.name)}>
          {category.name}
        </button>
      ))}
    </div>
  );
}

function HeroSection() {
  return (
    <section className="bg-linear-to-r from-white via-[#f1f1ff] to-[#e2d9ff]" id="inicio">
      <div className="relative mx-auto flex min-h-[300px] w-[calc(100%-48px)] max-w-6xl items-center max-lg:min-h-[340px] max-md:min-h-[470px]">
        <div className="relative z-10 max-w-[600px] max-md:pt-6">
          <h1 className="m-0 text-5xl font-bold max-md:text-4xl">Lo que necesitas,<br />dentro de tu <span className="text-[#7b32ca]">comunidad</span></h1>
          <p className="my-3 mb-4 max-w-[480px] text-base leading-[1.45] text-[#575a6c] max-md:text-sm">Encuentra u ofrece servicios dentro de la comunidad UTP y conecta con estudiantes que pueden ayudarte a lograr más.</p>
          <div className="flex max-w-[475px] max-sm:flex-col max-sm:gap-2">
            <input className="min-w-0 w-full rounded-l-[6px] border border-[#dedee8] px-4 py-3 text-base max-sm:rounded-md" id="service-search" type="search" placeholder="¿Qué estás buscando?" />
            <Button className="shrink-0 cursor-pointer whitespace-nowrap rounded-l-none rounded-r-[6px] px-6 text-sm max-sm:rounded-md" onClick={() => { window.location.hash = '#explorar'; }}>Buscar servicio</Button>
          </div>
          <Button variant="outline" className="mt-4 min-w-[160px] cursor-pointer text-sm" onClick={() => { window.location.hash = '#publicar'; }}>+ Publicar mi servicio</Button>
        </div>
        <div className="absolute right-[-30px] top-0 h-full w-[58%] max-lg:right-[-12%] max-lg:w-[62%] max-md:bottom-0 max-md:top-auto max-md:h-[230px] max-md:w-[125%]" aria-hidden="true">
          <img className="h-full w-full object-cover" src={heroBase} alt="" />
        </div>
      </div>
    </section>
  );
}

function ServicesSection({ services, categories, canView, message }: { services: PublicService[]; categories: ServiceCategory[]; canView: boolean; message: string }) {
  const [selectedCategory, setSelectedCategory] = useState('');
  const filtered = useMemo(() => services.filter((service) => !selectedCategory || service.category_name === selectedCategory), [selectedCategory, services]);
  const featured = [...services].sort((a, b) => b.rating - a.rating || b.review_count - a.review_count).slice(0, 4);
  return (
    <section className="mx-auto w-[calc(100%-48px)] max-w-6xl pb-12 pt-7 text-center" id="explorar">
      <div className="text-left"><h2 className="mb-3 text-2xl font-semibold">Explora servicios</h2><CategoryPills categories={categories} selected={selectedCategory} onSelect={setSelectedCategory} /></div>
      {message && <p className="mb-4 rounded bg-[#fff7df] p-4 text-left text-sm text-[#735d22]">{message}</p>}
      <div className="grid grid-cols-5 gap-[13px] text-left max-xl:grid-cols-3 max-md:grid-cols-2 max-sm:grid-cols-1">{filtered.slice(0, 5).map((service) => <ServiceCard key={service.id} service={toCard(service, canView)} href={`#servicio/${service.id}`} />)}</div>
      {!message && filtered.length === 0 && <p className="rounded-lg border border-slate-200 p-5 text-left text-sm text-[#676878]">No hay servicios publicados todavía.</p>}
      <Button variant="outline" className="mt-3 min-h-9 px-7 text-sm" onClick={() => { window.location.hash = '#explorar'; }}>Ver más servicios</Button>
      <div className="mt-[22px] text-left"><h2 className="mb-3 text-2xl font-semibold">Servicios Destacados</h2><p className="mb-3 text-sm text-[#676878]">Publicaciones reales con mejor valoración y mayor interacción.</p>
        <div className="grid grid-cols-[1.5fr_repeat(3,minmax(0,1fr))] gap-[13px] max-xl:grid-cols-2 max-md:grid-cols-1">{featured.map((service, index) => <ServiceCard key={service.id} service={toCard(service, canView)} featured={index === 0} href={`#servicio/${service.id}`} />)}</div>
        {featured.length > 0 && <Button variant="outline" className="mx-auto mt-3 block min-h-9 px-7 text-sm" onClick={() => { window.location.hash = '#explorar'; }}>Ver más destacados</Button>}
      </div>
    </section>
  );
}

function ShareBanner() {
  return <section className="mx-auto mb-12 flex min-h-[110px] w-[calc(100%-48px)] max-w-6xl items-center gap-7 rounded-xl bg-linear-to-r from-[#3d44da] to-[#7b32ca] px-9 py-5 text-white max-md:flex-wrap max-md:gap-4 max-md:px-5"><div className="flex h-14 w-14 items-center justify-center rounded-lg border border-white/70 text-3xl" aria-hidden="true">♧</div><div><h2 className="mb-1 text-xl font-semibold">¿Tienes una habilidad que compartir?</h2><p className="text-sm leading-[1.35]">Publica tu servicio y conecta con personas<br />de tu comunidad.</p></div><Button variant="secondary" className="ml-auto min-w-[180px] text-sm max-md:ml-0" onClick={() => { window.location.hash = '#publicar'; }}>Publicar mi servicio</Button></section>;
}

export function Inicio() {
  const { session } = useAuth();
  const [services, setServices] = useState<PublicService[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [message, setMessage] = useState('');
  useEffect(() => {
    void Promise.all([listPublicServices(), listCategories()]).then(([serviceResult, categoryResult]) => {
      if (serviceResult.error || categoryResult.error) setMessage('No se pudo cargar el catálogo. Verifica las migraciones de servicios en Supabase.');
      setServices(serviceResult.data ?? []);
      setCategories(categoryResult.data ?? []);
    });
  }, []);
  return <><HeroSection /><ServicesSection services={services} categories={categories} canView={Boolean(session)} message={message} /><ShareBanner /></>;
}
