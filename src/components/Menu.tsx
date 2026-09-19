import { useEffect, useRef, useState } from 'react';
import { ChevronDown, LogOut, Menu as MenuIcon, MessageCircleMore, Moon, Sun, UserCircle2 } from 'lucide-react';
import { useAuth } from '../auth/useAuth';
import { Button } from './Button';

const menuItems = [
  { label: 'Inicio', href: '#inicio' },
  { label: 'Explorar', href: '#explorar' },
  { label: 'Nosotros', href: '#nosotros' },
  { label: 'Planes', href: '#planes' },
  { label: 'Tu opinión', href: '#contactanos' },
];

export function Menu({ theme, onToggleTheme }: { theme: 'light' | 'dark'; onToggleTheme: () => void }) {
  const { session, profile, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [currentHash, setCurrentHash] = useState(window.location.hash || '#inicio');
  const headerRef = useRef<HTMLElement>(null);
  const firstName = profile?.first_name?.trim().split(/\s+/)[0];
  const emailName = session?.user.email?.split('@')[0];
  const displayName = firstName || (profile ? emailName : 'usuario') || 'usuario';

  useEffect(() => {
    const handleHashChange = () => setCurrentHash(window.location.hash || '#inicio');
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!headerRef.current?.contains(event.target as Node)) {
        setIsMenuOpen(false);
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('pointerdown', closeOnOutsideClick);
    return () => document.removeEventListener('pointerdown', closeOnOutsideClick);
  }, []);

  function isActive(href: string) {
    return currentHash === href || (href === '#explorar' && (currentHash.startsWith('#servicio/') || currentHash.startsWith('#perfil/')));
  }

  function closeMenus() {
    setIsMenuOpen(false);
    setIsProfileOpen(false);
  }

  return (
    <header ref={headerRef} className="fixed top-0 z-50 w-full border-b border-[#e5e5ec] bg-white">
      <div className="mx-auto flex min-h-[76px] w-[calc(100%-48px)] max-w-7xl items-center justify-between gap-4">

        <a href="/"><img src={theme === 'dark' ? '/LogoBlanco.svg' : '/LogoCompleto.svg'} className="h-[35px] w-auto max-sm:h-7" alt="ConectaUTP" /></a>
        <nav className="flex items-center gap-[34px] max-lg:hidden" aria-label="Navegación principal">
          {menuItems.map((item) => (
            <a
              className="group py-5 text-base font-semibold text-[#5420a8] transition-colors duration-300"
              key={item.label}
              href={item.href}
              aria-current={isActive(item.href) ? 'page' : undefined}
            >
              {item.label}
              <div className={`h-0.5 rounded-full bg-[#5420a8] transition-all duration-300 ${isActive(item.href) ? 'w-full' : 'w-0 group-hover:w-full'}`}></div>
            </a>
          ))}
        </nav>
        <div className="hidden items-center gap-2 lg:flex">
          {session ? (
            <><a className="flex h-10 w-10 items-center justify-center rounded-md border border-[#d9d2eb] text-[#5420a8] transition-colors hover:bg-[#f4f1ff]" href="#chats" aria-label="Abrir chats" title="Chats"><MessageCircleMore aria-hidden="true" className="h-5 w-5" /></a><ProfileMenu displayName={displayName} avatarUrl={profile?.avatar_url} theme={theme} isOpen={isProfileOpen} onToggle={() => setIsProfileOpen(!isProfileOpen)} onToggleTheme={onToggleTheme} onClose={closeMenus} onSignOut={signOut} /></>
          ) : (
            <AuthActions />
          )}
        </div>
        <div className="flex items-center gap-3 lg:hidden">
          {session && <a className="flex h-10 w-10 items-center justify-center rounded-md border border-[#d9d2eb] text-[#5420a8]" href="#chats" aria-label="Abrir chats" title="Chats"><MessageCircleMore aria-hidden="true" className="h-5 w-5" /></a>}
          <button
            className="flex h-10 w-10 items-center justify-center rounded-md border border-[#d9d2eb] text-[#5420a8]"
            type="button"
            aria-expanded={isMenuOpen}
            aria-label="Abrir menú"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <MenuIcon aria-hidden="true" className="h-5 w-5" />
          </button>
        </div>
      </div>
      {isMenuOpen && (
        <div className="border-t border-[#e5e5ec] px-4 py-3 lg:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col gap-3" aria-label="Menú móvil">
            {menuItems.map((item) => <a className={`rounded px-2 py-1 ${isActive(item.href) ? 'bg-[#f0ebff] font-semibold text-[#5420a8]' : ''}`} key={item.label} href={item.href} onClick={closeMenus} aria-current={isActive(item.href) ? 'page' : undefined}>{item.label}</a>)}
            {session ? <ProfileMenu displayName={displayName} avatarUrl={profile?.avatar_url} theme={theme} isOpen={isProfileOpen} onToggle={() => setIsProfileOpen(!isProfileOpen)} onToggleTheme={onToggleTheme} onClose={closeMenus} onSignOut={signOut} /> : <AuthActions onClick={closeMenus} />}
          </nav>
        </div>
      )}
    </header>
  );
}

function AuthActions({ onClick }: { onClick?: () => void }) {
  return (
    <div className="flex gap-2">
      <Button variant="secondary" onClick={() => { window.location.hash = '#login'; onClick?.(); }}>Iniciar sesión</Button>
      <Button onClick={() => { window.location.hash = '#registro'; onClick?.(); }}>Registrarse</Button>
    </div>
  );
}

interface ProfileMenuProps {
  displayName: string;
  avatarUrl?: string | null;
  theme: 'light' | 'dark';
  isOpen: boolean;
  onToggle: () => void;
  onToggleTheme: () => void;
  onClose: () => void;
  onSignOut: () => Promise<void>;
}

function ProfileMenu({ displayName, avatarUrl, theme, isOpen, onToggle, onToggleTheme, onClose, onSignOut }: ProfileMenuProps) {
  const [isSignOutConfirmOpen, setIsSignOutConfirmOpen] = useState(false);

  async function confirmSignOut() {
    await onSignOut();
    setIsSignOutConfirmOpen(false);
    onClose();
  }

  return (
    <div className="relative">
      <button className="flex items-center gap-2 rounded-md border border-[#d9d2eb] px-3 py-2 text-xs text-[#5420a8]" type="button" onClick={onToggle} aria-expanded={isOpen}>
        {avatarUrl ? <img className="h-5 w-5 rounded-full object-cover" src={avatarUrl} alt="" /> : <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#eeeaff] text-[#5420a8]"><UserCircle2 aria-hidden="true" className="h-4 w-4" /></span>}
        Hola, {displayName}
        <ChevronDown aria-hidden="true" className="h-3.5 w-3.5" />
      </button>
      {isOpen && (
        <div className="absolute right-0 top-11 z-10 w-44 rounded-lg border border-slate-200 bg-white p-2 text-xs shadow-lg">
          <a className="block rounded px-3 py-2 hover:bg-[#f4f1ff]" href="#configuracion" onClick={onClose}>Mi perfil</a>
          <a className="block rounded px-3 py-2 hover:bg-[#f4f1ff]" href="#mis-servicios" onClick={onClose}>Mis servicios</a>
          <button className="flex w-full items-center justify-between rounded px-3 py-2 text-left hover:bg-[#f4f1ff]" type="button" onClick={onToggleTheme} aria-label={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}>
            <span className="flex items-center gap-2">Apariencia<span className="text-base" aria-hidden="true">{theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}</span></span>
          </button>
          <button className="block w-full rounded px-3 py-2 text-left hover:bg-[#f4f1ff]" type="button" onClick={() => setIsSignOutConfirmOpen(true)}>Cerrar sesión</button>
        </div>
      )}
      {isSignOutConfirmOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#0b1020]/60 px-4 py-6" role="presentation">
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="sign-out-title">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f0edff] text-[#7b32ca]" aria-hidden="true"><LogOut className="h-5 w-5" /></div>
            <h2 className="mt-4 text-lg font-semibold" id="sign-out-title">¿Cerrar sesión?</h2>
            <p className="mt-2 text-sm leading-6 text-[#676878]">Tu sesión se cerrará en este dispositivo. Podrás volver a entrar cuando quieras.</p>
            <div className="mt-6 flex gap-3 max-sm:flex-col-reverse">
              <button className="min-h-10 flex-1 cursor-pointer rounded-md border border-[#d9d2eb] px-4 text-sm font-semibold text-[#5420a8]" type="button" onClick={() => setIsSignOutConfirmOpen(false)}>Cancelar</button>
              <button className="min-h-10 flex-1 cursor-pointer rounded-md border border-[#7b32ca] bg-[#7b32ca] px-4 text-sm font-semibold text-white" type="button" onClick={() => void confirmSignOut()}>Cerrar sesión</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
