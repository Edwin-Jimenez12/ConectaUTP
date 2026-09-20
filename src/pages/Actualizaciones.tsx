import { useEffect, useState } from 'react';
import { ArrowUpRight, CalendarDays, Sparkles } from 'lucide-react';
import { listPublishedUpdates, type AdminUpdate } from '../lib/adminData';
import { platformUpdates } from '../data/updates';

export function Actualizaciones() {
  const [remoteUpdates, setRemoteUpdates] = useState<AdminUpdate[]>([]);
  const [expandedUpdateId, setExpandedUpdateId] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;
    void listPublishedUpdates().then(({ data, error }) => {
      if (isActive && !error) setRemoteUpdates(data);
    });
    return () => {
      isActive = false;
    };
  }, []);

  const visibleUpdates = remoteUpdates.length > 0
    ? remoteUpdates.map((update) => ({
        id: update.id,
        category: update.category,
        title: update.title,
        summary: update.summary,
        content: update.content || update.summary,
        date: update.published_at ? new Intl.DateTimeFormat('es-PA', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(update.published_at)) : 'Próximamente',
      }))
    : platformUpdates.filter((update) => update.status === 'Publicado').map((update) => ({ ...update, content: update.summary }));

  return (
    <section className="mx-auto min-h-[700px] w-[calc(100%-48px)] max-w-7xl py-12">
      <div className="max-w-2xl"><p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-[#7b32ca]"><Sparkles aria-hidden="true" className="h-4 w-4" />ConectaUTP evoluciona</p><h1 className="mt-4 text-4xl font-bold max-sm:text-3xl">Actualizaciones</h1><p className="mt-3 text-base leading-7 text-[#676878]">Nuevas funciones, mejoras y noticias sobre todo lo que estamos construyendo para la comunidad UTP.</p></div>
      <div className="mt-10 w-full space-y-4">{visibleUpdates.map((update) => { const isExpanded = expandedUpdateId === update.id; return <article className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-[#a96be0] sm:p-6" key={update.id}><div className="min-w-0"><span className="inline-flex rounded-full bg-[#f0edff] px-3 py-1 text-xs font-semibold text-[#7b32ca]">{update.category}</span><h2 className="mt-3 text-xl font-semibold">{update.title}</h2><p className="mt-2 text-sm leading-6 text-[#676878]">{update.summary}</p><div className={`grid overflow-hidden transition-[grid-template-rows,opacity] duration-300 ease-out ${isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}><div className="min-h-0"><p className="mt-4 whitespace-pre-line border-t border-slate-100 pt-4 text-sm leading-6 text-[#676878]">{update.content}</p></div></div></div><div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-xs text-[#676878]"><span className="flex items-center gap-1"><CalendarDays aria-hidden="true" className="h-3.5 w-3.5" />{update.date}</span><button aria-expanded={isExpanded} className="inline-flex items-center gap-1 font-semibold text-[#7b32ca]" type="button" onClick={() => setExpandedUpdateId(isExpanded ? null : update.id)}>{isExpanded ? 'Cerrar' : 'Leer'} <ArrowUpRight aria-hidden="true" className={`h-3.5 w-3.5 transition-transform ${isExpanded ? 'rotate-90' : ''}`} /></button></div></article>; })}</div>
    </section>
  );
}
