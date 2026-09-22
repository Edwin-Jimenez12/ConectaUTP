import { useEffect, useEffectEvent, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';

let scriptPromise: Promise<void> | null = null;

function loadYappyScript() {
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-yappy-button]');
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true });
      if (customElements.get('btn-yappy')) resolve();
      return;
    }
    const script = document.createElement('script');
    script.type = 'module';
    script.src = 'https://bt-cdn.yappy.cloud/v1/cdn/web-component-btn-yappy.js';
    script.dataset.yappyButton = 'true';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('No se pudo cargar el botón de Yappy.'));
    document.head.appendChild(script);
  });
  return scriptPromise;
}

export function YappyPaymentButton({ planId, promotionId, serviceId, onSuccess }: { planId?: string; promotionId?: string; serviceId?: string; onSuccess?: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [aliasYappy, setAliasYappy] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isScriptReady, setIsScriptReady] = useState(false);
  const startPayment = useEffectEvent(async (button: HTMLElement & { eventPayment?: (params: Record<string, string>) => void }) => {
    if (!/^6\d{7}$/.test(aliasYappy.replace(/\D/g, ''))) {
      setMessage('Escribe tu número panameño de Yappy, sin +507.');
      return;
    }
    setIsLoading(true);
    setMessage('Preparando el pago seguro con Yappy...');
    const { data, error } = await supabase.functions.invoke('yappy-payment', { body: { action: 'create-order', planId, promotionId, serviceId, aliasYappy: aliasYappy.replace(/\D/g, '') } });
    if (error || !data?.body?.token || !data.body.documentName || !data.body.transactionId) {
      setIsLoading(false);
      setMessage(await getPaymentErrorMessage(error, data));
      return;
    }
    button.eventPayment?.({ transactionId: data.body.transactionId, documentName: data.body.documentName, token: data.body.token });
  });
  const handleSuccess = useEffectEvent(() => {
    setIsLoading(false);
    setMessage('Pago enviado. Estamos esperando la confirmación de Yappy.');
    onSuccess?.();
  });
  const handleError = useEffectEvent(() => {
    setIsLoading(false);
    setMessage('Yappy no pudo completar el pago. Inténtalo nuevamente.');
  });

  useEffect(() => {
    let active = true;
    void loadYappyScript().then(() => {
      if (!active || !containerRef.current || containerRef.current.children.length > 0) return;
      const button = document.createElement('btn-yappy');
      button.setAttribute('theme', 'blue');
      button.setAttribute('rounded', 'true');
      containerRef.current.appendChild(button);
      button.addEventListener('eventClick', () => {
        void startPayment(button);
      });
      button.addEventListener('eventSuccess', handleSuccess);
      button.addEventListener('eventError', handleError);
      setIsScriptReady(true);
    }).catch((error: unknown) => {
      if (active) setMessage(error instanceof Error ? error.message : 'No se pudo cargar Yappy.');
    });
    return () => { active = false; };
  }, []);

  return <div className="space-y-3" aria-busy={isLoading}><label className="block text-left text-sm font-medium">Número de Yappy<input className="mt-1 h-11 w-full rounded-md border border-slate-200 px-3 text-sm" inputMode="numeric" maxLength={8} placeholder="65591976" value={aliasYappy} onChange={(event) => setAliasYappy(event.target.value)} /></label><div className="flex min-h-11 items-center justify-center" ref={containerRef} />{!isScriptReady && !message && <p className="text-center text-sm text-[#676878]">Cargando botón de Yappy...</p>}{message && <p className="text-sm text-[#6040b5]">{message}</p>}</div>;
}

async function getPaymentErrorMessage(error: unknown, data: { error?: string } | null) {
  if (data?.error) return data.error;
  const context = error && typeof error === 'object' && 'context' in error ? (error as { context?: unknown }).context : null;
  if (context instanceof Response) {
    try {
      const payload = await context.clone().json() as { error?: string };
      if (payload.error) return payload.error;
    } catch {
      // Keep the SDK message when the function did not return JSON.
    }
  }
  return error instanceof Error ? error.message : 'No se pudo preparar el pago.';
}
