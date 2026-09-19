import type { ReactNode } from 'react';
import { ArrowLeft, LockKeyhole, ShieldCheck, UserRound, WalletCards } from 'lucide-react';

const settingsItems = [
  { label: 'Mi perfil', href: '#configuracion', icon: UserRound },
  { label: 'Privacidad', href: '#privacidad', icon: ShieldCheck },
  { label: 'Seguridad', href: '#seguridad', icon: LockKeyhole },
  { label: 'Mi cuenta', href: '#mi-cuenta', icon: WalletCards },
];

interface SettingsLayoutProps {
  active: string;
  children: ReactNode;
}

export function SettingsLayout({ active, children }: SettingsLayoutProps) {
  return (
    <div className="mx-auto grid min-h-[620px] w-full max-w-7xl grid-cols-[260px_minmax(0,1fr)] border-x border-slate-100 bg-white max-lg:grid-cols-1">
      <aside className="border-r border-slate-100 px-3 py-5 max-lg:border-b max-lg:border-r-0 max-lg:px-4 max-lg:py-4">
        <a className="inline-flex items-center gap-1 text-sm text-[#5420a8]" href="#inicio"><ArrowLeft aria-hidden="true" className="h-4 w-4" />Volver a mi perfil</a>
        <h2 className="mb-5 mt-5 text-lg font-semibold">Configuración</h2>
        <nav className="flex flex-col gap-1 max-lg:flex-row max-lg:overflow-x-auto" aria-label="Configuración de la cuenta">
          {settingsItems.map((item) => (
            <a className={`flex shrink-0 items-center gap-3 rounded-md px-3 py-3 text-sm ${active === item.label ? 'bg-[#eeeaff] text-[#5420a8]' : 'text-[#676878]'}`} key={item.label} href={item.href}>
              <item.icon aria-hidden="true" className="h-4 w-4" />{item.label}
            </a>
          ))}
        </nav>
      </aside>
      <section className="min-w-0 px-6 py-5 max-sm:px-4">{children}</section>
    </div>
  );
}
