import { useEffect, useState } from 'react';
import { Button } from '../components/Button';
import { PlanCard } from '../components/PlanCard';
import { YappyCheckoutDialog, type YappyCheckout } from '../components/YappyCheckoutDialog';
import { useAuth } from '../auth/useAuth';
import { getPlanFeatureLabels, listPublicPlans, listPublicPromotions, type AdminPlan, type AdminPromotion } from '../lib/adminData';
import { listOwnerServices } from '../lib/services';
import type { DatabaseService } from '../types/service';
import { plans } from './planes.data';

const CHECKOUT_STORAGE_KEY = 'conecta-yappy-checkout';
const CHECKOUT_SERVICE_STORAGE_KEY = 'conecta-yappy-checkout-service';

function readStoredCheckout(): YappyCheckout | null {
  try {
    const value = sessionStorage.getItem(CHECKOUT_STORAGE_KEY);
    if (!value) return null;
    const checkout = JSON.parse(value) as Partial<YappyCheckout>;
    if (checkout.type !== 'plan' && checkout.type !== 'promotion') return null;
    if (typeof checkout.id !== 'string' || typeof checkout.name !== 'string' || typeof checkout.amount !== 'string') return null;
    if (checkout.type === 'promotion' && typeof checkout.requiresService !== 'boolean') return null;
    return checkout as YappyCheckout;
  } catch {
    return null;
  }
}

function readStoredServiceId() {
  try {
    return sessionStorage.getItem(CHECKOUT_SERVICE_STORAGE_KEY) ?? '';
  } catch {
    return '';
  }
}

function mapPlan(plan: AdminPlan, onSelect?: () => void) {
  return {
    id: plan.id,
    name: plan.name,
    price: `B/.${Number(plan.price).toFixed(2)}`,
    period: plan.billing_period === 'free' ? 'siempre' : plan.billing_period === 'yearly' ? 'por año' : plan.billing_period === 'quarterly' ? 'por trimestre' : 'por mes',
    description: plan.description,
    features: getPlanFeatureLabels(plan),
    featured: plan.is_most_used,
    onSelect,
  };
}

function mapPromotion(promotion: AdminPromotion) {
  const benefit = promotion.benefit_key === 'max_published_services'
    ? `${promotion.benefit_operation === 'add' ? '+' : ''}${promotion.benefit_value} servicio${promotion.benefit_value === 1 ? '' : 's'} publicado${promotion.benefit_value === 1 ? '' : 's'}`
    : `${promotion.benefit_value} servicio${promotion.benefit_value === 1 ? '' : 's'} destacado${promotion.benefit_value === 1 ? '' : 's'}`;
  return {
    id: promotion.id,
    name: promotion.name,
    duration: `${promotion.duration_days} días`,
    price: `B/.${Number(promotion.price).toFixed(2)}`,
    benefit,
    requiresService: promotion.benefit_key === 'featured_service',
  };
}

export function Planes() {
  const { session } = useAuth();
  const [remotePlans, setRemotePlans] = useState<AdminPlan[]>([]);
  const [remotePromotions, setRemotePromotions] = useState<AdminPromotion[]>([]);
  const [promotionsLoading, setPromotionsLoading] = useState(true);
  const [promotionsError, setPromotionsError] = useState(false);
  const [services, setServices] = useState<DatabaseService[]>([]);
  const [checkout, setCheckout] = useState<YappyCheckout | null>(readStoredCheckout);
  const [selectedServiceId, setSelectedServiceId] = useState(readStoredServiceId);

  useEffect(() => {
    try {
      if (checkout) sessionStorage.setItem(CHECKOUT_STORAGE_KEY, JSON.stringify(checkout));
      else sessionStorage.removeItem(CHECKOUT_STORAGE_KEY);
    } catch {
      // Some privacy modes block sessionStorage; the checkout still works in memory.
    }
  }, [checkout]);

  useEffect(() => {
    try {
      if (checkout?.type === 'promotion' && checkout.requiresService && selectedServiceId) sessionStorage.setItem(CHECKOUT_SERVICE_STORAGE_KEY, selectedServiceId);
      else sessionStorage.removeItem(CHECKOUT_SERVICE_STORAGE_KEY);
    } catch {
      // Some privacy modes block sessionStorage; the checkout still works in memory.
    }
  }, [checkout, selectedServiceId]);

  useEffect(() => {
    let isActive = true;
    void Promise.all([listPublicPlans(), listPublicPromotions()]).then(([plansResult, promotionsResult]) => {
      if (!isActive) return;
      if (!plansResult.error) setRemotePlans(plansResult.data);
      if (promotionsResult.error) setPromotionsError(true);
      else setRemotePromotions(promotionsResult.data);
      setPromotionsLoading(false);
    }).catch(() => {
      if (!isActive) return;
      setPromotionsError(true);
      setPromotionsLoading(false);
    });
    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    if (!session) {
      return;
    }
    void listOwnerServices(session.user.id).then(({ data }) => setServices(data ?? []));
  }, [session]);

  const closeCheckout = () => {
    setCheckout(null);
    setSelectedServiceId('');
  };
  const visiblePlans = remotePlans.length > 0 ? remotePlans.map((plan) => mapPlan(plan, session ? () => setCheckout({ type: 'plan', id: plan.id, name: plan.name, amount: Number(plan.price).toFixed(2) }) : undefined)) : plans;
  const visibleBoosts = remotePromotions.map(mapPromotion);

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

          {promotionsLoading ? (
            <p className="mt-7 text-sm text-[#676878]">Cargando promociones...</p>
          ) : promotionsError ? (
            <p className="mt-7 text-sm text-red-700" role="alert">
              No se pudieron cargar las promociones. Intenta recargar la página.
            </p>
          ) : visibleBoosts.length === 0 ? (
            <p className="mt-7 rounded-xl border border-slate-200 bg-white p-5 text-sm text-[#676878]">
              No hay promociones disponibles por el momento.
            </p>
          ) : (
            <div className="mt-7 grid gap-4 md:grid-cols-3">
              {visibleBoosts.map((boost) => (
                <article
                  className="rounded-xl border border-slate-200 bg-white p-5"
                  key={boost.id}
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
                  <Button
                    className="mt-5 w-full"
                    onClick={() => {
                      if (!session) {
                        window.location.hash = '#login';
                        return;
                      }
                      setSelectedServiceId('');
                      setCheckout({
                        type: 'promotion',
                        id: boost.id,
                        name: boost.name,
                        amount: boost.price.replace('B/.', ''),
                        requiresService: boost.requiresService,
                      });
                    }}
                  >
                    Solicitar promoción
                  </Button>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
      {checkout && <YappyCheckoutDialog checkout={checkout} services={services} selectedServiceId={selectedServiceId} onServiceChange={setSelectedServiceId} onClose={closeCheckout} />}

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
