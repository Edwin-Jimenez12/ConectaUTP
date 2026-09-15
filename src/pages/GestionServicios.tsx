import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useAuth } from '../auth/useAuth';
import { Button } from '../components/Button';
import { deleteService, listOwnerServices } from '../lib/services';
import { supabase } from '../lib/supabase';
import type { DatabaseService, ServiceStatus } from '../types/service';

interface EditForm {
  title: string;
  description: string;
  price: string;
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
    setMessage('');
  }

  async function saveEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected) return;
    const { data, error } = await supabase.from('services').update({ title: form.title.trim(), description: form.description.trim(), price: form.price ? Number(form.price) : null }).eq('id', selected.id).select().single();
    if (error) setMessage('No se pudo actualizar el servicio.');
    else { setMessage('Servicio actualizado correctamente.'); setSelected(data as DatabaseService); await loadServices(); }
  }

  async function changeStatus(service: DatabaseService) {
    const status: ServiceStatus = service.status === 'published' ? 'draft' : 'published';
    const { error } = await supabase.from('services').update({ status }).eq('id', service.id);
    setMessage(error ? 'No se pudo cambiar el estado.' : 'Estado actualizado correctamente.');
    if (!error) await loadServices();
  }

  async function removeService(service: DatabaseService) {
    if (!window.confirm(`¿Eliminar "${service.title}"?`)) return;
    const { error } = await deleteService(service.id);
    setMessage(error ? 'No se pudo eliminar el servicio.' : 'Servicio eliminado correctamente.');
    if (!error) { setSelected(null); await loadServices(); }
  }

  return (
    <section className="mx-auto min-h-[620px] w-[calc(100%-48px)] max-w-6xl py-10">
      <div className="flex flex-wrap items-end justify-between gap-3"><div><h1 className="text-2xl font-semibold">Mis servicios</h1><p className="mt-1 text-sm text-[#676878]">Administra tus publicaciones y borradores.</p></div><Button onClick={() => { window.location.hash = '#publicar'; }}>Nuevo servicio</Button></div>
      {message && <p className="mt-4 rounded-md bg-[#f0edff] p-3 text-xs text-[#6040b5]">{message}</p>}
      <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_1.2fr]">
        <div className="space-y-3">{services.length === 0 && <p className="rounded-lg border border-slate-200 p-4 text-sm text-[#676878]">Todavía no tienes servicios.</p>}{services.map((service) => <article className="rounded-lg border border-slate-200 bg-white p-4" key={service.id}><div className="flex items-start justify-between gap-3"><div><h2 className="font-semibold">{service.title}</h2><p className="mt-1 text-xs text-[#676878]">{service.status === 'published' ? 'Publicado' : 'Borrador'} · {service.price === null ? 'Precio por definir' : `$${service.price}`}</p></div><span className={`rounded px-2 py-1 text-[10px] ${service.status === 'published' ? 'bg-[#eaf8ee] text-[#268044]' : 'bg-[#fff7df] text-[#735d22]'}`}>{service.status === 'published' ? 'Activo' : 'Borrador'}</span></div><div className="mt-3 flex flex-wrap gap-2"><Button variant="outline" className="min-h-7 px-3 text-[10px]" onClick={() => chooseService(service)}>Editar</Button><Button variant="secondary" className="min-h-7 px-3 text-[10px]" onClick={() => changeStatus(service)}>{service.status === 'published' ? 'Pasar a borrador' : 'Publicar'}</Button><Button variant="outline" className="min-h-7 border-red-300 px-3 text-[10px] text-red-600" onClick={() => removeService(service)}>Eliminar</Button></div></article>)}</div>
        {selected && <form className="rounded-lg border border-slate-200 bg-white p-4" onSubmit={saveEdit}><h2 className="font-semibold">Editar servicio</h2><label className="mt-4 block text-xs font-medium">Título<input className="mt-1 h-10 w-full rounded border border-slate-200 px-3 text-sm" required minLength={3} maxLength={100} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></label><label className="mt-3 block text-xs font-medium">Descripción<textarea className="mt-1 min-h-32 w-full rounded border border-slate-200 p-3 text-sm" required minLength={20} maxLength={3000} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label><label className="mt-3 block text-xs font-medium">Precio desde<input className="mt-1 h-10 w-full rounded border border-slate-200 px-3 text-sm" type="number" min="0" step="0.01" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} /></label><div className="mt-4 flex gap-2"><Button type="submit">Guardar cambios</Button><Button variant="outline" type="button" onClick={() => setSelected(null)}>Cancelar</Button></div></form>}
      </div>
    </section>
  );
}
