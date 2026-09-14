import { categories } from '../data/services';

interface ExploreFiltersProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export function ExploreFilters({
  selectedCategory,
  onCategoryChange,
}: ExploreFiltersProps) {
  return (
    <aside className="h-fit rounded-lg border border-[#d9d9df] bg-white p-3 text-[9px]">
      <h2 className="mb-4 text-[12px] font-semibold">Filtrar resultados</h2>
      <fieldset className="border-0 p-0">
        <legend className="mb-2 font-semibold">Categoría</legend>
        <div className="flex flex-col gap-2">
          {categories.concat('Marketing').map((category) => (
            <label className="flex items-center gap-2" key={category}>
              <input
                className="accent-[#7b32ca]"
                type="checkbox"
                checked={selectedCategory === category || (category === 'Todos' && selectedCategory === '')}
                onChange={() => onCategoryChange(category === 'Todos' ? '' : category)}
              />
              {category}
            </label>
          ))}
        </div>
      </fieldset>
      <div className="my-3 border-t border-[#888]" />
      <fieldset className="border-0 p-0">
        <legend className="mb-2 font-semibold">Modalidad</legend>
        <div className="flex flex-col gap-2">
          {['Online', 'Presencial', 'Ambas'].map((mode) => (
            <label className="flex items-center gap-2" key={mode}>
              <input className="accent-[#7b32ca]" type="checkbox" />
              {mode}
            </label>
          ))}
        </div>
      </fieldset>
      <div className="my-3 border-t border-[#888]" />
      <label className="mb-2 block font-semibold" htmlFor="price-filter">Precio</label>
      <select className="h-7 w-full rounded border border-[#d9d9df] px-2 text-[9px]" id="price-filter">
        <option>Cualquier precio</option>
        <option>Hasta $25</option>
        <option>Desde $25</option>
      </select>
      <label className="mb-2 mt-3 block font-semibold" htmlFor="sort-filter">Ordenar por</label>
      <select className="h-7 w-full rounded border border-[#d9d9df] px-2 text-[9px]" id="sort-filter">
        <option>Más relevantes</option>
        <option>Mejor calificados</option>
        <option>Precio menor</option>
      </select>
      <button className="mt-4 w-full text-[#7b32ca]" type="button" onClick={() => onCategoryChange('')}>
        Limpiar filtros
      </button>
    </aside>
  );
}
