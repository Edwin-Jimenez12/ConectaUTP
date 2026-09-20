import { useEffect, useState } from 'react';
import { Button } from '../components/Button';
import { PlanCard } from '../components/PlanCard';
import { useAuth } from '../auth/useAuth';
import { getPlanFeatureLabels, listPublicPlans, listPublicPromotions, type AdminPlan, type AdminPromotion } from '../lib/adminData';
import { boosts, plans } from './planes.data';

function mapPlan(plan: AdminPlan) {
  return {
    name: plan.name,
    price: `B/.${Number(plan.price).toFixed(2)}`,
    period: plan.billing_period === 'free' ? 'siempre' : plan.billing_period === 'yearly' ? 'por año' : plan.billing_period === 'quarterly' ? 'por trimestre' : 'por mes',
    description: plan.description,
    features: getPlanFeatureLabels(plan),
    featured: plan.is_most_used,
  };
}

function mapPromotion(promotion: AdminPromotion) {
  const benefit = promotion.benefit_key === 'max_published_services'
    ? `${promotion.benefit_operation === 'add' ? '+' : ''}${promotion.benefit_value} servicio${promotion.benefit_value === 1 ? '' : 's'} publicado${promotion.benefit_value === 1 ? '' : 's'}`
    : `${promotion.benefit_value} servicio${promotion.benefit_value === 1 ? '' : 's'} destacado${promotion.benefit_value === 1 ? '' : 's'}`;
  return {
    name: promotion.name,
    duration: `${promotion.duration_days} días`,
    price: `B/.${Number(promotion.price).toFixed(2)}`,
    benefit,
  };
}

export function Planes() {
  const { session } = useAuth();
  const [remotePlans, setRemotePlans] = useState<AdminPlan[]>([]);
  const [remotePromotions, setRemotePromotions] = useState<AdminPromotion[]>([]);

  useEffect(() => {
    let isActive = true;
    void Promise.all([listPublicPlans(), listPublicPromotions()]).then(([plansResult, promotionsResult]) => {
      if (!isActive) return;
      if (!plansResult.error) setRemotePlans(plansResult.data);
      if (!promotionsResult.error) setRemotePromotions(promotionsResult.data);
    });
    return () => {
      isActive = false;
    };
  }, []);

  const visiblePlans = remotePlans.length > 0 ? remotePlans.map(mapPlan) : plans;
  const visibleBoosts = remotePromotions.length > 0 ? remotePromotions.map(mapPromotion) : boosts;

  return (
    <>
      <section className="bg-linear-to-br from-[#f8f7ff] via-white to-[#e7ddff] px-6 py-14 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7b32ca]">
          Planes de ConectaUTP
        </p>
        <h1 className="mx-auto mt-4 max-w-3xl text-4xl font-bold tracking-[-1px] max-md:text-3xl">
          Publica gratis. Crece cuando lo necesites.
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-[#676878]">
          Comienza con el plan gratuito y elige un plan cuando necesites más espacio o visibilidad.
        </p>
      </section>

      <section className="mx-auto w-[calc(100%-48px)] max-w-7xl py-12">
        <div className="mb-7 text-center">
          <h2 className="text-2xl font-semibold">Elige cómo crecer</h2>
          <p className="mt-2 text-sm text-[#676878]">
            Sin comisiones por tus trabajos. Solo pagas una mensualidad si necesitas más publicaciones y beneficios.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {visiblePlans.map((plan) => (
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
            {visibleBoosts.map((boost) => (
              <article
                className="rounded-xl border border-slate-200 bg-white p-5"
                key={boost.name}
              >
                <h3 className="font-semibold">{boost.name}</h3>
                <p className="mt-2 text-sm text-[#676878]">
                  {boost.benefit} durante {boost.duration}
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

      {!session && <section className="mx-auto grid w-[calc(100%-48px)] max-w-7xl gap-8 py-12">
        <aside className="rounded-2xl bg-linear-to-br from-[#5420a8] to-[#2671eb] p-7 text-white flex items-center justify-between max-md:flex-col max-md:items-start">
          <div className="mt-3 max-w-6xl text-sm leading-6">
            <h2 className="text-3xl font-bold">Crece a tu ritmo</h2>
            <p className="mt-3 text-base leading-6 text-white/90">ConectaUTP mantiene el acceso básico gratuito para que cualquier estudiante pueda comenzar.</p>
          </div>
          <Button variant="secondary" className="px-10 text-xl" onClick={() => { window.location.hash = '#registro'; }}>Crear cuenta gratis</Button>
        </aside>
      </section>}
    </>
  );
}
