import { useEffect, useRef, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { useAuth } from '../auth/useAuth';
import { Button } from '../components/Button';
import { ImageEditor } from '../components/ImageEditor';
import { ServiceCard } from '../components/ServiceCard';
import { uploadServiceImages } from '../lib/imageUpload';
import { createService, getEffectivePlanEntitlements, listCategories, listOwnerServices } from '../lib/services';
import type { ServiceCategory } from '../lib/services';
import type { ServiceModality, ServiceStatus } from '../types/service';

const initialForm = {
  title: '', description: '', category_id: '', modality: 'both' as ServiceModality,
  price: '', status: 'draft' as ServiceStatus,
};

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="block text-xs font-medium">{label}{children}</label>;
}

const inputClass = 'mt-1 h-10 w-full rounded-md border border-slate-200 px-3 text-sm';

export function CrearServicio() {
  const { session, profile } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const objectUrls = useRef(new Set<string>());

  useEffect(() => () => objectUrls.current.forEach((url) => URL.revokeObjectURL(url)), []);

  useEffect(() => {
    void listCategories().then(({ data, error }) => {
      if (error) setMessage('No se pudieron cargar las categorías. Ejecuta la migración de servicios en Supabase.');
      setCategories(data ?? []);
    });
  }, []);

  function updateForm(changes: Partial<typeof initialForm>) {
    setForm((current) => ({ ...current, ...changes }));
  }

  function selectFiles(selected: FileList | null) {
    const selectedFiles = selected ? Array.from(selected) : [];
    const nextFiles = [...files, ...selectedFiles].slice(0, 5);
    const addedFiles = nextFiles.slice(files.length);
    const addedUrls = addedFiles.map((file) => URL.createObjectURL(file));
    addedUrls.forEach((url) => objectUrls.current.add(url));
    setFiles(nextFiles);
    setPreviewUrls([...previewUrls, ...addedUrls].slice(0, 5));
  }

  function removeFile(index: number) {
    const removedUrl = previewUrls[index];
    if (removedUrl) {
      URL.revokeObjectURL(removedUrl);
      objectUrls.current.delete(removedUrl);
    }
    setFiles(files.filter((_, fileIndex) => fileIndex !== index));
    setPreviewUrls(previewUrls.filter((_, previewIndex) => previewIndex !== index));
  }

  function saveAdjustedFile(file: File) {
    if (editingIndex === null) return;
    const index = editingIndex;
    const nextPreviewUrl = URL.createObjectURL(file);
    objectUrls.current.add(nextPreviewUrl);
    URL.revokeObjectURL(previewUrls[index]);
    objectUrls.current.delete(previewUrls[index]);
    setFiles((current) => current.map((currentFile, fileIndex) => fileIndex === index ? file : currentFile));
    setPreviewUrls((current) => current.map((url, previewIndex) => previewIndex === index ? nextPreviewUrl : url));
    setEditingIndex(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!session) return;
    setMessage('');
    setIsSaving(true);
    const submitter = (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    const status = (submitter?.value as ServiceStatus | undefined) ?? form.status;
    if (status === 'published') {
      const [entitlementsResult, servicesResult] = await Promise.all([
        getEffectivePlanEntitlements(),
        listOwnerServices(session.user.id),
      ]);
      if (!entitlementsResult.error && !servicesResult.error) {
        const limit = Number(entitlementsResult.data?.max_published_services ?? 0);
        const publishedCount = (servicesResult.data ?? []).filter((service) => service.status === 'published').length;
        if (publishedCount >= limit) {
          setMessage(`Tu plan permite ${limit} publicaciones. Activa un plan o una promoción para publicar otra.`);
          setIsSaving(false);
          return;
        }
      }
    }
    const result = await createService({
      owner_id: session.user.id,
      category_id: form.category_id,
      title: form.title.trim(),
      description: form.description.trim(),
      modality: form.modality,
      price: form.price ? Number(form.price) : null,
      status,
    });
    if (result.error || !result.data) {
      setMessage(result.error?.message ?? 'No se pudo crear el servicio.');
      setIsSaving(false);
      return;
    }
    try {
      if (files.length) await uploadServiceImages(result.data.id, files);
      setMessage(status === 'published' ? 'Servicio publicado correctamente.' : 'Borrador guardado correctamente.');
      objectUrls.current.forEach((url) => URL.revokeObjectURL(url));
      objectUrls.current.clear();
      setForm(initialForm);
      setFiles([]);
      setPreviewUrls([]);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Falló la subida de imágenes.');
    } finally {
      setIsSaving(false);
    }
  }

  const fullName = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ');
  const providerName = profile?.identity_preference === 'username' && profile.username
    ? `@${profile.username}`
    : fullName || (profile?.username ? `@${profile.username}` : session?.user.email ?? 'Tu perfil');
  const previewService = {
    id: 'service-preview',
    providerId: session?.user.id ?? 'preview',
    title: form.title.trim() || 'Título de tu servicio',
    provider: providerName,
    price: form.price ? `Desde B/.${form.price}` : 'Precio por definir',
    category: categories.find((category) => category.id === form.category_id)?.name ?? 'Categoría',
    description: form.description.trim(),
    galleryImages: previewUrls.map((url, index) => ({ url, altText: `${form.title || 'Servicio'} - imagen ${index + 1}` })),
  };

  return (
    <section className="mx-auto min-h-[620px] w-[calc(100%-48px)] max-w-7xl py-10">
      <h1 className="text-2xl font-semibold">Publicar mi servicio</h1>
      <p className="mt-1 text-sm text-[#676878]">Comparte una habilidad con la comunidad UTP.</p>
      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(280px,0.8fr)]">
      <form className="space-y-4 rounded-xl border border-slate-200 bg-white p-5" onSubmit={handleSubmit}>
        <Field label="Título"><input className={inputClass} required minLength={3} maxLength={100} value={form.title} onChange={(event) => updateForm({ title: event.target.value })} /></Field>
        <Field label="Descripción"><textarea className="mt-1 min-h-28 w-full rounded-md border border-slate-200 p-3 text-sm" required minLength={20} maxLength={3000} value={form.description} onChange={(event) => updateForm({ description: event.target.value })} /></Field>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Categoría"><select className={inputClass} required value={form.category_id} onChange={(event) => updateForm({ category_id: event.target.value })}><option value="">Selecciona</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></Field>
          <Field label="Modalidad"><select className={inputClass} value={form.modality} onChange={(event) => updateForm({ modality: event.target.value as ServiceModality })}><option value="online">En línea</option><option value="in_person">Presencial</option><option value="both">Ambas</option></select></Field>
          <Field label="Precio desde"><input className={inputClass} type="number" min="0" step="0.01" value={form.price} onChange={(event) => updateForm({ price: event.target.value })} /></Field>
        </div>
        <Field label="Imágenes (máximo 5, 5 MB cada una)"><div className="mt-1 flex flex-wrap items-center gap-3"><label className="inline-flex min-h-10 cursor-pointer items-center rounded-md border border-slate-200 px-4 text-sm text-[#5420a8] hover:bg-[#f4f1ff]">{files.length ? '+ Agregar otra imagen' : 'Elegir imágenes'}<input className="sr-only" type="file" accept="image/*" multiple onChange={(event) => { selectFiles(event.target.files); event.target.value = ''; }} /></label><span className="text-xs text-[#676878]">{files.length}/5 seleccionadas</span></div></Field>
        {files.length > 0 && <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{files.map((file, index) => <figure className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50" key={`${file.name}-${file.lastModified}-${index}`}><img className="h-32 w-full bg-[#f4f1ff] object-contain" src={previewUrls[index]} alt={`Vista previa ${index + 1}`} /><figcaption className="truncate px-3 pt-2 text-xs text-slate-600">{file.name}</figcaption><div className="p-3"><div className="mt-2 flex items-center justify-between gap-3"><button className="cursor-pointer text-xs font-semibold text-[#7b32ca] hover:underline" type="button" onClick={() => setEditingIndex(index)}>Ajustar imagen</button><button className="cursor-pointer text-xs font-semibold text-red-600 hover:underline" type="button" onClick={() => removeFile(index)}>Quitar imagen</button></div></div></figure>)}</div>}
        <div className="flex flex-wrap gap-3 border-t border-slate-100 pt-4"><Button variant="outline" type="submit" value="draft" disabled={isSaving}>Guardar borrador</Button><Button type="submit" value="published" disabled={isSaving}>{isSaving ? 'Guardando...' : 'Publicar servicio'}</Button></div>
        {message && <p className="rounded-md bg-[#f0edff] p-3 text-xs text-[#6040b5]">{message}</p>}
      </form>
      <aside className="lg:sticky lg:top-6">
        <div className="mb-3">
          <h2 className="text-lg font-semibold">Vista previa</h2>
          <p className="mt-1 text-sm text-[#676878]">Así verán tu publicación en Explorar e Inicio.</p>
        </div>
        <ServiceCard service={previewService} preview />
      </aside>
      </div>
      {editingIndex !== null && files[editingIndex] && <ImageEditor source={files[editingIndex]} title="Ajustar imagen del servicio" onCancel={() => setEditingIndex(null)} onSave={saveAdjustedFile} />}
    </section>
  );
}
