import { useEffect, useState } from 'react';
import { ArrowLeft, UserCircle2 } from 'lucide-react';
import { Button } from '../components/Button';
import { supabase } from '../lib/supabase';
import type { PublicService } from '../types/service';

interface PublicProfile {
  id: string;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  career: string | null;
  faculty: string | null;
}

export function PerfilPublico({ profileId }: { profileId: string }) {
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [services, setServices] = useState<PublicService[]>([]);

  useEffect(() => {
    void Promise.all([
      supabase.from('public_profiles').select('*').eq('id', profileId).maybeSingle(),
      supabase.from('public_services').select('*').eq('owner_id', profileId),
    ]).then(([profileResult, serviceResult]) => {
      setProfile(profileResult.data as PublicProfile | null);
      setServices((serviceResult.data ?? []) as PublicService[]);
    });
  }, [profileId]);

  if (!profile) return <div className="mx-auto min-h-[620px] w-[calc(100%-48px)] max-w-7xl px-6 py-12 text-sm text-[#676878]">Perfil no disponible o privado.</div>;
  const displayName = [profile.first_name, profile.last_name].filter(Boolean).join(' ') || `@${profile.username}`;

  return (
    <section className="mx-auto min-h-[620px] w-[calc(100%-48px)] max-w-7xl py-10">
      <a className="inline-flex items-center gap-1 text-xs text-[#7b32ca]" href="#explorar"><ArrowLeft aria-hidden="true" className="h-3.5 w-3.5" />Volver a explorar</a>
      <header className="mt-5 rounded-xl border border-slate-200 bg-white p-6"><div className="flex items-center gap-4"><div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#eeeaff] text-[#5420a8]">{profile.avatar_url ? <img className="h-full w-full object-cover" src={profile.avatar_url} alt={`Foto de ${displayName}`} /> : <UserCircle2 aria-hidden="true" className="h-8 w-8" />}</div><div><h1 className="text-2xl font-semibold">{displayName}</h1><p className="text-sm text-[#676878]">@{profile.username ?? 'usuario'}</p></div></div><p className="mt-4 text-sm text-[#676878]">{profile.bio || 'Este usuario todavía no ha agregado una biografía.'}</p>{profile.career && <p className="mt-3 text-xs text-[#676878]">{profile.career}{profile.faculty ? ` · ${profile.faculty}` : ''}</p>}</header>
      <div className="mt-6 flex items-center justify-between"><h2 className="text-xl font-semibold">Servicios publicados</h2><Button variant="outline" onClick={() => { window.location.hash = '#explorar'; }}>Explorar</Button></div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">{services.map((service) => <a className="rounded-lg border border-slate-200 bg-white p-4 hover:border-[#a96be0]" key={service.id} href={`#servicio/${service.id}`}><h3 className="font-semibold">{service.title}</h3><p className="mt-1 text-xs text-[#676878]">{service.category_name} · {service.provider_name}</p><p className="mt-3 text-sm font-semibold text-[#7b32ca]">{service.price === null ? 'Precio por definir' : `Desde B/.${service.price}`}</p></a>)}</div>
    </section>
  );
}
