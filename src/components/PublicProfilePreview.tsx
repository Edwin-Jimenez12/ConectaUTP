import { CircleCheck, Info, MapPin, UserCircle2 } from 'lucide-react';
import type { InstitutionalEmailStatus, ProfileFormData } from '../types/profile';

interface PublicProfilePreviewProps {
  value: ProfileFormData;
  verificationStatus: InstitutionalEmailStatus;
  avatarUrl?: string | null;
}

export function PublicProfilePreview({ value, verificationStatus, avatarUrl }: PublicProfilePreviewProps) {
  const fullName = [value.first_name, value.last_name].filter(Boolean).join(' ') || 'Tu nombre';
  const primaryName = value.identity_preference === 'username' && value.username ? `@${value.username}` : fullName;
  const secondaryName = value.username ? `@${value.username}` : 'Agrega un username';
  const statusText = verificationStatus === 'verified' ? 'Verificación institucional' : 'Verificación institucional pendiente';

  return (
    <aside className="h-fit rounded-lg border border-slate-200 bg-white p-3">
      <h2 className="text-base font-semibold">Vista previa pública</h2>
      <div className="mt-3 overflow-hidden rounded-md border border-slate-100">
        <div className="h-16 bg-linear-to-r from-[#eee8ff] via-[#f8f7ff] to-[#ddd4fb]" />
        <div className="px-3 pb-3">
          <div className="-mt-7 flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-[#eef0f7] text-[#24304c]">{avatarUrl ? <img className="h-full w-full object-cover" src={avatarUrl} alt="Foto de perfil" /> : <UserCircle2 aria-hidden="true" className="h-7 w-7" />}</div>
          <h3 className="mt-2 text-base font-semibold">{primaryName}</h3>
          <p className="text-sm text-[#676878]">{secondaryName}</p>
          <span className="mt-2 inline-flex items-center gap-1 rounded bg-[#fff0c8] px-2 py-1 text-xs text-[#99751d]"><CircleCheck aria-hidden="true" className="h-3.5 w-3.5" />{statusText}</span>
          <p className="mt-4 border-b border-slate-100 pb-3 text-sm text-[#676878]">{value.bio || 'Cuéntanos un poco sobre ti...'}</p>
          <p className="mt-3 inline-flex items-center gap-1 text-sm font-medium"><MapPin aria-hidden="true" className="h-3.5 w-3.5" />Ubicación {value.show_location ? 'visible' : 'oculta'}</p>
          <p className="mt-1 text-sm text-[#676878]">Distrito, Provincia</p>
          <div className="mt-3 flex gap-1 rounded bg-[#f0edff] p-3 text-xs text-[#6040b5]"><Info aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />Tu correo electrónico no se muestra públicamente.</div>
        </div>
      </div>
    </aside>
  );
}
