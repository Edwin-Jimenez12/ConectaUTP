import { Button } from './Button';
import { ServiceCard } from './ServiceCard';
import { categories, services } from '../data/services';

function CategoryPills() {
  return (
    <div className="mb-3 flex gap-2" aria-label="Filtrar por categoría">
      {categories.map((category, index) => (
        <button
          className={`min-h-7 rounded-[15px] border px-[13px] text-[9px] ${
            index === 0
              ? 'border-[#7b32ca] bg-[#7b32ca] text-white'
              : 'border-[#e2e2e7] bg-white text-[#4c4c55]'
          }`}
          key={category}
          type="button"
        >
          {category}
        </button>
      ))}
    </div>
  );
}

export function Services() {
  const exploreServices = services.slice(0, 5);
  const featuredServices = services.slice(0, 4);

  return (
    <section className="mx-auto w-[calc(100%-48px)] max-w-[1080px] pb-[38px] pt-[18px] text-center" id="explorar">
      <div className="text-left">
        <h2 className="mb-[10px] text-[18px]">Explora servicios</h2>
        <CategoryPills />
      </div>
      <div className="grid grid-cols-5 gap-[13px] text-left">
        {exploreServices.map((service) => (
          <ServiceCard key={service.id} service={service} />
        ))}
      </div>
      <Button variant="outline" className="mt-[10px] min-h-7 px-[25px] text-[9px]">Ver más servicios</Button>

      <div className="mt-[22px] text-left">
        <h2 className="mb-[10px] text-[18px]">Servicios Destacados</h2>
        <div className="grid grid-cols-[1.5fr_repeat(3,minmax(0,1fr))] gap-[13px]">
          {featuredServices.map((service, index) => (
            <ServiceCard
              key={service.id}
              service={service}
              featured={index === 0}
            />
          ))}
        </div>
        <Button variant="outline" className="mx-auto mt-[10px] block min-h-7 px-[25px] text-[9px]">Ver más destacados</Button>
      </div>
    </section>
  );
}
