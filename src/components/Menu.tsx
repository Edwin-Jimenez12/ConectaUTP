import { Button } from './Button';
import { Brand } from './Brand';

const menuItems = [
  { label: 'Inicio', href: '#inicio' },
  { label: 'Explorar', href: '#explorar' },
  { label: 'Nosotros', href: '#nosotros' },
  { label: 'Contáctanos', href: '#contactanos' },
];

export function Menu() {
  return (
    <header className="border-b border-[#e5e5ec] bg-white">
      <div className="mx-auto flex h-[62px] w-[calc(100%-48px)] max-w-[1080px] items-center justify-between">
        <Brand />
        <nav className="ml-[100px] flex items-center gap-[34px]" aria-label="Navegación principal">
          {menuItems.map((item) => (
            <a
              className="border-b-2 border-transparent py-[23px] text-[11px] text-[#5420a8] first:border-[#7b32ca]"
              key={item.label}
              href={item.href}
            >
              {item.label}
            </a>
          ))}
        </nav>
        <div className="flex gap-2">
          <Button variant="secondary">Iniciar sesión</Button>
          <Button>Registrarse</Button>
        </div>
      </div>
    </header>
  );
}
