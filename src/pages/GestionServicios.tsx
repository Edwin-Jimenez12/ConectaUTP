import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { ArrowRight, RefreshCw } from 'lucide-react';
import { useAuth } from '../auth/useAuth';
import { Button } from '../components/Button';
import { ImageEditor } from '../components/ImageEditor';
import { activatePlanFeaturedService, deleteService, getPlanFeaturedStatus, getServiceImages, listOwnerPlanFeaturedServices, listOwnerServices } from '../lib/services';
import { replaceServiceImage, uploadServiceImages } from '../lib/imageUpload';
import { supabase } from '../lib/supabase';
import type { DatabaseService, ServiceImage, ServiceStatus } from '../types/service';
import type { PlanFeaturedStatus } from '../lib/services';

interface EditForm {
  title: string;
  description: string;
  price: string;
}

interface EditableImage extends ServiceImage {
  previewUrl: string;
  pendingFile?: File;
}

interface PendingServiceImage {
  file: File;
  previewUrl: string;
}

async function fetchOwnerServices(ownerId: string) {
  return listOwnerServices(ownerId);
}

async function fetchOwnerDashboard(ownerId: string) {
  const [serviceResult, featuredResult] = await Promise.all([
    fetchOwnerServices(ownerId),
    listOwnerPlanFeaturedServices(ownerId),
  ]);
  return { serviceResult, featuredResult };
}

async function fetchPlanFeaturedStatus() {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      getPlanFeaturedStatus(),
      new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error('La consulta de destacadas tardó demasiado. Revisa tu conexión e inténtalo otra vez.')), 15000);
      }),
    ]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}

function toEditForm(service: DatabaseService): EditForm {
  return { title: service.title, description: service.description, price: service.price?.toString() ?? '' };
}

export function GestionServicios() {
  const { session } = useAuth();
  const [services, setServices] = useState<DatabaseService[]>([]);
  const [selected, setSelected] = useState<DatabaseService | null>(null);
  const [form, setForm] = useState<EditForm>({ title: '', description: '', price: '' });
  const [editableImages, setEditableImages] = useState<EditableImage[]>([]);
  const [pendingImages, setPendingImages] = useState<PendingServiceImage[]>([]);
  const [isLoadingImages, setIsLoadingImages] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editingImageId, setEditingImageId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [planFeaturedStatus, setPlanFeaturedStatus] = useState<PlanFeaturedStatus | null>(null);
  const [isPlanFeaturedLoading, setIsPlanFeaturedLoading] = useState(true);
  const [planFeaturedError, setPlanFeaturedError] = useState('');
  const [planFeaturedUntil, setPlanFeaturedUntil] = useState<Record<string, string>>({});
  const [featuringServiceId, setFeaturingServiceId] = useState<string | null>(null);
  const pendingPreviewUrls = useRef(new Set<string>());

  useEffect(() => () => {
    pendingPreviewUrls.current.forEach((url) => URL.revokeObjectURL(url));
    pendingPreviewUrls.current.clear();
  }, []);

  async function loadServices() {
    if (!session) return;
    const { serviceResult, featuredResult } = await fetchOwnerDashboard(session.user.id);
    if (serviceResult.error) setMessage('No se pudieron cargar tus servicios.');
    setServices(serviceResult.data ?? []);
    setPlanFeaturedUntil(Object.fromEntries((featuredResult.data ?? []).map((item) => [item.service_id, item.ends_at])));
    await loadPlanFeaturedStatus();
  }

  async function loadPlanFeaturedStatus() {
    if (!session) return;
    setIsPlanFeaturedLoading(true);
    setPlanFeaturedError('');
    try {
      const result = await fetchPlanFeaturedStatus();
      if (result.error) throw new Error(result.error.message);
      if (!result.data) throw new Error('Supabase no devolvió el estado de destacadas.');
      setPlanFeaturedStatus(result.data);
    } catch (error) {
      setPlanFeaturedStatus(null);
      setPlanFeaturedError(error instanceof Error ? error.message : 'No se pudo cargar el límite de destacadas.');
    } finally {
      setIsPlanFeaturedLoading(false);
    }
  }

  useEffect(() => {
    if (!session) return;
    let active = true;
    void fetchOwnerDashboard(session.user.id).then(({ serviceResult, featuredResult }) => {
      if (!active) return;
      if (serviceResult.error) setMessage('No se pudieron cargar tus servicios.');
      setServices(serviceResult.data ?? []);
      setPlanFeaturedUntil(Object.fromEntries((featuredResult.data ?? []).map((item) => [item.service_id, item.ends_at])));
    });
    let statusActive = true;
    void fetchPlanFeaturedStatus().then((result) => {
      if (!statusActive) return;
      if (result.error) throw new Error(result.error.message);
      if (!result.data) throw new Error('Supabase no devolvió el estado de destacadas.');
      setPlanFeaturedStatus(result.data);
      setPlanFeaturedError('');
    }).catch((error: unknown) => {
      if (!statusActive) return;
      setPlanFeaturedStatus(null);
      setPlanFeaturedError(error instanceof Error ? error.message : 'No se pudo cargar el límite de destacadas.');
    }).finally(() => {
      if (statusActive) setIsPlanFeaturedLoading(false);
    });
    return () => { active = false; statusActive = false; };
  }, [session]);

  function chooseService(service: DatabaseService) {
    setSelected(service);
    setForm(toEditForm(service));
    setEditableImages([]);
    clearPendingImages();
    void loadEditableImages(service.id);
    setMessage('');
  }

  function clearPendingImages() {
    pendingImages.forEach(({ previewUrl }) => {
      URL.revokeObjectURL(previewUrl);
      pendingPreviewUrls.current.delete(previewUrl);
    });
    setPendingImages([]);
  }

  function addServiceImages(fileList: FileList | null) {
    if (!fileList) return;
    const remaining = Math.max(0, 5 - editableImages.length - pendingImages.length);
    const files = Array.from(fileList);
    if (files.length > remaining) {
      setMessage(`Puedes agregar ${remaining} imagen${remaining === 1 ? '' : 'es'} más. El máximo es 5 por servicio.`);
    }
    const selectedFiles = files.slice(0, remaining);
    const invalidFile = selectedFiles.find((file) => !file.type.startsWith('image/') || file.size > 5 * 1024 * 1024);
    if (invalidFile) {
      setMessage('Cada archivo debe ser una imagen de máximo 5 MB.');
      return;
    }
    const additions = selectedFiles.map((file) => {
      const previewUrl = URL.createObjectURL(file);
      pendingPreviewUrls.current.add(previewUrl);
      return { file, previewUrl };
    });
    setPendingImages((current) => [...current, ...additions]);
  }

  function removePendingImage(previewUrl: string) {
    URL.revokeObjectURL(previewUrl);
    pendingPreviewUrls.current.delete(previewUrl);
    setPendingImages((current) => current.filter((image) => image.previewUrl !== previewUrl));
  }

  async function loadEditableImages(serviceId: string) {
    setIsLoadingImages(true);
    const { data, error } = await getServiceImages(serviceId);
    if (error) {
      setMessage('No se pudieron cargar las imágenes del servicio.');
      setIsLoadingImages(false);
      return;
    }
    const images = await Promise.all((data ?? []).map(async (image) => {
      const signed = await supabase.storage.from('service-images').createSignedUrl(image.storage_path, 600);
      return { ...image, previewUrl: signed.data?.signedUrl ?? '' };
    }));
    setEditableImages(images);
    setIsLoadingImages(false);
  }

  function saveAdjustedImage(file: File) {
    if (!editingImageId) return;
    const previewUrl = URL.createObjectURL(file);
    setEditableImages((current) => current.map((image) => image.id === editingImageId ? { ...image, pendingFile: file, previewUrl } : image));
    setEditingImageId(null);
  }

  async function saveEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected) return;
    setIsSavingEdit(true);
    const { data, error } = await supabase.from('services').update({ title: form.title.trim(), description: form.description.trim(), price: form.price ? Number(form.price) : null }).eq('id', selected.id).select().single();
    if (error) {
      setMessage('No se pudo actualizar el servicio.');
      setIsSavingEdit(false);
      return;
    }
    try {
      for (const image of editableImages) {
        if (image.pendingFile) await replaceServiceImage(image.id, image.storage_path, image.pendingFile, image.alt_text);
      }
      if (pendingImages.length) await uploadServiceImages(selected.id, pendingImages.map(({ file }) => file));
      clearPendingImages();
      setMessage('Servicio e imágenes actualizados correctamente.');
      setSelected(data as DatabaseService);
      await loadServices();
      await loadEditableImages(selected.id);
    } catch (saveError) {
      setMessage(saveError instanceof Error ? saveError.message : 'No se pudieron guardar las imágenes.');
    } finally {
      setIsSavingEdit(false);
    }
  }

  async function changeStatus(service: DatabaseService) {
    const status: ServiceStatus = service.status === 'published' ? 'draft' : 'published';
    const { error } = await supabase.from('services').update({ status }).eq('id', service.id);
    setMessage(error ? error.message : 'Estado actualizado correctamente.');
    if (!error) await loadServices();
  }

  async function removeService(service: DatabaseService) {
    if (!window.confirm(`¿Eliminar "${service.title}"?`)) return;
    const { error } = await deleteService(service.id);
    setMessage(error ? 'No se pudo eliminar el servicio.' : 'Servicio eliminado correctamente.');
    if (!error) { setSelected(null); await loadServices(); }
  }

  async function activateFeatured(service: DatabaseService) {
    if (service.status !== 'published') return;
    setFeaturingServiceId(service.id);
    const { error } = await activatePlanFeaturedService(service.id);
    setFeaturingServiceId(null);
    if (error) {
      setMessage(error.message || 'No se pudo activar la destacada del plan.');
      return;
    }
    setMessage('Destacada activada para tu publicación.');
    await loadServices();
  }

  return (
    <section className="mx-auto min-h-[620px] w-[calc(100%-48px)] max-w-7xl py-10">
      <div className="flex flex-wrap items-end justify-between gap-3"><div><h1 className="text-2xl font-semibold">Mis servicios</h1><p className="mt-1 text-sm text-[#676878]">Administra tus publicaciones y borradores.</p></div><Button onClick={() => { window.location.hash = '#publicar'; }}>Nuevo servicio</Button></div>
      {message && !selected && <p className="mt-4 rounded-md bg-[#f0edff] p-3 text-sm text-[#6040b5]">{message}</p>}
      <aside className="plan-featured-panel mt-5 flex flex-wrap items-center justify-between gap-4 rounded-lg border border-[#d9cef8] bg-[#f8f6ff] p-4" aria-labelledby="renewal-notice-title">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#e8e1ff] text-[#7b32ca]"><RefreshCw aria-hidden="true" className="h-5 w-5" /></span>
          <div>
            <h2 className="plan-featured-title font-semibold text-[#5420a8]" id="renewal-notice-title">Renovación automática no activada</h2>
            <p className="plan-featured-copy mt-1 text-sm text-[#676878]">Al terminar tu periodo, elige nuevamente tu plan para renovarlo y conservar sus beneficios.</p>
          </div>
        </div>
        <a className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-md border border-[#a96be0] px-4 text-sm font-semibold text-[#7b32ca] transition-colors hover:bg-[#f0edff]" href="#planes">Elegir plan <ArrowRight aria-hidden="true" className="h-4 w-4" /></a>
      </aside>
      <div className="plan-featured-panel mt-6 rounded-lg border border-[#d9cef8] bg-[#f8f6ff] p-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="plan-featured-title font-semibold text-[#5420a8]">Destacadas incluidas en tu plan</h2><p className="plan-featured-copy mt-1 text-sm text-[#676878]">Selecciona una publicación publicada para usar una destacada. La unidad se descuenta del periodo actual.</p></div><p className="plan-featured-count text-sm font-semibold text-[#5420a8]">{planFeaturedStatus ? `${planFeaturedStatus.used_count}/${planFeaturedStatus.monthly_limit} usadas · ${planFeaturedStatus.remaining_count} disponibles` : isPlanFeaturedLoading ? 'Cargando límite...' : 'Límite no disponible'}</p></div>{planFeaturedError && <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-red-700" role="alert"><span>No se pudo consultar el plan: {planFeaturedError}</span><Button variant="outline" className="min-h-8 px-3 text-xs" disabled={isPlanFeaturedLoading} onClick={() => void loadPlanFeaturedStatus()}>{isPlanFeaturedLoading ? 'Consultando...' : 'Reintentar'}</Button></div>}{planFeaturedStatus?.monthly_limit === 0 && <p className="plan-featured-notice mt-3 text-xs text-[#735d22]">Tu plan actual no incluye destacadas mensuales.</p>}</div>
      <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_1.2fr]">
        <div className="space-y-3">{services.length === 0 && <p className="rounded-lg border border-slate-200 p-4 text-sm text-[#676878]">Todavía no tienes servicios.</p>}{services.map((service) => { const activeUntil = planFeaturedUntil[service.id]; const canUseFeatured = service.status === 'published' && !activeUntil && Boolean(planFeaturedStatus?.remaining_count); return <article className="rounded-lg border border-slate-200 bg-white p-4" key={service.id}><div className="flex items-start justify-between gap-3"><div><h2 className="font-semibold">{service.title}</h2><p className="mt-1 text-xs text-[#676878]">{service.status === 'published' ? 'Publicado' : 'Borrador'} · {service.price === null ? 'Precio por definir' : `B/.${service.price}`}</p></div><span className={`rounded px-2 py-1 text-xs ${service.status === 'published' ? 'bg-[#eaf8ee] text-[#268044]' : 'bg-[#fff7df] text-[#735d22]'}`}>{service.status === 'published' ? 'Activo' : 'Borrador'}</span></div><div className="mt-3 flex flex-wrap gap-2"><Button variant="outline" className="min-h-8 px-3 text-xs" onClick={() => chooseService(service)}>Editar</Button><Button variant="secondary" className="min-h-8 px-3 text-xs" onClick={() => changeStatus(service)}>{service.status === 'published' ? 'Pasar a borrador' : 'Publicar'}</Button><Button variant="outline" className="min-h-8 border-red-300 px-3 text-xs text-red-600" onClick={() => removeService(service)}>Eliminar</Button>{activeUntil ? <span className="inline-flex items-center rounded-md bg-[#f0edff] px-3 py-2 text-xs font-semibold text-[#5420a8]">Destacada hasta {new Date(activeUntil).toLocaleDateString('es-PA')}</span> : <Button variant="outline" className="min-h-8 px-3 text-xs" disabled={!canUseFeatured || featuringServiceId === service.id} onClick={() => void activateFeatured(service)}>{featuringServiceId === service.id ? 'Activando...' : 'Usar destacada del plan'}</Button>}</div></article>; })}</div>
        {selected && <form className="rounded-lg border border-slate-200 bg-white p-4" onSubmit={saveEdit}>
          <h2 className="font-semibold">Editar servicio</h2>
          <label className="mt-4 block text-xs font-medium">Título<input className="mt-1 h-10 w-full rounded border border-slate-200 px-3 text-sm" required minLength={3} maxLength={100} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></label>
          <label className="mt-3 block text-xs font-medium">Descripción<textarea className="mt-1 min-h-32 w-full rounded border border-slate-200 p-3 text-sm" required minLength={20} maxLength={3000} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label>
          <label className="mt-3 block text-xs font-medium">Precio desde<input className="mt-1 h-10 w-full rounded border border-slate-200 px-3 text-sm" type="number" min="0" step="0.01" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} /></label>
          <div className="mt-4">
            <h3 className="text-xs font-semibold">Imágenes del servicio</h3>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <label className={`inline-flex min-h-9 items-center rounded-md border border-slate-200 px-3 text-xs font-semibold text-[#5420a8] ${editableImages.length + pendingImages.length >= 5 || isLoadingImages || isSavingEdit ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-[#f4f1ff]'}`}>
                Agregar imagen
                <input className="sr-only" type="file" accept="image/*" multiple disabled={editableImages.length + pendingImages.length >= 5 || isLoadingImages || isSavingEdit} onChange={(event) => { addServiceImages(event.target.files); event.target.value = ''; }} />
              </label>
              <span className="text-xs text-[#676878]">{editableImages.length + pendingImages.length}/5 imágenes</span>
            </div>
            {isLoadingImages ? <p className="mt-2 text-xs text-[#676878]">Cargando imágenes...</p> : editableImages.length === 0 && pendingImages.length === 0 ? <p className="mt-2 text-xs text-[#676878]">Este servicio no tiene imágenes guardadas.</p> : <div className="mt-3 grid gap-3 sm:grid-cols-2">{editableImages.map((image, index) => <figure className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50" key={image.id}><img className="h-32 w-full bg-[#f4f1ff] object-contain" src={image.previewUrl} alt={image.alt_text || `Imagen ${index + 1}`} /><figcaption className="p-3"><button className="cursor-pointer text-xs font-semibold text-[#7b32ca] hover:underline" type="button" onClick={() => setEditingImageId(image.id)}>Ajustar imagen</button></figcaption></figure>)}{pendingImages.map(({ file, previewUrl }) => <figure className="overflow-hidden rounded-lg border border-dashed border-[#a96be0] bg-slate-50" key={previewUrl}><img className="h-32 w-full bg-[#f4f1ff] object-contain" src={previewUrl} alt={file.name} /><figcaption className="flex items-center justify-between gap-3 p-3"><span className="truncate text-xs text-slate-600">{file.name}</span><button className="shrink-0 cursor-pointer text-xs font-semibold text-red-600 hover:underline" type="button" onClick={() => removePendingImage(previewUrl)}>Quitar</button></figcaption></figure>)}</div>}
          </div>
          <div className="mt-4 flex flex-wrap gap-2"><Button type="submit" disabled={isSavingEdit || isLoadingImages}>{isSavingEdit ? 'Guardando...' : 'Guardar cambios'}</Button><Button variant="outline" type="button" disabled={isSavingEdit} onClick={() => { clearPendingImages(); setSelected(null); setMessage(''); }}>Cancelar</Button></div>
          {message && <p className="mt-3 rounded-md bg-[#f0edff] p-3 text-sm text-[#6040b5]" role="status">{message}</p>}
        </form>}
      </div>
      {editingImageId && (() => { const image = editableImages.find((currentImage) => currentImage.id === editingImageId); return image ? <ImageEditor source={image.pendingFile ?? image.previewUrl} title="Ajustar imagen del servicio" onCancel={() => setEditingImageId(null)} onSave={saveAdjustedImage} /> : null; })()}
    </section>
  );
}
