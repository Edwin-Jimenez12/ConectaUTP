import { ArrowRight, CheckCircle2, CreditCard, Sparkles, X } from 'lucide-react';
import { Button } from './Button';
import { YappyPaymentButton } from './YappyPaymentButton';
import { clearPendingYappyPayment } from '../lib/yappyCheckoutStorage';
import type { DatabaseService } from '../types/service';

export type YappyCheckout = { type: 'plan'; id: string; name: string; amount: string } | { type: 'promotion'; id: string; name: string; amount: string; requiresService: boolean };

export function YappyCheckoutDialog({ checkout, services, selectedServiceId, onServiceChange, onClose }: { checkout: YappyCheckout; services: DatabaseService[]; selectedServiceId: string; onServiceChange: (serviceId: string) => void; onClose: () => void }) {
  const isPromotion = checkout.type === 'promotion';
  const serviceId = isPromotion && checkout.requiresService ? selectedServiceId : undefined;
  const publishedServices = services.filter((service) => service.status === 'published');
  const waitingForService = Boolean(isPromotion && checkout.requiresService && !serviceId);
  const closePayment = () => {
    clearPendingYappyPayment();
    onClose();
  };

  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4" role="dialog" aria-modal="true" aria-labelledby="yappy-dialog-title">
    <div className="yappy-checkout-dialog flex max-h-[calc(100dvh-2rem)] w-full max-w-md flex-col overflow-hidden rounded-2xl border p-5 shadow-2xl sm:p-6">
      <div className="flex shrink-0 items-start justify-between gap-4 pb-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[#7b32ca]">Pago seguro con Yappy</p>
          <h2 className="mt-1 text-xl font-semibold" id="yappy-dialog-title">{checkout.name}</h2>
          <p className="yappy-checkout-muted mt-1 text-sm">Total: B/.{checkout.amount}</p>
        </div>
        <button className="yappy-checkout-close rounded-md p-1" type="button" onClick={closePayment} aria-label="Cerrar pago"><X aria-hidden="true" className="h-5 w-5" /></button>
      </div>

      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain py-2 pr-1">
      {isPromotion && checkout.requiresService && <div className="yappy-service-picker rounded-xl border p-4">
        <div className="flex items-start gap-3">
          <span className="yappy-service-icon flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"><Sparkles aria-hidden="true" className="h-5 w-5" /></span>
          <div>
            <label className="block text-sm font-semibold" htmlFor="yappy-promotion-service">Primero, elige la publicación</label>
            <p className="yappy-checkout-muted mt-1 text-xs leading-5">La promoción se aplicará únicamente al servicio que selecciones.</p>
          </div>
        </div>
        <select className="yappy-service-select mt-3 h-12 w-full rounded-lg border px-3 text-sm font-medium" id="yappy-promotion-service" value={selectedServiceId} onChange={(event) => onServiceChange(event.target.value)}>
          <option value="">Selecciona una publicación</option>
          {publishedServices.map((service) => <option key={service.id} value={service.id}>{service.title}</option>)}
        </select>
        {publishedServices.length === 0 && <p className="yappy-checkout-muted mt-2 text-xs">No tienes publicaciones activas para promocionar. Publica un servicio primero.</p>}
      </div>}

      <div className="yappy-payment-guide rounded-xl border p-4">
        <div className="flex items-center gap-2 text-sm font-semibold"><CreditCard aria-hidden="true" className="h-4 w-4" />Cómo completar el pago</div>
        <ol className="mt-3 space-y-2.5 text-xs leading-5">
          <li className="flex gap-2"><span className="yappy-guide-step">1</span><span>Ingresa el número de celular registrado en Yappy.</span></li>
          <li className="flex gap-2"><span className="yappy-guide-step">2</span><span>Presiona <strong>Pagar con Yappy</strong> para enviar la solicitud.</span></li>
          <li className="flex gap-2"><span className="yappy-guide-step">3</span><span>Abre tu banca en línea o la app de tu banco y acepta la solicitud de pago de Yappy.</span></li>
          <li className="flex gap-2"><span className="yappy-guide-step"><CheckCircle2 aria-hidden="true" className="h-3.5 w-3.5" /></span><span>Después de aceptarla, vuelve aquí y espera la confirmación automática.</span></li>
        </ol>
        <p className="yappy-checkout-muted mt-3 border-t pt-3 text-[11px] leading-4">No cierres esta ventana antes de aceptar. El pago solo se confirma cuando Yappy notifica que fue ejecutado; una solicitud pendiente no activa el plan ni la promoción.</p>
      </div>
      </div>

      <div className="yappy-checkout-actions mt-3 shrink-0 border-t pt-3">
        {waitingForService ? <div className="yappy-checkout-waiting flex items-center gap-2 rounded-lg border px-3 py-3 text-sm"><ArrowRight aria-hidden="true" className="h-4 w-4 shrink-0" />Selecciona una publicación para continuar al pago.</div> : <YappyPaymentButton planId={checkout.type === 'plan' ? checkout.id : undefined} promotionId={checkout.type === 'promotion' ? checkout.id : undefined} serviceId={serviceId} onSuccess={closePayment} />}
        <Button className="mt-3 w-full" variant="outline" onClick={closePayment}>Cancelar</Button>
      </div>
    </div>
  </div>;
}
