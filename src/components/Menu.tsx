import { useState } from 'react';
import { useAuth } from '../auth/useAuth';
import { Button } from './Button';

const menuItems = [
  { label: 'Inicio', href: '#inicio' },
  { label: 'Explorar', href: '#explorar' },
  { label: 'Nosotros', href: '#nosotros' },
  { label: 'Contáctanos', href: '#contactanos' },
];

export function Menu() {
  const { session, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const firstName = session?.user.user_metadata?.first_name?.trim().split(/\s+/)[0];
  const emailName = session?.user.email?.split('@')[0];
  const displayName = firstName || emailName || 'usuario';

  function closeMenus() {
    setIsMenuOpen(false);
    setIsProfileOpen(false);
  }

  return (
    <header className="fixed top-0 z-50 w-full border-b border-[#e5e5ec] bg-white">
      <div className="mx-auto flex min-h-[76px] w-[calc(100%-48px)] max-w-6xl items-center justify-between gap-4">

        <a href="/"><img src="/LogoCompleto.svg" className="h-[35px] w-auto max-sm:h-7" alt="ConectaUTP" /></a>
        <nav className="flex items-center gap-[34px] max-lg:hidden" aria-label="Navegación principal">
          {menuItems.map((item) => (
            <a
              className="group border-b-2 border-transparent py-5 text-base font-semibold text-[#5420a8] transition-colors duration-300"
              key={item.label}
              href={item.href}
            >
              {item.label}
              <div className="h-0.5 w-0 rounded-full bg-[#5420a8] group-hover:w-full transition-all duration-300   "></div>
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2 max-sm:hidden">
          {session ? (
            <ProfileMenu displayName={displayName} isOpen={isProfileOpen} onToggle={() => setIsProfileOpen(!isProfileOpen)} onClose={closeMenus} onSignOut={signOut} />
          ) : (
            <AuthActions />
          )}
        </div>
        <button
          className="hidden rounded border border-[#d9d2eb] px-3 py-2 text-[#5420a8] max-lg:block"
          type="button"
          aria-expanded={isMenuOpen}
          aria-label="Abrir menú"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          ☰
        </button>
      </div>
      {isMenuOpen && (
        <div className="border-t border-[#e5e5ec] px-4 py-3 lg:hidden">
          <nav className="mx-auto flex max-w-6xl flex-col gap-3" aria-label="Menú móvil">
            {menuItems.map((item) => <a key={item.label} href={item.href} onClick={closeMenus}>{item.label}</a>)}
            {session ? <ProfileMenu displayName={displayName} isOpen={isProfileOpen} onToggle={() => setIsProfileOpen(!isProfileOpen)} onClose={closeMenus} onSignOut={signOut} /> : <AuthActions onClick={closeMenus} />}
          </nav>
        </div>
      )}
    </header>
  );
}

function AuthActions({ onClick }: { onClick?: () => void }) {
  return (
    <div className="flex gap-2">
      <Button variant="secondary" onClick={() => { window.location.hash = '#login'; onClick?.(); }} className='cursor-pointer'>Iniciar sesión</Button>
      <Button onClick={() => { window.location.hash = '#registro'; onClick?.(); }} className='cursor-pointer'>Registrarse</Button>
    </div>
  );
}

interface ProfileMenuProps {
  displayName: string;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  onSignOut: () => Promise<void>;
}

function ProfileMenu({ displayName, isOpen, onToggle, onClose, onSignOut }: ProfileMenuProps) {
  return (
    <div className="relative">
      <button className="flex items-center gap-2 rounded-md border border-[#d9d2eb] px-3 py-2 text-xs text-[#5420a8]" type="button" onClick={onToggle} aria-expanded={isOpen}>
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#eeeaff] text-[10px]">●</span>
        Hola, {displayName}
        <span aria-hidden="true">⌄</span>
      </button>
      {isOpen && (
        <div className="absolute right-0 top-11 z-10 w-44 rounded-lg border border-slate-200 bg-white p-2 text-xs shadow-lg">
          <a className="block rounded px-3 py-2 hover:bg-[#f4f1ff]" href="#configuracion" onClick={onClose}>Mi perfil</a>
          <a className="block rounded px-3 py-2 hover:bg-[#f4f1ff]" href="#mis-servicios" onClick={onClose}>Mis servicios</a>
          <a className="block rounded px-3 py-2 hover:bg-[#f4f1ff]" href="#configuracion" onClick={onClose}>Apariencia</a>
          <a className="block rounded px-3 py-2 hover:bg-[#f4f1ff]" href="#configuracion" onClick={onClose}>Configuración</a>
          <button className="block w-full rounded px-3 py-2 text-left hover:bg-[#f4f1ff]" type="button" onClick={onSignOut}>Cerrar sesión</button>
        </div>
      )}
    </div>
  );
}
