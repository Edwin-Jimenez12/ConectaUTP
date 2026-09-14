import { useMemo, useState } from 'react';
import { Button } from './Button';
import { ExploreFilters } from './ExploreFilters';
import { ServiceCard } from './ServiceCard';
import { services } from '../data/services';

const allServices = Array.from({ length: 4 }, (_, group) =>
  services.map((service) => ({ ...service, id: service.id + group * services.length })),
).flat();

export function ExplorePage() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [gridView, setGridView] = useState(true);
  const filteredServices = useMemo(() => allServices.filter((service) => {
    const matchesQuery = service.title.toLowerCase().includes(query.toLowerCase());
    const matchesCategory = !category || service.category === category;
    return matchesQuery && matchesCategory;
  }), [category, query]);
  const pageServices = filteredServices.slice((page - 1) * 9, page * 9);

  return (
    <>
      <section className="bg-linear-to-r from-white via-[#f5f4ff] to-[#e4dcff] py-7">
        <div className="mx-auto w-[calc(100%-48px)] max-w-[1080px]">
          <h1 className="text-[24px] font-bold">Explora servicios</h1>
          <p className="mt-1 text-[10px]">Encuentra personas de la comunidad UTP que pueden ayudarte.</p>
          <div className="mt-3 flex gap-2">
            <input
              className="h-7 w-[240px] rounded-md border border-[#d9d9df] bg-white px-3 text-[10px]"
              placeholder="¿Qué estás buscando?"
              value={query}
              onChange={(event) => { setQuery(event.target.value); setPage(1); }}
            />
            <Button className="min-h-7 px-5 text-[9px]">Buscar servicio</Button>
            <Button variant="outline" className="min-h-7 px-4 text-[9px]">＋ Publicar mi servicio</Button>
          </div>
        </div>
      </section>
      <section className="mx-auto grid w-[calc(100%-48px)] max-w-[1080px] grid-cols-[170px_1fr] gap-4 py-10">
        <ExploreFilters selectedCategory={category} onCategoryChange={(value) => { setCategory(value); setPage(1); }} />
        <div>
          <div className="mb-2 flex items-center justify-between">
            <div>
              <h2 className="text-[12px] font-semibold">Servicios encontrados</h2>
              <p className="text-[9px]">{filteredServices.length} servicios</p>
            </div>
            <button className="rounded border border-[#b77be3] px-3 py-1 text-[9px] text-[#7b32ca]" type="button" onClick={() => setGridView(!gridView)}>
              ▦ Vista: {gridView ? 'cuadrícula' : 'lista'}　⌄
            </button>
          </div>
          <div className={gridView ? 'grid grid-cols-3 gap-3' : 'flex flex-col gap-3'}>
            {pageServices.map((service) => <ServiceCard key={service.id} service={service} />)}
          </div>
          <div className="mt-5 flex justify-center gap-1">
            {[1, 2, 3].map((number) => (
              <button className={`h-6 w-6 rounded text-[10px] ${page === number ? 'bg-[#7b32ca] text-white' : 'border border-[#ddd] bg-white'}`} key={number} type="button" onClick={() => setPage(number)}>{number}</button>
            ))}
            <button className="h-6 w-6 rounded border border-[#ddd] bg-white text-[10px]" type="button" onClick={() => setPage(Math.min(3, page + 1))}>›</button>
          </div>
        </div>
      </section>
    </>
  );
}
