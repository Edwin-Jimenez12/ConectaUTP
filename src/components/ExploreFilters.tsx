interface ExploreFiltersProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  categories?: string[];
}

export function ExploreFilters({
  selectedCategory,
  onCategoryChange,
  categories = [],
}: ExploreFiltersProps) {
  const categoryOptions = ['Todos', ...categories.filter((category) => category !== 'Todos')];
  return (
    <aside className="h-fit rounded-lg border border-[#d9d9df] bg-white p-4 text-xs max-lg:grid max-lg:grid-cols-4 max-lg:gap-4 max-lg:p-5 max-sm:grid-cols-1">
      <h2 className="mb-5 text-sm font-semibold max-lg:col-span-4 max-sm:col-span-1">Filtrar resultados</h2>
      <fieldset className="border-0 p-0 max-lg:col-span-1">
        <legend className="mb-2 font-semibold">Categoría</legend>
        <div className="flex flex-col gap-3">
          {categoryOptions.map((category) => (
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
      <div className="my-3 border-t border-[#888] max-lg:hidden" />
      <fieldset className="border-0 p-0 max-lg:col-span-1">
        <legend className="mb-2 font-semibold">Modalidad</legend>
        <div className="flex flex-col gap-3">
          {['Online', 'Presencial', 'Ambas'].map((mode) => (
            <label className="flex items-center gap-2" key={mode}>
              <input className="accent-[#7b32ca]" type="checkbox" />
              {mode}
            </label>
          ))}
        </div>
      </fieldset>
      <div className="my-3 border-t border-[#888] max-lg:hidden" />
      <div className="max-lg:col-span-1"><label className="mb-2 block font-semibold" htmlFor="price-filter">Precio</label>
      <select className="h-9 w-full rounded border border-[#d9d9df] px-2 text-xs" id="price-filter">
        <option>Cualquier precio</option>
        <option>Hasta B/.25</option>
        <option>Desde B/.25</option>
      </select></div>
      <div className="max-lg:col-span-1"><label className="mb-2 mt-3 block font-semibold" htmlFor="sort-filter">Ordenar por</label>
      <select className="h-9 w-full rounded border border-[#d9d9df] px-2 text-xs" id="sort-filter">
        <option>Más relevantes</option>
        <option>Más recientes</option>
        <option>Precio menor</option>
      </select></div>
      <button className="mt-4 w-full text-[#7b32ca] max-lg:col-span-4 max-sm:col-span-1" type="button" onClick={() => onCategoryChange('')}>
        Limpiar filtros
      </button>
    </aside>
  );
}
