import { useEffect, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { useAuth } from '../auth/useAuth';
import { Button } from '../components/Button';
import { uploadServiceImages } from '../lib/imageUpload';
import { createService, listCategories } from '../lib/services';
import type { ServiceCategory } from '../lib/services';
import type { ServiceModality, ServiceStatus } from '../types/service';

const initialForm = {
  title: '', description: '', category_id: '', modality: 'both' as ServiceModality,
  price: '', status: 'draft' as ServiceStatus, altText: '',
};

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="block text-xs font-medium">{label}{children}</label>;
}

const inputClass = 'mt-1 h-10 w-full rounded-md border border-slate-200 px-3 text-sm';

export function CrearServicio() {
  const { session } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [message, setMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

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
    setFiles(selected ? Array.from(selected).slice(0, 5) : []);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!session) return;
    setMessage('');
    setIsSaving(true);
    const submitter = (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    const status = (submitter?.value as ServiceStatus | undefined) ?? form.status;
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
      if (files.length) await uploadServiceImages(result.data.id, files, form.altText.trim());
      setMessage(status === 'published' ? 'Servicio publicado correctamente.' : 'Borrador guardado correctamente.');
      setForm(initialForm);
      setFiles([]);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Falló la subida de imágenes.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="mx-auto min-h-[620px] w-[calc(100%-48px)] max-w-7xl py-10">
      <h1 className="text-2xl font-semibold">Publicar mi servicio</h1>
      <p className="mt-1 text-sm text-[#676878]">Comparte una habilidad con la comunidad UTP.</p>
      <form className="mt-6 space-y-4 rounded-xl border border-slate-200 bg-white p-5" onSubmit={handleSubmit}>
        <Field label="Título"><input className={inputClass} required minLength={3} maxLength={100} value={form.title} onChange={(event) => updateForm({ title: event.target.value })} /></Field>
        <Field label="Descripción"><textarea className="mt-1 min-h-28 w-full rounded-md border border-slate-200 p-3 text-sm" required minLength={20} maxLength={3000} value={form.description} onChange={(event) => updateForm({ description: event.target.value })} /></Field>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Categoría"><select className={inputClass} required value={form.category_id} onChange={(event) => updateForm({ category_id: event.target.value })}><option value="">Selecciona</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></Field>
          <Field label="Modalidad"><select className={inputClass} value={form.modality} onChange={(event) => updateForm({ modality: event.target.value as ServiceModality })}><option value="online">En línea</option><option value="in_person">Presencial</option><option value="both">Ambas</option></select></Field>
          <Field label="Precio desde"><input className={inputClass} type="number" min="0" step="0.01" value={form.price} onChange={(event) => updateForm({ price: event.target.value })} /></Field>
        </div>
        <Field label="Imágenes (máximo 5, 5 MB cada una)"><input className="mt-1 block w-full rounded-md border border-slate-200 p-2 text-sm" type="file" accept="image/*" multiple onChange={(event) => selectFiles(event.target.files)} /></Field>
        {files.length > 0 && <Field label="Texto alternativo"><input className={inputClass} placeholder="Describe las imágenes" value={form.altText} onChange={(event) => updateForm({ altText: event.target.value })} /></Field>}
        <div className="flex flex-wrap gap-3 border-t border-slate-100 pt-4"><Button variant="outline" type="submit" value="draft" disabled={isSaving}>Guardar borrador</Button><Button type="submit" value="published" disabled={isSaving}>{isSaving ? 'Guardando...' : 'Publicar servicio'}</Button></div>
        {message && <p className="rounded-md bg-[#f0edff] p-3 text-xs text-[#6040b5]">{message}</p>}
      </form>
    </section>
  );
}
