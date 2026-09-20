import { useState, type FormEvent } from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';
import { defaultPlanEntitlements, type AdminPlan, type AdminPlanInput, type AdminPromotion, type AdminPromotionInput, type AdminUpdate, type AdminUpdateInput, type PlanEntitlements } from '../lib/adminData';

export type AdminEditor =
  | { type: 'plan'; item?: AdminPlan }
  | { type: 'promotion'; item?: AdminPromotion }
  | { type: 'update'; item?: AdminUpdate };

export type AdminEditorDraft =
  | { type: 'plan'; id?: string; value: AdminPlanInput }
  | { type: 'promotion'; id?: string; value: AdminPromotionInput }
  | { type: 'update'; id?: string; value: AdminUpdateInput };

interface AdminResourceDialogProps {
  editor: AdminEditor;
  isSaving: boolean;
  onClose: () => void;
  onSave: (draft: AdminEditorDraft) => Promise<void>;
}

export function AdminResourceDialog({ editor, isSaving, onClose, onSave }: AdminResourceDialogProps) {
  if (editor.type === 'plan') return <PlanDialog item={editor.item} isSaving={isSaving} onClose={onClose} onSave={onSave} />;
  if (editor.type === 'promotion') return <PromotionDialog item={editor.item} isSaving={isSaving} onClose={onClose} onSave={onSave} />;
  return <UpdateDialog item={editor.item} isSaving={isSaving} onClose={onClose} onSave={onSave} />;
}

function DialogShell({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><div aria-modal="true" className="max-h-[min(90vh,760px)] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[#d9d2eb] bg-white p-5 shadow-2xl sm:p-7" role="dialog" aria-label={title}><div className="flex items-start justify-between gap-4"><h2 className="text-xl font-semibold text-[#141414]">{title}</h2><button aria-label="Cerrar" className="rounded-lg p-2 text-[#676878] hover:bg-[#f0edff] hover:text-[#5420a8]" type="button" onClick={onClose}><X aria-hidden="true" className="h-5 w-5" /></button></div>{children}</div></div>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block text-sm font-medium text-[#141414]">{label}{children}</label>;
}

function Input({ className = '', ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`mt-2 h-11 w-full rounded-lg border border-slate-200 px-3 text-sm text-[#141414] ${className}`} {...props} />;
}

function Textarea({ className = '', ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={`mt-2 w-full resize-y rounded-lg border border-slate-200 p-3 text-sm text-[#141414] ${className}`} {...props} />;
}

function FormActions({ isSaving, onClose }: { isSaving: boolean; onClose: () => void }) {
  return <div className="mt-6 flex flex-col-reverse justify-end gap-3 sm:flex-row"><Button variant="secondary" onClick={onClose}>Cancelar</Button><Button disabled={isSaving} type="submit">{isSaving ? 'Guardando...' : 'Guardar en Supabase'}</Button></div>;
}

function PlanDialog({ item, isSaving, onClose, onSave }: { item?: AdminPlan; isSaving: boolean; onClose: () => void; onSave: (draft: AdminEditorDraft) => Promise<void> }) {
  const [form, setForm] = useState<AdminPlanInput>(() => item ? { slug: item.slug, name: item.name, description: item.description, price: Number(item.price), billing_period: item.billing_period, features: item.features, entitlements: { ...defaultPlanEntitlements, ...item.entitlements }, is_active: item.is_active, is_most_used: item.is_most_used, display_order: item.display_order } : { slug: '', name: '', description: '', price: 0, billing_period: 'monthly', features: [], entitlements: { ...defaultPlanEntitlements }, is_active: true, is_most_used: false, display_order: 0 });
  function updateEntitlement<Key extends keyof PlanEntitlements>(key: Key, value: PlanEntitlements[Key]) {
    setForm((current) => ({ ...current, entitlements: { ...current.entitlements, [key]: value } }));
  }
  function submit(event: FormEvent) {
    event.preventDefault();
    void onSave({ type: 'plan', id: item?.id, value: form });
  }
  return <DialogShell title={item ? 'Editar plan' : 'Añadir plan'} onClose={onClose}><form className="mt-6 space-y-4" onSubmit={submit}><div className="grid gap-4 sm:grid-cols-2"><Field label="Nombre"><Input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></Field><Field label="Slug"><Input required pattern="[a-z0-9-]+" value={form.slug} onChange={(event) => setForm({ ...form, slug: event.target.value })} /></Field></div><Field label="Descripción"><Textarea required minLength={10} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></Field><div className="grid gap-4 sm:grid-cols-3"><Field label="Precio en B/."><Input required min="0" step="0.01" type="number" inputMode="decimal" value={form.price} onChange={(event) => setForm({ ...form, price: Number(event.target.value) })} /><span className="mt-1 block text-xs text-[#676878]">Acepta decimales, por ejemplo 1.99.</span></Field><Field label="Periodo"><select className="mt-2 h-11 w-full rounded-lg border border-slate-200 px-3 text-sm" value={form.billing_period} onChange={(event) => setForm({ ...form, billing_period: event.target.value as AdminPlanInput['billing_period'] })}><option value="free">Gratis</option><option value="monthly">Mensual</option><option value="quarterly">Trimestral</option><option value="yearly">Anual</option></select></Field><Field label="Orden"><Input required min="0" step="1" type="number" value={form.display_order} onChange={(event) => setForm({ ...form, display_order: Number(event.target.value) })} /></Field></div><div className="rounded-xl border border-slate-200 bg-slate-50 p-4"><h3 className="font-semibold text-[#141414]">Funciones del plan</h3><p className="mt-1 text-xs text-[#676878]">Estos valores sí se aplican al publicar o activar un servicio.</p><div className="mt-4 grid gap-4 sm:grid-cols-3"><Field label="Publicaciones permitidas"><Input required min="0" step="1" type="number" inputMode="numeric" value={form.entitlements.max_published_services} onChange={(event) => updateEntitlement('max_published_services', Math.max(0, Number(event.target.value)))} /><span className="mt-1 block text-xs text-[#676878]">Solo números enteros.</span></Field><Field label="Destacadas al mes"><Input required min="0" step="1" type="number" inputMode="numeric" value={form.entitlements.monthly_featured_services} onChange={(event) => updateEntitlement('monthly_featured_services', Math.max(0, Number(event.target.value)))} /></Field><Field label="Días por destacada"><Input required min="0" step="1" type="number" inputMode="numeric" value={form.entitlements.featured_duration_days} onChange={(event) => updateEntitlement('featured_duration_days', Math.max(0, Number(event.target.value)))} /></Field></div><div className="mt-4 grid gap-3 sm:grid-cols-2"><label className="flex items-center gap-2 text-sm font-medium"><input checked={form.entitlements.public_profile} type="checkbox" onChange={(event) => updateEntitlement('public_profile', event.target.checked)} />Perfil público</label><label className="flex items-center gap-2 text-sm font-medium"><input checked={form.entitlements.contact_clients} type="checkbox" onChange={(event) => updateEntitlement('contact_clients', event.target.checked)} />Contacto con clientes</label><label className="flex items-center gap-2 text-sm font-medium"><input checked={form.entitlements.priority_results} type="checkbox" onChange={(event) => updateEntitlement('priority_results', event.target.checked)} />Prioridad en resultados</label><label className="flex items-center gap-2 text-sm font-medium"><input checked={form.entitlements.profile_boost} type="checkbox" onChange={(event) => updateEntitlement('profile_boost', event.target.checked)} />Mayor visibilidad del perfil</label></div></div><div className="space-y-3"><label className="flex items-center gap-2 text-sm font-medium"><input checked={form.is_active} type="checkbox" onChange={(event) => setForm({ ...form, is_active: event.target.checked })} />Plan visible públicamente</label><label className="flex items-center gap-2 text-sm font-medium"><input checked={form.is_most_used} type="checkbox" onChange={(event) => setForm({ ...form, is_most_used: event.target.checked })} />Marcar como “Más usado”</label></div><FormActions isSaving={isSaving} onClose={onClose} /></form></DialogShell>;
}

function PromotionDialog({ item, isSaving, onClose, onSave }: { item?: AdminPromotion; isSaving: boolean; onClose: () => void; onSave: (draft: AdminEditorDraft) => Promise<void> }) {
  const [form, setForm] = useState<AdminPromotionInput>(() => item ? { slug: item.slug, name: item.name, description: item.description, duration_days: item.duration_days, price: Number(item.price), starts_at: item.starts_at, ends_at: item.ends_at, is_active: item.is_active, benefit_key: item.benefit_key, benefit_operation: item.benefit_operation, benefit_value: Number(item.benefit_value) } : { slug: '', name: '', description: '', duration_days: 7, price: 0, starts_at: new Date().toISOString(), ends_at: new Date(Date.now() + 7 * 86400000).toISOString(), is_active: true, benefit_key: 'featured_service', benefit_operation: 'add', benefit_value: 1 });
  const toInputDate = (value: string) => value.slice(0, 16);
  const toIsoDate = (value: string) => new Date(value).toISOString();
  function submit(event: FormEvent) {
    event.preventDefault();
    void onSave({ type: 'promotion', id: item?.id, value: form });
  }
  return <DialogShell title={item ? 'Editar promoción' : 'Nueva promoción'} onClose={onClose}><form className="mt-6 space-y-4" onSubmit={submit}><div className="grid gap-4 sm:grid-cols-2"><Field label="Nombre"><Input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></Field><Field label="Slug"><Input required pattern="[a-z0-9-]+" value={form.slug} onChange={(event) => setForm({ ...form, slug: event.target.value })} /></Field></div><Field label="Descripción"><Textarea required minLength={10} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></Field><div className="rounded-xl border border-slate-200 bg-slate-50 p-4"><h3 className="font-semibold text-[#141414]">Beneficio funcional</h3><p className="mt-1 text-xs text-[#676878]">El beneficio se aplicará cuando la promoción se asigne a un proveedor.</p><div className="mt-4 grid gap-4 sm:grid-cols-3"><Field label="Beneficio"><select className="mt-2 h-11 w-full rounded-lg border border-slate-200 px-3 text-sm" value={form.benefit_key} onChange={(event) => { const benefitKey = event.target.value as AdminPromotionInput['benefit_key']; setForm({ ...form, benefit_key: benefitKey, benefit_operation: benefitKey === 'featured_service' ? 'add' : form.benefit_operation }); }}><option value="featured_service">Servicio destacado</option><option value="max_published_services">Servicios publicados adicionales</option></select></Field><Field label="Operación"><select className="mt-2 h-11 w-full rounded-lg border border-slate-200 px-3 text-sm" value={form.benefit_operation} disabled={form.benefit_key === 'featured_service'} onChange={(event) => setForm({ ...form, benefit_operation: event.target.value as AdminPromotionInput['benefit_operation'] })}><option value="add">Agregar</option><option value="override">Reemplazar</option></select></Field><Field label="Cantidad"><Input required min="1" step="1" type="number" value={form.benefit_value} onChange={(event) => setForm({ ...form, benefit_value: Math.max(1, Number(event.target.value)) })} /></Field></div></div><div className="grid gap-4 sm:grid-cols-3"><Field label="Precio"><Input required min="0" step="0.01" type="number" value={form.price} onChange={(event) => setForm({ ...form, price: Number(event.target.value) })} /></Field><Field label="Días"><Input required min="1" step="1" type="number" value={form.duration_days} onChange={(event) => setForm({ ...form, duration_days: Number(event.target.value) })} /></Field><label className="flex items-end gap-2 pb-3 text-sm font-medium"><input checked={form.is_active} type="checkbox" onChange={(event) => setForm({ ...form, is_active: event.target.checked })} />Activa</label></div><div className="grid gap-4 sm:grid-cols-2"><Field label="Inicio"><Input required type="datetime-local" value={toInputDate(form.starts_at)} onChange={(event) => setForm({ ...form, starts_at: toIsoDate(event.target.value) })} /></Field><Field label="Finaliza"><Input required type="datetime-local" value={toInputDate(form.ends_at)} onChange={(event) => setForm({ ...form, ends_at: toIsoDate(event.target.value) })} /></Field></div><FormActions isSaving={isSaving} onClose={onClose} /></form></DialogShell>;
}

function UpdateDialog({ item, isSaving, onClose, onSave }: { item?: AdminUpdate; isSaving: boolean; onClose: () => void; onSave: (draft: AdminEditorDraft) => Promise<void> }) {
  const [form, setForm] = useState<AdminUpdateInput>(() => item ? { slug: item.slug, title: item.title, summary: item.summary, content: item.content, category: item.category, status: item.status, published_at: item.published_at, } : { slug: '', title: '', summary: '', content: '', category: 'Producto', status: 'draft', published_at: null });
  const toInputDate = (value: string | null) => value ? value.slice(0, 16) : '';
  const toIsoDate = (value: string) => value ? new Date(value).toISOString() : null;
  function submit(event: FormEvent) {
    event.preventDefault();
    void onSave({ type: 'update', id: item?.id, value: form });
  }
  return <DialogShell title={item ? 'Editar actualización' : 'Nueva actualización'} onClose={onClose}><form className="mt-6 space-y-4" onSubmit={submit}><div className="grid gap-4 sm:grid-cols-2"><Field label="Título"><Input required minLength={3} maxLength={160} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></Field><Field label="Slug"><Input required pattern="[a-z0-9-]+" value={form.slug} onChange={(event) => setForm({ ...form, slug: event.target.value })} /></Field></div><Field label="Resumen"><Textarea required minLength={10} maxLength={500} value={form.summary} onChange={(event) => setForm({ ...form, summary: event.target.value })} /></Field><Field label="Descripción completa"><Textarea className="min-h-40" value={form.content ?? ''} onChange={(event) => setForm({ ...form, content: event.target.value })} /></Field><div className="grid gap-4 sm:grid-cols-2"><Field label="Categoría"><Input required value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} /></Field><Field label="Estado"><select className="mt-2 h-11 w-full rounded-lg border border-slate-200 px-3 text-sm" value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as AdminUpdateInput['status'] })}><option value="draft">Borrador</option><option value="scheduled">Programada</option><option value="published">Publicada</option><option value="archived">Archivada</option></select></Field></div><Field label="Fecha de publicación"><Input type="datetime-local" value={toInputDate(form.published_at)} onChange={(event) => setForm({ ...form, published_at: toIsoDate(event.target.value) })} /></Field><FormActions isSaving={isSaving} onClose={onClose} /></form></DialogShell>;
}
