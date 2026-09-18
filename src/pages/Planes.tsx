import { Button } from '../components/Button';
import { PlanCard } from '../components/PlanCard';
import { boosts, plans } from './planes.data';

export function Planes() {
  return (
    <>
      <section className="bg-linear-to-br from-[#f8f7ff] via-white to-[#e7ddff] px-6 py-16 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7b32ca]">
          Planes de ConectaUTP
        </p>
        <h1 className="mx-auto mt-4 max-w-3xl text-4xl font-bold tracking-[-1px] max-md:text-3xl">
          Publica gratis. Destaca cuando quieras crecer.
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-[#676878]">
          Empieza sin costo, publica tus servicios y paga únicamente si
          necesitas mostrar una publicación a más personas.
        </p>
      </section>

      <section className="mx-auto w-[calc(100%-48px)] max-w-7xl py-12">
        <div className="mb-7 text-center">
          <h2 className="text-2xl font-semibold">Publica sin pagar</h2>
          <p className="mt-2 text-sm text-[#676878]">
            ConectaUTP no cobra suscripciones ni comisiones por tus trabajos.
            Solo pagas si quieres darle mayor visibilidad a una publicación.
          </p>
        </div>

        <div className="mx-auto max-w-md">
          {plans.map((plan) => (
            <PlanCard key={plan.name} plan={plan} />
          ))}
        </div>
      </section>

      <section className="bg-[#f7f5ff] px-6 py-12">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7b32ca]">
              Promociones
            </p>
            <h2 className="mt-2 text-2xl font-semibold">
              Destaca un servicio específico
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#676878]">
              Elige cuál de tus publicaciones quieres impulsar y durante
              cuánto tiempo. Pagar una promoción no destaca automáticamente
              todos tus servicios.
            </p>
          </div>

          <div className="mt-7 grid gap-4 md:grid-cols-3">
            {boosts.map((boost) => (
              <article
                className={
                  boost.badge
                    ? 'rounded-xl border border-[#7b32ca] bg-white p-5'
                    : 'rounded-xl border border-slate-200 bg-white p-5'
                }
                key={boost.name}
              >
                {boost.badge && (
                  <span className="mb-3 w-fit rounded-full bg-[#eeeaff] px-3 py-1 text-xs font-semibold text-[#6842dd]">
                    {boost.badge}
                  </span>
                )}
                <h3 className="font-semibold">{boost.name}</h3>
                <p className="mt-2 text-sm text-[#676878]">
                  {boost.duration} de visibilidad promocionada
                </p>
                <p className="mt-4 text-2xl font-bold text-[#5420a8]">
                  {boost.price}
                </p>
                <p className="mt-1 text-xs text-[#676878]">
                  por servicio seleccionado
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-[calc(100%-48px)] max-w-7xl gap-8 py-12">
        <aside className="rounded-2xl bg-linear-to-br from-[#5420a8] to-[#2671eb] p-7 text-white 
        flex justify-between items-center max-md:flex-col max-md:items-start">
          
          <div className="mt-3 max-w-6xl text-sm leading-6">
            <h2 className="text-3xl font-bold">Crece a tu ritmo</h2>
            <p className="mt-3 text-base leading-6 text-white/90">
            ConectaUTP mantiene el acceso básico gratuito para que cualquier
            estudiante pueda comenzar.
          </p>
          
          </div>
          <Button
            variant="secondary"
            className="px-10 text-xl "
            onClick={() => {
              window.location.hash = '#registro';
            }}
          >
            Crear cuenta gratis
          </Button>
        </aside>
      </section>
    </>
  );
}
