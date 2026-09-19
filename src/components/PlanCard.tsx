import { Check } from 'lucide-react';
import { Button } from './Button';
import { plans } from '../pages/planes.data';

export function PlanCard({ plan }: { plan: (typeof plans)[number] }) {
  const cardClass = plan.featured
    ? 'border-[#7b32ca] bg-[#faf8ff] shadow-[0_12px_30px_rgba(123,50,202,0.12)]'
    : 'border-slate-200 bg-white';

  return (
    <article
      className={`relative flex flex-col rounded-2xl border p-6 ${cardClass}`}
    >
      {plan.featured && (
        <span className="absolute -top-3 left-5 rounded-full bg-[#7b32ca] px-3 py-1 text-xs font-semibold text-white">
          Más elegido
        </span>
      )}

      <h2 className="text-lg font-semibold">{plan.name}</h2>
      <p className="mt-2 min-h-10 text-sm text-[#676878]">
        {plan.description}
      </p>
      <p className="mt-5 text-3xl font-bold text-[#5420a8]">
        {plan.price}
        <span className="ml-1 text-xs font-normal text-[#676878]">
          {plan.period}
        </span>
      </p>

      <ul className="mt-5 space-y-3 text-sm text-[#454653]">
        {plan.features.map((feature) => (
          <li className="flex items-start gap-2" key={feature}><Check aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-[#7b32ca]" />{feature}</li>
        ))}
      </ul>

      <Button
        variant={plan.featured ? 'primary' : 'outline'}
        className="mt-6 w-full"
        onClick={() => {
          window.location.hash = '#registro';
        }}
      >
        {plan.name === 'Gratis' ? 'Comenzar gratis' : 'Crear cuenta'}
      </Button>
    </article>
  );
}
