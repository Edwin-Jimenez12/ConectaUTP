import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const apiBaseUrl = () => (Deno.env.get('YAPPY_API_BASE_URL') ?? 'https://apipagosbg.bgeneral.cloud').replace(/\/$/, '');

interface PaymentOrder {
  id: string;
  order_id: string;
  provider_id: string;
  plan_id: string | null;
  promotion_id: string | null;
  service_id: string | null;
  amount: number;
  concept: string;
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    if (request.method === 'GET') return await handleIpn(new URL(request.url));

    const authorization = request.headers.get('Authorization');
    if (!authorization?.startsWith('Bearer ')) return json({ error: 'Sesión no autorizada.' }, 401);

    const url = Deno.env.get('SUPABASE_URL') ?? '';
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const userClient = createClient(url, anonKey, { global: { headers: { Authorization: authorization } } });
    const { data: userData, error: userError } = await userClient.auth.getUser();
    if (userError || !userData.user) return json({ error: 'Sesión no autorizada.' }, 401);

    const body = await request.json();
    if (body.action !== 'create-order') return json({ error: 'Acción de pago no válida.' }, 400);

    const aliasYappy = cleanPhone(body.aliasYappy);
    if (!aliasYappy) return json({ error: 'Escribe un número panameño registrado en Yappy.' }, 400);

    const admin = createClient(url, serviceRoleKey);
    return await createOrder(admin, userData.user.id, { planId: body.planId, promotionId: body.promotionId, serviceId: body.serviceId, aliasYappy });
  } catch (error) {
    console.error(error);
    return json({ error: 'No se pudo iniciar el pago con Yappy.' }, 500);
  }
});

async function createOrder(admin: ReturnType<typeof createClient>, providerId: string, input: { planId?: unknown; promotionId?: unknown; serviceId?: unknown; aliasYappy: string }) {
  const planId = asId(input.planId);
  const promotionId = asId(input.promotionId);
  const serviceId = asId(input.serviceId);
  if ((planId ? 1 : 0) + (promotionId ? 1 : 0) !== 1) return json({ error: 'Selecciona un plan o una promoción.' }, 400);

  let amount = 0;
  let concept = '';
  let promotion: { id: string; name: string; price: number; duration_days: number; is_active: boolean; starts_at: string; ends_at: string; benefit_key: string } | null = null;

  if (planId) {
    const result = await admin.from('platform_plans').select('id, name, price, billing_period, is_active').eq('id', planId).maybeSingle();
    if (result.error || !result.data || !result.data.is_active || result.data.billing_period === 'free' || Number(result.data.price) <= 0) return json({ error: 'El plan no está disponible para pago.' }, 400);
    amount = Number(result.data.price);
    concept = `Plan ${result.data.name}`;
  } else if (promotionId) {
    const result = await admin.from('platform_promotions').select('id, name, price, duration_days, is_active, starts_at, ends_at, benefit_key').eq('id', promotionId).maybeSingle();
    if (result.error || !result.data || !result.data.is_active || new Date(result.data.starts_at) > new Date() || new Date(result.data.ends_at) < new Date() || Number(result.data.price) <= 0) return json({ error: 'La promoción no está disponible para pago.' }, 400);
    promotion = result.data as typeof promotion;
    if (promotion.benefit_key === 'featured_service' && !serviceId) return json({ error: 'Selecciona la publicación que deseas destacar.' }, 400);
    if (serviceId) {
      const serviceResult = await admin.from('services').select('id').eq('id', serviceId).eq('owner_id', providerId).eq('status', 'published').maybeSingle();
      if (serviceResult.error || !serviceResult.data) return json({ error: 'La publicación seleccionada no es válida.' }, 400);
    }
    amount = Number(result.data.price);
    concept = `Promoción ${result.data.name}`;
  }

  const orderId = `C${Date.now().toString(36)}${crypto.randomUUID().replaceAll('-', '').slice(0, 5)}`.slice(0, 15).toUpperCase();
  const ipnUrl = Deno.env.get('YAPPY_IPN_URL') ?? `${Deno.env.get('SUPABASE_URL')}/functions/v1/yappy-payment`;
  const domain = requiredSecret('YAPPY_DOMAIN');
  const merchantId = requiredSecret('YAPPY_MERCHANT_ID');
  const order = await admin.from('provider_payment_orders').insert({ order_id: orderId, provider_id: providerId, plan_id: planId, promotion_id: promotionId, service_id: serviceId, amount, concept, metadata: { aliasYappy: input.aliasYappy } }).select('id, order_id').single();
  if (order.error || !order.data) return json({ error: 'No se pudo preparar la orden.' }, 500);

  try {
    const validation = await yappyRequest('/payments/validate/merchant', { merchantId, urlDomain: domain });
    const token = validation?.body?.token;
    if (!token) throw new Error('Yappy no devolvió un token de autorización.');
    const created = await yappyRequest('/payments/payment-wc', {
      merchantId,
      orderId,
      domain,
      paymentDate: Date.now(),
      aliasYappy: input.aliasYappy,
      ipnUrl,
      discount: '0.00',
      taxes: '0.00',
      subtotal: amount.toFixed(2),
      total: amount.toFixed(2),
    }, token);
    const payment = created?.body;
    if (!payment?.transactionId || !payment?.documentName || !payment?.token) throw new Error('Yappy no devolvió los datos de la orden.');
    return json({ body: { transactionId: payment.transactionId, documentName: payment.documentName, token: payment.token }, orderId }, 200);
  } catch (error) {
    await admin.from('provider_payment_orders').update({ status: 'canceled', metadata: { error: error instanceof Error ? error.message : 'Yappy error' } }).eq('order_id', orderId);
    throw error;
  }
}

async function handleIpn(url: URL) {
  const orderId = url.searchParams.get('orderId');
  const status = url.searchParams.get('status');
  const hash = url.searchParams.get('hash');
  const domain = url.searchParams.get('domain');
  if (!orderId || !status || !hash || !domain || !(await verifyHash(orderId, status, domain, hash))) return json({ success: false }, 400);

  const admin = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');
  const orderResult = await admin.from('provider_payment_orders').select('*').eq('order_id', orderId).maybeSingle();
  if (orderResult.error || !orderResult.data) return json({ success: false }, 404);
  if (orderResult.data.status === 'executed') return json({ success: true }, 200);

  const normalizedStatus = status === 'E' ? 'executed' : status === 'R' ? 'rejected' : status === 'C' ? 'canceled' : 'expired';
  const transactionId = url.searchParams.get('transactionId') ?? url.searchParams.get('confirmationNumber');
  if (normalizedStatus === 'executed') await fulfillOrder(admin, orderResult.data, transactionId);
  const update = await admin.from('provider_payment_orders').update({ status: normalizedStatus, transaction_id: transactionId }).eq('order_id', orderId);
  return json({ success: !update.error }, update.error ? 500 : 200);
}

async function fulfillOrder(admin: ReturnType<typeof createClient>, order: PaymentOrder, transactionId: string | null) {
  const payment = await admin.from('provider_payments').upsert({ provider_id: order.provider_id, plan_id: order.plan_id, promotion_id: order.promotion_id, concept: order.concept, amount: order.amount, status: 'confirmed', payment_method: 'yappy', external_reference: order.order_id, paid_at: new Date().toISOString(), metadata: { transactionId } }, { onConflict: 'external_reference', ignoreDuplicates: true });
  if (payment.error) throw payment.error;
  if (order.plan_id) {
    const planResult = await admin.from('platform_plans').select('billing_period').eq('id', order.plan_id).single();
    if (planResult.error) throw planResult.error;
    await admin.from('provider_subscriptions').update({ status: 'canceled', canceled_at: new Date().toISOString() }).eq('provider_id', order.provider_id).eq('status', 'active');
    const days = planResult.data.billing_period === 'yearly' ? 365 : planResult.data.billing_period === 'quarterly' ? 90 : 30;
    const start = new Date();
    const end = new Date(start.getTime() + days * 86400000);
    const subscription = await admin.from('provider_subscriptions').upsert({ provider_id: order.provider_id, plan_id: order.plan_id, status: 'active', billing_period: planResult.data.billing_period, current_period_start: start.toISOString(), current_period_end: end.toISOString(), next_billing_at: end.toISOString(), external_reference: order.order_id }, { onConflict: 'external_reference' });
    if (subscription.error) throw subscription.error;
  }
  if (order.promotion_id) {
    const promotion = await admin.from('platform_promotions').select('duration_days').eq('id', order.promotion_id).single();
    if (promotion.error) throw promotion.error;
    const start = new Date();
    const end = new Date(start.getTime() + Number(promotion.data.duration_days) * 86400000);
    const assignment = await admin.from('provider_promotions').upsert({ provider_id: order.provider_id, promotion_id: order.promotion_id, service_id: order.service_id, payment_order_id: order.id, status: 'active', starts_at: start.toISOString(), ends_at: end.toISOString() }, { onConflict: 'payment_order_id' });
    if (assignment.error) throw assignment.error;
  }
}

async function yappyRequest(path: string, body: Record<string, unknown>, token?: string) {
  const response = await fetch(`${apiBaseUrl()}${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: token } : {}) }, body: JSON.stringify(body) });
  const payload = await response.json();
  if (!response.ok || payload?.status?.code && payload.status.code !== '00') throw new Error(payload?.status?.description ?? 'Yappy rechazó la solicitud.');
  return payload;
}

async function verifyHash(orderId: string, status: string, domain: string, hash: string) {
  try {
    const decoded = new TextDecoder().decode(Uint8Array.from(atob(requiredSecret('YAPPY_SECRET_KEY')), (character) => character.charCodeAt(0)));
    const secret = decoded.split('.')[0];
    const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${orderId}${status}${domain}`));
    const expected = [...new Uint8Array(signature)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
    return expected === hash;
  } catch {
    return false;
  }
}

function requiredSecret(name: string) {
  const value = Deno.env.get(name);
  if (!value) throw new Error(`Falta el secreto ${name}.`);
  return value;
}

function asId(value: unknown) {
  return typeof value === 'string' && /^[0-9a-f-]{36}$/i.test(value) ? value : null;
}

function cleanPhone(value: unknown) {
  const phone = typeof value === 'string' ? value.replace(/\D/g, '') : '';
  return /^6\d{7}$/.test(phone) ? phone : '';
}

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
}
