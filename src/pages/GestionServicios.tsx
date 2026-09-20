import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useAuth } from '../auth/useAuth';
import { Button } from '../components/Button';
import { ImageEditor } from '../components/ImageEditor';
import { deleteService, getServiceImages, listOwnerServices } from '../lib/services';
import { replaceServiceImage } from '../lib/imageUpload';
import { supabase } from '../lib/supabase';
import type { DatabaseService, ServiceImage, ServiceStatus } from '../types/service';

interface EditForm {
  title: string;
  description: string;
  price: string;
}

interface EditableImage extends ServiceImage {
  previewUrl: string;
  pendingFile?: File;
}

async function fetchOwnerServices(ownerId: string) {
  return listOwnerServices(ownerId);
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
  const [editingImageId, setEditingImageId] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  async function loadServices() {
    if (!session) return;
    const { data, error } = await fetchOwnerServices(session.user.id);
    if (error) setMessage('No se pudieron cargar tus servicios.');
    setServices(data ?? []);
  }

  useEffect(() => {
    if (!session) return;
    void Promise.resolve().then(() => fetchOwnerServices(session.user.id)).then(({ data, error }) => {
      if (error) setMessage('No se pudieron cargar tus servicios.');
      setServices(data ?? []);
    });
  }, [session]);

  function chooseService(service: DatabaseService) {
    setSelected(service);
    setForm(toEditForm(service));
    setEditableImages([]);
    void loadEditableImages(service.id);
    setMessage('');
  }

  async function loadEditableImages(serviceId: string) {
    const { data, error } = await getServiceImages(serviceId);
    if (error) {
      setMessage('No se pudieron cargar las imágenes del servicio.');
      return;
    }
    const images = await Promise.all((data ?? []).map(async (image) => {
      const signed = await supabase.storage.from('service-images').createSignedUrl(image.storage_path, 600);
      return { ...image, previewUrl: signed.data?.signedUrl ?? '' };
    }));
    setEditableImages(images);
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
    const { data, error } = await supabase.from('services').update({ title: form.title.trim(), description: form.description.trim(), price: form.price ? Number(form.price) : null }).eq('id', selected.id).select().single();
    if (error) {
      setMessage('No se pudo actualizar el servicio.');
      return;
    }
    try {
      for (const image of editableImages) {
        if (image.pendingFile) await replaceServiceImage(image.id, image.storage_path, image.pendingFile, image.alt_text);
      }
      setMessage('Servicio e imágenes actualizados correctamente.');
      setSelected(data as DatabaseService);
      await loadServices();
      await loadEditableImages(selected.id);
    } catch (saveError) {
      setMessage(saveError instanceof Error ? saveError.message : 'No se pudieron guardar las imágenes.');
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

  return (
    <section className="mx-auto min-h-[620px] w-[calc(100%-48px)] max-w-7xl py-10">
      <div className="flex flex-wrap items-end justify-between gap-3"><div><h1 className="text-2xl font-semibold">Mis servicios</h1><p className="mt-1 text-sm text-[#676878]">Administra tus publicaciones y borradores.</p></div><Button onClick={() => { window.location.hash = '#publicar'; }}>Nuevo servicio</Button></div>
      {message && !selected && <p className="mt-4 rounded-md bg-[#f0edff] p-3 text-sm text-[#6040b5]">{message}</p>}
      <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_1.2fr]">
        <div className="space-y-3">{services.length === 0 && <p className="rounded-lg border border-slate-200 p-4 text-sm text-[#676878]">Todavía no tienes servicios.</p>}{services.map((service) => <article className="rounded-lg border border-slate-200 bg-white p-4" key={service.id}><div className="flex items-start justify-between gap-3"><div><h2 className="font-semibold">{service.title}</h2><p className="mt-1 text-xs text-[#676878]">{service.status === 'published' ? 'Publicado' : 'Borrador'} · {service.price === null ? 'Precio por definir' : `B/.${service.price}`}</p></div><span className={`rounded px-2 py-1 text-xs ${service.status === 'published' ? 'bg-[#eaf8ee] text-[#268044]' : 'bg-[#fff7df] text-[#735d22]'}`}>{service.status === 'published' ? 'Activo' : 'Borrador'}</span></div><div className="mt-3 flex flex-wrap gap-2"><Button variant="outline" className="min-h-8 px-3 text-xs" onClick={() => chooseService(service)}>Editar</Button><Button variant="secondary" className="min-h-8 px-3 text-xs" onClick={() => changeStatus(service)}>{service.status === 'published' ? 'Pasar a borrador' : 'Publicar'}</Button><Button variant="outline" className="min-h-8 border-red-300 px-3 text-xs text-red-600" onClick={() => removeService(service)}>Eliminar</Button></div></article>)}</div>
        {selected && <form className="rounded-lg border border-slate-200 bg-white p-4" onSubmit={saveEdit}><h2 className="font-semibold">Editar servicio</h2><label className="mt-4 block text-xs font-medium">Título<input className="mt-1 h-10 w-full rounded border border-slate-200 px-3 text-sm" required minLength={3} maxLength={100} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></label><label className="mt-3 block text-xs font-medium">Descripción<textarea className="mt-1 min-h-32 w-full rounded border border-slate-200 p-3 text-sm" required minLength={20} maxLength={3000} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label><label className="mt-3 block text-xs font-medium">Precio desde<input className="mt-1 h-10 w-full rounded border border-slate-200 px-3 text-sm" type="number" min="0" step="0.01" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} /></label><div className="mt-4"><h3 className="text-xs font-semibold">Imágenes del servicio</h3>{editableImages.length === 0 ? <p className="mt-2 text-xs text-[#676878]">Este servicio no tiene imágenes guardadas.</p> : <div className="mt-2 grid gap-3 sm:grid-cols-2">{editableImages.map((image, index) => <figure className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50" key={image.id}><img className="h-32 w-full bg-[#f4f1ff] object-contain" src={image.previewUrl} alt={image.alt_text || `Imagen ${index + 1}`} /><div className="p-3"><button className="cursor-pointer text-xs font-semibold text-[#7b32ca] hover:underline" type="button" onClick={() => setEditingImageId(image.id)}>Ajustar imagen</button></div></figure>)}</div>}</div><div className="mt-4 flex gap-2"><Button type="submit">Guardar cambios</Button><Button variant="outline" type="button" onClick={() => setSelected(null)}>Cancelar</Button></div>{message && <p className="mt-3 rounded-md bg-[#f0edff] p-3 text-sm text-[#6040b5]">{message}</p>}</form>}
      </div>
      {editingImageId && (() => { const image = editableImages.find((currentImage) => currentImage.id === editingImageId); return image ? <ImageEditor source={image.pendingFile ?? image.previewUrl} title="Ajustar imagen del servicio" onCancel={() => setEditingImageId(null)} onSave={saveAdjustedImage} /> : null; })()}
    </section>
  );
}
