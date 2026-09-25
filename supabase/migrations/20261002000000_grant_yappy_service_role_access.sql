-- Permite que la Edge Function cree y confirme ordenes de Yappy sin exponer estas tablas al navegador.
grant select on public.platform_plans to service_role;
grant select on public.platform_promotions to service_role;
grant select on public.services to service_role;

grant select, insert, update on public.provider_payment_orders to service_role;
grant select, insert, update on public.provider_payments to service_role;
grant select, insert, update on public.provider_subscriptions to service_role;
grant select, insert, update on public.provider_promotions to service_role;
