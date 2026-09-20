import { useEffect, useState } from 'react';
import { BarChart3, BellRing, CalendarClock, CheckCircle2, CreditCard, FilePlus2, LayoutDashboard, Megaphone, Pencil, Plus, RefreshCw, Sparkles, UserRoundPlus, Users, WalletCards } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useAuth } from '../auth/useAuth';
import { AdminChart, type ChartType } from '../components/AdminChart';
import { AdminResourceDialog, type AdminEditor, type AdminEditorDraft } from '../components/AdminResourceDialog';
import { Button } from '../components/Button';
import { loadAdminData, saveAdminPlan, saveAdminPromotion, saveAdminUpdate, setAdminPlanActive, setAdminPromotionActive, type AdminData, type AdminMetrics } from '../lib/adminData';

type AdminSection = 'dashboard' | 'plans' | 'subscriptions' | 'promotions' | 'updates' | 'payments';
type PaymentPeriod = 'week' | 'month' | 'year';

const navigation: Array<{ id: AdminSection; label: string; icon: LucideIcon }> = [
  { id: 'dashboard', label: 'Resumen', icon: LayoutDashboard },
  { id: 'plans', label: 'Planes', icon: WalletCards },
  { id: 'subscriptions', label: 'Suscripciones', icon: RefreshCw },
  { id: 'promotions', label: 'Promociones', icon: Sparkles },
  { id: 'updates', label: 'Actualizaciones', icon: Megaphone },
  { id: 'payments', label: 'Pagos', icon: CreditCard },
];

export function AdminPanel() {
  const { isAdmin, profile, session } = useAuth();
  const [section, setSection] = useState<AdminSection>('dashboard');
  const [chartType, setChartType] = useState<ChartType>('bar');
  const [metric, setMetric] = useState<'users' | 'revenue'>('users');
  const [paymentPeriod, setPaymentPeriod] = useState<PaymentPeriod>('month');
  const [notice, setNotice] = useState('');
  const [adminData, setAdminData] = useState<AdminData | null>(null);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [dataError, setDataError] = useState('');
  const [editor, setEditor] = useState<AdminEditor | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const adminName = profile?.first_name || 'Administrador';

  useEffect(() => {
    if (!isAdmin) return;

    let isActive = true;
    void loadAdminData()
      .then((data) => {
        if (isActive) setAdminData(data);
      })
      .catch((error: unknown) => {
        if (isActive) setDataError(error instanceof Error ? error.message : 'No se pudieron cargar los datos administrativos.');
      })
      .finally(() => {
        if (isActive) setIsDataLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [isAdmin]);

  function showNotice(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(''), 2800);
  }

  async function saveEditor(draft: AdminEditorDraft) {
    setIsSaving(true);
    try {
      if (draft.type === 'plan') await saveAdminPlan(draft.value, draft.id);
      if (draft.type === 'promotion') await saveAdminPromotion(draft.value, draft.id);
      if (draft.type === 'update') await saveAdminUpdate(draft.value, draft.id);
      setEditor(null);
      setAdminData(await loadAdminData());
      showNotice('Cambios guardados en Supabase.');
    } catch (error: unknown) {
      showNotice(error instanceof Error ? error.message : 'No se pudieron guardar los cambios.');
    } finally {
      setIsSaving(false);
    }
  }

  async function changePlanStatus(id: string, isActive: boolean) {
    try {
      await setAdminPlanActive(id, isActive);
      setAdminData(await loadAdminData());
      showNotice(isActive ? 'Plan activado.' : 'Plan desactivado.');
    } catch (error: unknown) {
      showNotice(error instanceof Error ? error.message : 'No se pudo actualizar el plan.');
    }
  }

  async function changePromotionStatus(id: string, isActive: boolean) {
    try {
      await setAdminPromotionActive(id, isActive);
      setAdminData(await loadAdminData());
      showNotice(isActive ? 'Promoción activada.' : 'Promoción desactivada.');
    } catch (error: unknown) {
      showNotice(error instanceof Error ? error.message : 'No se pudo actualizar la promoción.');
    }
  }

  return (
    <section className="mx-auto min-h-[760px] w-[calc(100%-32px)] max-w-7xl py-6 sm:w-[calc(100%-48px)] sm:py-8">
      <header className="mb-7 flex min-w-0 items-end justify-between gap-5 max-md:flex-col max-md:items-start"><div className="min-w-0"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7b32ca]">Nex Digital · ConectaUTP</p><h1 className="mt-2 text-3xl font-bold max-sm:text-2xl">Panel administrativo</h1><p className="mt-2 text-sm text-[#676878]">Gestiona el crecimiento, los planes y las novedades de la plataforma.</p></div><div className="flex max-w-full min-w-0 items-center gap-3 rounded-xl border border-[#d9d2eb] bg-white px-4 py-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#eeeaff] text-[#7b32ca]"><Users aria-hidden="true" className="h-4 w-4" /></span><span className="min-w-0"><strong className="block truncate text-sm">{adminName}</strong><small className="block max-w-full truncate text-xs text-[#676878]">{session?.user.email}</small></span></div></header>
      <div className="grid min-w-0 gap-6 lg:grid-cols-[230px_minmax(0,1fr)]">
        <aside className="h-fit min-w-0 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm"><div className="mb-3 flex items-center gap-2 px-3 py-3 text-sm font-semibold"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#7b32ca] text-white"><BarChart3 aria-hidden="true" className="h-4 w-4" /></span>Administración</div><nav className="flex min-w-0 gap-1 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible" aria-label="Secciones administrativas">{navigation.map((item) => <button className={`flex shrink-0 cursor-pointer items-center gap-3 whitespace-nowrap rounded-lg px-3 py-3 text-left text-sm font-medium transition-colors ${section === item.id ? 'bg-[#f0edff] text-[#7b32ca]' : 'text-[#676878] hover:bg-[#faf8ff]'}`} type="button" key={item.id} onClick={() => setSection(item.id)}><item.icon aria-hidden="true" className="h-4 w-4" />{item.label}</button>)}</nav></aside>
        <main className="min-w-0">{notice && <p className="mb-4 flex items-center gap-2 rounded-lg bg-[#eaf8ee] p-3 text-sm text-[#268044]" role="status"><CheckCircle2 aria-hidden="true" className="h-4 w-4" />{notice}</p>}{isDataLoading && <p className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-[#676878]">Cargando datos administrativos...</p>}{dataError && <p className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">{dataError}</p>}{adminData && <>{section === 'dashboard' && <Dashboard metrics={adminData.metrics} profiles={adminData.profiles} payments={adminData.payments} chartType={chartType} metric={metric} onChartTypeChange={setChartType} onMetricChange={setMetric} />} {section === 'plans' && <PlansSection plans={adminData.plans} onCreate={() => setEditor({ type: 'plan' })} onEdit={(item) => setEditor({ type: 'plan', item })} onToggle={changePlanStatus} />} {section === 'subscriptions' && <SubscriptionsSection subscriptions={adminData.subscriptions} plans={adminData.plans} profiles={adminData.profiles} metrics={adminData.metrics} onExport={() => exportSubscriptionsReport(adminData.subscriptions, adminData.plans, adminData.profiles)} />} {section === 'promotions' && <PromotionsSection promotions={adminData.promotions} onCreate={() => setEditor({ type: 'promotion' })} onEdit={(item) => setEditor({ type: 'promotion', item })} onToggle={changePromotionStatus} />} {section === 'updates' && <UpdatesSection updates={adminData.updates} onCreate={() => setEditor({ type: 'update' })} onEdit={(item) => setEditor({ type: 'update', item })} />} {section === 'payments' && <PaymentsSection payments={adminData.payments} plans={adminData.plans} profiles={adminData.profiles} period={paymentPeriod} onPeriodChange={setPaymentPeriod} onAction={showNotice} />}</>}</main>
      </div>
      {editor && <AdminResourceDialog key={`${editor.type}-${editor.item?.id ?? 'new'}`} editor={editor} isSaving={isSaving} onClose={() => setEditor(null)} onSave={saveEditor} />}
    </section>
  );
}

function Dashboard({ metrics, profiles, payments, chartType, metric, onChartTypeChange, onMetricChange }: { metrics: AdminMetrics; profiles: AdminData['profiles']; payments: AdminData['payments']; chartType: ChartType; metric: 'users' | 'revenue'; onChartTypeChange: (type: ChartType) => void; onMetricChange: (metric: 'users' | 'revenue') => void }) {
  const chartData = getDashboardChartData(profiles, payments, metric);
  return <div className="space-y-6"><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><StatCard icon={Users} label="Usuarios registrados" value={String(metrics.registered_users)} trend="Datos reales" /><StatCard icon={UserRoundPlus} label="Proveedores activos" value={String(metrics.active_providers)} trend="Datos reales" /><StatCard icon={FilePlus2} label="Servicios publicados" value={String(metrics.published_services)} trend="Datos reales" /><StatCard icon={CreditCard} label="Ingresos del mes" value={`B/.${Number(metrics.monthly_revenue ?? 0).toFixed(2)}`} trend="Pagos confirmados" /></div><div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)]"><section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex flex-wrap items-start justify-between gap-4"><div><h2 className="font-semibold">Rendimiento del proyecto</h2><p className="mt-1 text-xs text-[#676878]">Datos conectados a Supabase · últimos 6 meses</p></div><div className="flex gap-2"><select className="h-9 rounded-md border border-slate-200 px-2 text-xs" value={metric} onChange={(event) => onMetricChange(event.target.value as 'users' | 'revenue')}><option value="users">Usuarios</option><option value="revenue">Ingresos</option></select><select className="h-9 rounded-md border border-slate-200 px-2 text-xs" value={chartType} onChange={(event) => onChartTypeChange(event.target.value as ChartType)}><option value="bar">Barras</option><option value="line">Línea</option><option value="donut">Circular</option></select></div></div><div className="mt-5"><AdminChart title={metric === 'users' ? 'Crecimiento de usuarios' : 'Ingresos confirmados'} subtitle={metric === 'users' ? 'Nuevos registros por mes' : 'Cobros confirmados por mes'} type={chartType} values={chartData.values} labels={chartData.labels} suffix={metric === 'users' ? '' : ' B/.'} showAxis={chartType === 'line'} /></div></section><section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><div><h2 className="font-semibold">Actividad reciente</h2><p className="mt-1 text-xs text-[#676878]">Eventos importantes</p></div><BellRing aria-hidden="true" className="h-5 w-5 text-[#7b32ca]" /></div><div className="mt-6 space-y-5"><Activity icon={Users} title={`${metrics.registered_users} usuarios registrados`} time="Datos cargados desde Supabase" /><Activity icon={FilePlus2} title={`${metrics.published_services} servicios publicados`} time="Estado publicado" /><Activity icon={CreditCard} title={`${metrics.monthly_revenue ? 'Pagos confirmados registrados' : 'Sin pagos confirmados este mes'}`} time="Periodo actual" /><Activity icon={CalendarClock} title={`${metrics.active_subscriptions} suscripciones activas`} time="Estado actual" /></div></section></div></div>;
}

function PlansSection({ plans, onCreate, onEdit, onToggle }: { plans: AdminData['plans']; onCreate: () => void; onEdit: (plan: AdminData['plans'][number]) => void; onToggle: (id: string, isActive: boolean) => Promise<void> }) {
  return <AdminSectionShell icon={WalletCards} title="Planes" description="Administra los planes disponibles para los proveedores." action="Añadir plan" onAction={onCreate}><div className="overflow-x-auto rounded-xl border border-slate-200"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-[#faf8ff] text-xs uppercase tracking-wide text-[#676878]"><tr><th className="px-4 py-3">Plan</th><th className="px-4 py-3">Precio</th><th className="px-4 py-3">Periodo</th><th className="px-4 py-3">Estado</th><th className="px-4 py-3 text-right">Acción</th></tr></thead><tbody>{plans.map((plan) => <tr className="border-t border-slate-100" key={plan.id}><td className="px-4 py-4"><div className="flex flex-wrap items-center gap-2"><strong>{plan.name}</strong>{plan.is_most_used && <Status label="Más usado" tone="blue" />}</div><span className="text-xs text-[#676878]">{plan.description}</span></td><td className="px-4 py-4 font-semibold text-[#7b32ca]">B/.{Number(plan.price).toFixed(2)}</td><td className="px-4 py-4 text-[#676878]">{formatBillingPeriod(plan.billing_period)}</td><td className="px-4 py-4"><Status label={plan.is_active ? 'Activo' : 'Inactivo'} tone={plan.is_active ? 'green' : 'gray'} /></td><td className="px-4 py-4 text-right"><div className="flex justify-end gap-3"><button className="inline-flex items-center gap-1 text-xs font-semibold text-[#7b32ca]" type="button" onClick={() => onEdit(plan)}><Pencil aria-hidden="true" className="h-3.5 w-3.5" />Editar</button><button className="text-xs font-semibold text-[#676878]" type="button" onClick={() => void onToggle(plan.id, !plan.is_active)}>{plan.is_active ? 'Desactivar' : 'Activar'}</button></div></td></tr>)}</tbody></table></div></AdminSectionShell>;
}

function PromotionsSection({ promotions, onCreate, onEdit, onToggle }: { promotions: AdminData['promotions']; onCreate: () => void; onEdit: (promotion: AdminData['promotions'][number]) => void; onToggle: (id: string, isActive: boolean) => Promise<void> }) {
  return <AdminSectionShell icon={Sparkles} title="Promociones" description="Crea campañas con precio, beneficio y fechas específicas." action="Nueva promoción" onAction={onCreate}><div className="grid gap-4 md:grid-cols-3">{promotions.map((promotion) => <article className="rounded-xl border border-slate-200 bg-white p-5" key={promotion.id}><div className="flex items-start justify-between gap-3"><span className="rounded-full bg-[#f0edff] px-2.5 py-1 text-[11px] font-semibold text-[#7b32ca]">{promotion.duration_days} días</span><Status label={promotion.is_active ? 'Activa' : 'Inactiva'} tone={promotion.is_active ? 'green' : 'gray'} /></div><h3 className="mt-5 font-semibold">{promotion.name}</h3><p className="mt-2 text-sm text-[#676878]">{promotion.description}</p><p className="mt-3 rounded-lg bg-[#faf8ff] p-3 text-sm font-medium text-[#5420a8]">{promotion.benefit_key === 'max_published_services' ? `${promotion.benefit_operation === 'add' ? 'Agrega' : 'Define'} ${promotion.benefit_value} servicio${promotion.benefit_value === 1 ? '' : 's'} publicado${promotion.benefit_value === 1 ? '' : 's'}` : `Destaca ${promotion.benefit_value} servicio${promotion.benefit_value === 1 ? '' : 's'}`}</p><p className="mt-5 text-2xl font-bold text-[#5420a8]">B/.{Number(promotion.price).toFixed(2)}</p><div className="mt-5 border-t border-slate-100 pt-4 text-xs text-[#676878]"><p>Inicio: {formatDate(promotion.starts_at)}</p><p className="mt-1">Finaliza: {formatDate(promotion.ends_at)}</p></div><div className="mt-5 flex gap-3"><button className="inline-flex items-center gap-1 text-xs font-semibold text-[#7b32ca]" type="button" onClick={() => onEdit(promotion)}><Pencil aria-hidden="true" className="h-3.5 w-3.5" />Editar</button><button className="text-xs font-semibold text-[#676878]" type="button" onClick={() => void onToggle(promotion.id, !promotion.is_active)}>{promotion.is_active ? 'Desactivar' : 'Activar'}</button></div></article>)}</div></AdminSectionShell>;
}

function SubscriptionsSection({ subscriptions, plans, profiles, metrics, onExport }: { subscriptions: AdminData['subscriptions']; plans: AdminData['plans']; profiles: AdminData['profiles']; metrics: AdminMetrics; onExport: () => void }) {
  const activeSubscriptions = subscriptions.filter((subscription) => subscription.status === 'active');
  const monthlyRecurring = activeSubscriptions.reduce((total, subscription) => {
    const plan = plans.find((item) => item.id === subscription.plan_id);
    if (!plan) return total;
    const divisor = subscription.billing_period === 'yearly' ? 12 : subscription.billing_period === 'quarterly' ? 3 : 1;
    return total + Number(plan.price) / divisor;
  }, 0);
  const currentMonth = new Date().getMonth();
  const renewalsThisMonth = activeSubscriptions.filter((subscription) => subscription.next_billing_at && new Date(subscription.next_billing_at).getMonth() === currentMonth).length;
  const frequencyCounts = ['monthly', 'quarterly', 'yearly'].map((frequency) => ({ frequency, count: activeSubscriptions.filter((subscription) => subscription.billing_period === frequency).length }));
  const totalFrequencyCount = Math.max(activeSubscriptions.length, 1);

  return <AdminSectionShell icon={RefreshCw} title="Suscripciones" description="Analiza la recurrencia, renovaciones y permanencia de los proveedores." action="Exportar reporte" onAction={onExport}><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><StatCard icon={Users} label="Suscripciones activas" value={String(metrics.active_subscriptions)} trend="Datos reales" /><StatCard icon={CreditCard} label="Ingreso recurrente estimado" value={`B/.${monthlyRecurring.toFixed(2)}`} trend="Calculado por plan" /><StatCard icon={CalendarClock} label="Renovaciones este mes" value={String(renewalsThisMonth)} trend="Periodo actual" /><StatCard icon={RefreshCw} label="Retención mensual" value="N/D" trend="Requiere histórico" /></div><div className="mt-6 grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.9fr)]"><section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"><h3 className="font-semibold">Próximas renovaciones</h3><p className="mt-1 text-xs text-[#676878]">Personas suscritas y fecha del próximo cobro</p><div className="mt-5 max-w-full overflow-x-auto overscroll-x-contain rounded-xl border border-slate-200"><table className="w-full min-w-[650px] text-left text-sm"><thead className="bg-[#faf8ff] text-xs uppercase tracking-wide text-[#676878]"><tr><th className="px-4 py-3">Proveedor</th><th className="px-4 py-3">Plan</th><th className="px-4 py-3">Frecuencia</th><th className="px-4 py-3">Renovación</th></tr></thead><tbody>{activeSubscriptions.length === 0 ? <tr><td className="px-4 py-6 text-[#676878]" colSpan={4}>No hay suscripciones activas registradas.</td></tr> : activeSubscriptions.map((subscription) => <tr className="border-t border-slate-100" key={subscription.id}><td className="px-4 py-4 font-medium">{getProviderName(subscription.provider_id, profiles)}</td><td className="px-4 py-4 text-[#676878]">{getPlanName(subscription.plan_id, plans)}</td><td className="px-4 py-4 text-[#676878]">{formatBillingPeriod(subscription.billing_period)}</td><td className="px-4 py-4 font-semibold text-[#7b32ca]">{subscription.next_billing_at ? formatDate(subscription.next_billing_at) : 'No definida'}</td></tr>)}</tbody></table></div></section><section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"><h3 className="font-semibold">Distribución por frecuencia</h3><p className="mt-1 text-xs text-[#676878]">Cómo se generan las nuevas suscripciones</p><div className="mt-6 space-y-5">{frequencyCounts.map(({ frequency, count }) => <SubscriptionBar key={frequency} label={formatBillingPeriod(frequency)} value={`${count} suscripciones`} percentage={Math.round((count / totalFrequencyCount) * 100)} />)}</div></section></div></AdminSectionShell>;
}

function SubscriptionBar({ label, value, percentage }: { label: string; value: string; percentage: number }) {
  return <div><div className="flex items-center justify-between text-sm"><span className="font-medium">{label}</span><span className="text-xs text-[#676878]">{value}</span></div><div className="mt-2 h-2 rounded-full bg-[#eeeaff]"><div className="h-2 rounded-full bg-[#7b32ca]" style={{ width: `${percentage}%` }} /></div></div>;
}

function exportSubscriptionsReport(subscriptions: AdminData['subscriptions'], plans: AdminData['plans'], profiles: AdminData['profiles']) {
  const rows = [
    ['Proveedor', 'Plan', 'Estado', 'Frecuencia', 'Próxima renovación'],
    ...subscriptions.map((subscription) => [
      getProviderName(subscription.provider_id, profiles),
      getPlanName(subscription.plan_id, plans),
      subscription.status,
      formatBillingPeriod(subscription.billing_period),
      subscription.next_billing_at ? formatDate(subscription.next_billing_at) : 'No definida',
    ]),
  ];
  const csv = rows.map((row) => row.map((value) => `"${value.replaceAll('"', '""')}"`).join(',')).join('\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'suscripciones-conectautp.csv';
  link.click();
  URL.revokeObjectURL(url);
}

function getDashboardChartData(profiles: AdminData['profiles'], payments: AdminData['payments'], metric: 'users' | 'revenue') {
  const months = Array.from({ length: 6 }, (_, index) => {
    const date = new Date();
    date.setDate(1);
    date.setMonth(date.getMonth() - (5 - index));
    return date;
  });
  const labels = months.map((date) => new Intl.DateTimeFormat('es-PA', { month: 'short' }).format(date).replace('.', ''));
  const values = months.map((month) => {
    if (metric === 'users') {
      return profiles.filter((profile) => isSameMonth(profile.created_at, month)).length;
    }
    return payments.reduce((total, payment) => isSameMonth(payment.paid_at, month) ? total + Number(payment.amount) : total, 0);
  });
  return { labels, values };
}

function isSameMonth(value: string, month: Date) {
  const date = new Date(value);
  return date.getFullYear() === month.getFullYear() && date.getMonth() === month.getMonth();
}

function UpdatesSection({ updates, onCreate, onEdit }: { updates: AdminData['updates']; onCreate: () => void; onEdit: (update: AdminData['updates'][number]) => void }) {
  return <AdminSectionShell icon={Megaphone} title="Actualizaciones" description="Publica novedades para toda la comunidad UTP." action="Nueva actualización" onAction={onCreate}><div className="min-w-0 space-y-3">{updates.map((update) => <article className="flex min-w-0 items-start justify-between gap-4 overflow-hidden rounded-xl border border-slate-200 bg-white p-4 max-sm:flex-col" key={update.id}><div className="flex min-w-0 max-w-full flex-1 items-start gap-3"><span className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#f0edff] text-[#7b32ca]"><Megaphone aria-hidden="true" className="h-4 w-4" /></span><div className="min-w-0 flex-1"><h3 className="break-words font-semibold">{update.title}</h3><p className="mt-1 break-words whitespace-normal text-sm leading-5 text-[#676878]">{update.summary}</p><p className="mt-2 break-words text-xs text-[#676878]">{update.published_at ? formatDate(update.published_at) : 'Próximamente'} · {update.category}</p></div></div><div className="flex max-w-full shrink-0 items-center gap-3 max-sm:w-full max-sm:flex-wrap"><Status label={formatUpdateStatus(update.status)} tone={update.status === 'published' ? 'green' : update.status === 'scheduled' ? 'blue' : 'gray'} /><button className="inline-flex items-center gap-1 text-xs font-semibold text-[#7b32ca]" type="button" onClick={() => onEdit(update)}><Pencil aria-hidden="true" className="h-3.5 w-3.5" />Editar</button></div></article>)}</div></AdminSectionShell>;
}

function PaymentsSection({ payments, plans, profiles, period, onPeriodChange, onAction }: { payments: AdminData['payments']; plans: AdminData['plans']; profiles: AdminData['profiles']; period: PaymentPeriod; onPeriodChange: (period: PaymentPeriod) => void; onAction: (message: string) => void }) {
  const data = getPaymentChartData(payments, period);
  return <AdminSectionShell icon={CreditCard} title="Pagos" description="Consulta únicamente las transacciones confirmadas de Nex Digital." action="Configurar Yappy" onAction={() => onAction('Yappy Comercial requiere credenciales y acceso a su API oficial; Supabase almacenará los pagos confirmados cuando esa integración esté habilitada.')}><div className="mb-5 rounded-xl border border-[#d9d2eb] bg-[#f8f5ff] p-4 text-sm text-[#6040b5]">{payments.length === 0 ? 'Todavía no hay pagos confirmados registrados.' : 'Los pagos mostrados provienen de Supabase y están confirmados.'}</div><section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"><div className="flex flex-wrap items-start justify-between gap-4"><div><h3 className="font-semibold">Estadísticas de pagos</h3><p className="mt-1 text-xs text-[#676878]">{data.subtitle}</p></div><select aria-label="Periodo de pagos" className="h-9 rounded-md border border-slate-200 px-3 text-xs" value={period} onChange={(event) => onPeriodChange(event.target.value as PaymentPeriod)}><option value="week">Esta semana</option><option value="month">Este mes</option><option value="year">Este año</option></select></div><div className="mt-5"><AdminChart title="Pagos confirmados" subtitle="Cantidad de pagos por periodo" type="bar" values={data.values} labels={data.labels} suffix="" showAxis /></div></section><div className="mt-6 overflow-x-auto rounded-xl border border-slate-200"><table className="w-full min-w-[650px] text-left text-sm"><thead className="bg-[#faf8ff] text-xs uppercase tracking-wide text-[#676878]"><tr><th className="px-4 py-3">Proveedor</th><th className="px-4 py-3">Concepto</th><th className="px-4 py-3">Monto</th><th className="px-4 py-3">Estado</th><th className="px-4 py-3">Fecha</th></tr></thead><tbody>{payments.length === 0 ? <tr><td className="px-4 py-6 text-[#676878]" colSpan={5}>No hay pagos confirmados para mostrar.</td></tr> : payments.map((payment) => <tr className="border-t border-slate-100" key={payment.id}><td className="px-4 py-4 font-medium">{getProviderName(payment.provider_id, profiles)}</td><td className="px-4 py-4 text-[#676878]">{payment.concept}{payment.plan_id ? ` · ${getPlanName(payment.plan_id, plans)}` : ''}</td><td className="px-4 py-4 font-semibold text-[#7b32ca]">B/.{Number(payment.amount).toFixed(2)}</td><td className="px-4 py-4"><Status label="Confirmado" tone="green" /></td><td className="px-4 py-4 text-xs text-[#676878]">{formatDate(payment.paid_at)}</td></tr>)}</tbody></table></div></AdminSectionShell>;
}

function getPaymentChartData(payments: AdminData['payments'], period: PaymentPeriod) {
  if (period === 'week') {
    const labels = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    const values = Array.from({ length: labels.length }, () => 0);
    const today = new Date();
    const mondayOffset = (today.getDay() + 6) % 7;
    const monday = new Date(today);
    monday.setDate(today.getDate() - mondayOffset);
    monday.setHours(0, 0, 0, 0);
    payments.forEach((payment) => {
      const date = new Date(payment.paid_at);
      date.setHours(0, 0, 0, 0);
      const index = Math.round((date.getTime() - monday.getTime()) / 86400000);
      if (index >= 0 && index < values.length) values[index] += 1;
    });
    return { labels, values, subtitle: 'Pagos confirmados durante esta semana' };
  }

  if (period === 'month') {
    const labels = ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4', 'Sem 5'];
    const values = Array.from({ length: labels.length }, () => 0);
    const now = new Date();
    payments.forEach((payment) => {
      const date = new Date(payment.paid_at);
      if (date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth()) values[Math.min(Math.floor((date.getDate() - 1) / 7), 4)] += 1;
    });
    return { labels, values, subtitle: 'Pagos confirmados durante este mes' };
  }

  const labels = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const values = Array.from({ length: labels.length }, () => 0);
  const currentYear = new Date().getFullYear();
  payments.forEach((payment) => {
    const date = new Date(payment.paid_at);
    if (date.getFullYear() === currentYear) values[date.getMonth()] += 1;
  });
  return { labels, values, subtitle: 'Pagos confirmados durante este año' };
}

function getProviderName(providerId: string, profiles: AdminData['profiles']) {
  const profile = profiles.find((item) => item.id === providerId);
  const name = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ').trim();
  return name || `Proveedor ${providerId.slice(0, 8)}`;
}

function getPlanName(planId: string, plans: AdminData['plans']) {
  return plans.find((plan) => plan.id === planId)?.name || 'Plan eliminado';
}

function formatBillingPeriod(period: string) {
  return { free: 'Siempre', monthly: 'Mensual', quarterly: 'Trimestral', yearly: 'Anual' }[period] || period;
}

function formatUpdateStatus(status: string) {
  return { draft: 'Borrador', scheduled: 'Programada', published: 'Publicado', archived: 'Archivada' }[status] || status;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('es-PA', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value));
}

function AdminSectionShell({ icon: Icon, title, description, action, onAction, children }: { icon: LucideIcon; title: string; description: string; action: string; onAction: () => void; children: React.ReactNode }) {
  return <section className="min-w-0"><div className="mb-5 flex items-end justify-between gap-4 max-sm:items-start max-sm:flex-col"><div className="min-w-0"><h2 className="flex items-center gap-2 break-words text-2xl font-semibold"><Icon aria-hidden="true" className="h-5 w-5 shrink-0 text-[#7b32ca]" />{title}</h2><p className="mt-1 break-words text-sm text-[#676878]">{description}</p></div><Button className="max-sm:w-full" onClick={onAction}><Plus aria-hidden="true" className="mr-2 inline h-4 w-4" />{action}</Button></div>{children}</section>;
}

function StatCard({ icon: Icon, label, value, trend }: { icon: LucideIcon; label: string; value: string; trend: string }) {
  return <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f0edff] text-[#7b32ca]"><Icon aria-hidden="true" className="h-4 w-4" /></span><span className="text-xs font-semibold text-[#268044]">{trend}</span></div><p className="mt-5 text-xs text-[#676878]">{label}</p><strong className="mt-1 block text-2xl">{value}</strong></article>;
}

function Activity({ icon: Icon, title, time }: { icon: LucideIcon; title: string; time: string }) {
  return <div className="flex items-start gap-3"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#f0edff] text-[#7b32ca]"><Icon aria-hidden="true" className="h-4 w-4" /></span><div><p className="text-sm font-medium">{title}</p><p className="mt-1 text-xs text-[#676878]">{time}</p></div></div>;
}

function Status({ label, tone }: { label: string; tone: 'green' | 'blue' | 'gray' | 'yellow' }) {
  const classes = { green: 'bg-[#eaf8ee] text-[#268044]', blue: 'bg-[#eaf2ff] text-[#315de5]', gray: 'bg-[#f0f1f5] text-[#676878]', yellow: 'bg-[#fff7df] text-[#735d22]' };
  return <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${classes[tone]}`}>{label}</span>;
}
