import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../auth/useAuth';
import { Button } from '../components/Button';
import { ExploreFilters } from '../components/ExploreFilters';
import { ServiceCard } from '../components/ServiceCard';
import { listCategories, listPublicServices } from '../lib/services';
import type { PublicService, ServiceCardData } from '../types/service';

function toCard(service: PublicService, canView: boolean): ServiceCardData {
  return {
    id: service.id,
    title: service.title,
    provider: service.provider_name,
    price: service.price === null ? 'Precio por definir' : `Desde B/.${service.price}`,
    rating: service.rating.toFixed(1),
    category: service.category_name,
    locked: !canView,
  };
}

export function Explora() {
  const { session } = useAuth();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [services, setServices] = useState<PublicService[]>([]);
  const [categoryNames, setCategoryNames] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const servicesPerPage = 9;

  useEffect(() => {
    void Promise.all([listPublicServices(), listCategories()]).then(([serviceResult, categoryResult]) => {
      if (serviceResult.error || categoryResult.error) setMessage('No se pudo cargar el catálogo. Ejecuta la migración de servicios en Supabase.');
      setServices(serviceResult.data ?? []);
      setCategoryNames((categoryResult.data ?? []).map((item) => item.name));
    });
  }, []);

  const filteredServices = useMemo(() => services.filter((service) => service.title.toLowerCase().includes(query.toLowerCase()) && (!category || service.category_name === category)), [category, query, services]);
  const totalPages = Math.max(1, Math.ceil(filteredServices.length / servicesPerPage));
  const page = Math.min(currentPage, totalPages);
  const visibleServices = filteredServices.slice((page - 1) * servicesPerPage, page * servicesPerPage);

  return (
    <>
      <section className="bg-linear-to-r from-white via-[#f5f4ff] to-[#e4dcff] py-10"><div className="mx-auto w-[calc(100%-48px)] max-w-7xl"><h1 className="text-3xl font-bold">Explora servicios</h1><p className="mt-2 text-sm">Encuentra personas de la comunidad UTP que pueden ayudarte.</p><div className="mt-4 flex gap-3 max-md:flex-col"><input className="h-11 w-[300px] rounded-md border border-[#d9d9df] bg-white px-4 text-sm max-md:w-full" placeholder="¿Qué estás buscando?" value={query} onChange={(event) => { setQuery(event.target.value); setCurrentPage(1); }} /><Button className="min-h-11 px-6 text-sm max-md:w-full">Buscar servicio</Button><Button variant="outline" className="min-h-11 px-5 text-sm max-md:w-full" onClick={() => { window.location.hash = '#publicar'; }}>＋ Publicar mi servicio</Button></div></div></section>
      <section className="mx-auto grid w-[calc(100%-48px)] max-w-7xl grid-cols-[220px_1fr] gap-6 py-12 max-lg:grid-cols-1 max-md:py-8"><ExploreFilters selectedCategory={category} onCategoryChange={(nextCategory) => { setCategory(nextCategory); setCurrentPage(1); }} categories={categoryNames} /><div><div className="mb-4"><h2 className="text-base font-semibold">Servicios encontrados</h2><p className="text-sm">{filteredServices.length} servicios</p></div>{message && <p className="mb-4 rounded bg-[#fff7df] p-4 text-sm text-[#735d22]">{message}</p>}<div className="grid grid-cols-3 gap-5 max-2xl:grid-cols-2 max-sm:grid-cols-1">{visibleServices.map((service) => <ServiceCard key={service.id} service={toCard(service, Boolean(session))} href={`#servicio/${service.id}`} />)}</div>{!message && filteredServices.length === 0 && <p className="rounded-lg border border-slate-200 p-5 text-sm text-[#676878]">No hay servicios publicados todavía.</p>}{filteredServices.length > 0 && <Pagination currentPage={page} totalPages={totalPages} onPageChange={setCurrentPage} />}</div></section>
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
