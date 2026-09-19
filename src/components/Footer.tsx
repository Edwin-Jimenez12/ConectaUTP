import type { ReactNode } from 'react';
import { ArrowUpRight, Mail } from 'lucide-react';
import { SiInstagram, SiWhatsapp } from 'react-icons/si';

const footerLinks = [
  { label: 'Inicio', href: '#inicio' },
  { label: 'Explora', href: '#explorar' },
  { label: 'Nosotros', href: '#nosotros' },
  { label: 'Tu opinión', href: '#contactanos' },
  { label: 'Destacadas', href: '#planes' },
];

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-[#101625] text-white">
      <div className="pointer-events-none absolute -right-40 -top-48 h-96 w-96 rounded-full bg-[#315de5]/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-56 left-1/3 h-96 w-96 rounded-full bg-[#7b32ca]/15 blur-3xl" />
      <div className="relative mx-auto w-[calc(100%-48px)] max-w-7xl py-14">
        <div className="grid grid-cols-[1.4fr_0.8fr_1fr] gap-12 max-lg:grid-cols-2 max-md:grid-cols-1 max-md:gap-9">
          <div className="max-w-sm">
            <div className="mt-5"><img src="/LogoBlanco.svg" className='h-10 w-auto' alt="" /></div>
            <p className="mt-4 max-w-xs text-base leading-7 text-white/70">
              Lo que necesitas, dentro de tu comunidad. Comparte lo que sabes
              y encuentra personas que pueden ayudarte.
            </p>
            <a className="mt-6 inline-flex min-h-10 items-center rounded-md border border-white/30 px-4 text-sm font-semibold text-white transition-colors hover:border-white hover:bg-white hover:text-[#182044] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white" href="#registro">
              Únete a ConectaUTP <ArrowUpRight aria-hidden="true" className="ml-2 h-4 w-4" />
            </a>
          </div>
          <div>
            <h2 className="mb-4 text-lg font-semibold">Explora</h2>
            <nav className="flex flex-col gap-3" aria-label="Navegación del pie de página">
              {footerLinks.map((link) => (
                <a className="w-fit text-sm text-white/70 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white" key={link.label} href={link.href}>{link.label}</a>
              ))}
            </nav>
          </div>
          <div>
            <h2 className="mb-4 text-lg font-semibold">Conecta con nosotros</h2>
            <p className="max-w-xs text-sm leading-6 text-white/70">Síguenos y mantente al día con nuevas oportunidades dentro de la comunidad.</p>
            <div className="mt-5 flex gap-3" aria-label="Redes sociales">
              <SocialLink href="#instagram" label="Instagram"><SiInstagram aria-hidden="true" className="h-5 w-5" /></SocialLink>
              <SocialLink href="#whatsapp" label="WhatsApp"><SiWhatsapp aria-hidden="true" className="h-5 w-5" /></SocialLink>
              <SocialLink href="#correo" label="Correo electrónico"><Mail aria-hidden="true" className="h-5 w-5" /></SocialLink>
            </div>
          </div>
        </div>
        <div className="mt-12 flex items-center justify-between gap-4 border-t border-white/15 pt-5 text-xs text-white/55 max-sm:flex-col max-sm:items-start">
          <span>© 2026 ConectaUTP. Todos los derechos reservados.</span>
          <span className="inline-flex items-center ">Desarrollado por | <img src="/NexDigital.svg" className="h-15 w-auto opacity-70" alt="Nex Digital" /></span>
        </div>
      </div>
    </footer>
  );
}

function SocialLink({ children, href, label }: { children: ReactNode; href: string; label: string }) {
  return <a className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white/80 transition-all hover:-translate-y-1 hover:border-white hover:bg-white hover:text-[#182044] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white" href={href} aria-label={label}>{children}</a>;
}
