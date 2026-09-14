import { Brand } from './Brand';

const footerLinks = [
  { label: 'Inicio', href: '#inicio' },
  { label: 'Explora', href: '#explorar' },
  { label: 'Nosotros', href: '#nosotros' },
  { label: 'Contáctanos', href: '#contactanos' },
];

export function Footer() {
  return (
    <footer className="bg-linear-to-r from-[#141414] via-[#123b8d] to-[#1457e9] px-0 py-[29px] text-white">
      <div className="mx-auto w-[calc(100%-48px)] max-w-[1080px]">
        <div className="grid grid-cols-[1.6fr_1fr_1fr]">
          <div>
            <Brand inverted />
            <p className="mt-[11px] text-[10px] leading-[1.35]">Lo que necesitas, dentro de tu<br />comunidad.</p>
          </div>
          <div>
            <h2 className="mb-2 text-[15px]">Menú</h2>
            <nav className="flex flex-col gap-[5px]" aria-label="Navegación del pie de página">
              {footerLinks.map((link) => (
                <a className="text-[10px]" key={link.label} href={link.href}>{link.label}</a>
              ))}
            </nav>
          </div>
          <div>
            <h2 className="mb-2 text-[15px]">Nuestras redes</h2>
            <div className="flex gap-[14px]" aria-label="Redes sociales">
              <a className="text-xl" href="#instagram" aria-label="Instagram">◎</a>
              <a href="#whatsapp" aria-label="WhatsApp">◌</a>
              <a href="#correo" aria-label="Correo electrónico">✉</a>
            </div>
          </div>
        </div>
        <div className="mt-5 flex justify-between border-t border-white/30 pt-3 text-[9px]">
          <span>© 2026 ConectaUTP. Todos los derechos reservados.</span>
          <span>Desarrollado por Nex Digital</span>
        </div>
      </div>
    </footer>
  );
}
