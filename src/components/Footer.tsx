import type { ReactNode } from 'react';
import { ArrowUpRight, Mail } from 'lucide-react';
import { SiInstagram, SiWhatsapp } from 'react-icons/si';
import { useAuth } from '../auth/useAuth';

const footerLinks = [
  { label: 'Inicio', href: '#inicio' },
  { label: 'Explora', href: '#explorar' },
  { label: 'Nosotros', href: '#nosotros' },
  { label: 'Tu opinión', href: '#contactanos' },
  { label: 'Destacadas', href: '#planes' },
  { label: 'Actualizaciones', href: '#actualizaciones' },
];

export function Footer() {
  const { session } = useAuth();
  const visibleFooterLinks = session ? footerLinks.filter((link) => link.href !== '#nosotros') : footerLinks;

  return (
    <footer className="site-footer relative overflow-hidden">
      <div className="site-footer-orb site-footer-orb-blue pointer-events-none absolute -right-40 -top-48 h-96 w-96 rounded-full blur-3xl" />
      <div className="site-footer-orb site-footer-orb-purple pointer-events-none absolute -bottom-56 left-1/3 h-96 w-96 rounded-full blur-3xl" />
      <div className="relative mx-auto w-[calc(100%-48px)] max-w-7xl py-5">
        <div className="grid grid-cols-[1.4fr_0.8fr_1fr] gap-12 max-lg:grid-cols-2 max-md:grid-cols-1 max-md:gap-9">
          <div className="max-w-sm">
            <div className="mt-5">
              <img src="/LogoCompleto.svg" className="site-footer-logo-light h-10 w-auto" alt="ConectaUTP" />
              <img src="/LogoBlanco.svg" className="site-footer-logo-dark h-10 w-auto" alt="ConectaUTP" />
            </div>
            <p className="site-footer-muted mt-4 max-w-xs text-base leading-7">
              Lo que necesitas, dentro de tu comunidad. Comparte lo que sabes
              y encuentra personas que pueden ayudarte.
            </p>
            {!session && <a className="site-footer-join mt-6 inline-flex min-h-10 items-center rounded-md border px-4 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2" href="#registro">
              Únete a ConectaUTP <ArrowUpRight aria-hidden="true" className="ml-2 h-4 w-4" />
            </a>}
          </div>
          <div>
            <h2 className="site-footer-heading mb-4 text-lg font-semibold">Explora</h2>
            <nav className="flex flex-col gap-3" aria-label="Navegación del pie de página">
              {visibleFooterLinks.map((link) => (
                <a className="site-footer-link w-fit text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-4" key={link.label} href={link.href}>{link.label}</a>
              ))}
            </nav>
          </div>
          <div>
            <h2 className="site-footer-heading mb-4 text-lg font-semibold">Conecta con nosotros</h2>
            <p className="site-footer-muted max-w-xs text-sm leading-6">Síguenos y mantente al día con nuevas oportunidades dentro de la comunidad.</p>
            <div className="mt-5 flex gap-3" aria-label="Redes sociales">
              <SocialLink href="https://www.instagram.com/conectautp/" label="Instagram" external><SiInstagram aria-hidden="true" className="h-5 w-5" /></SocialLink>
              <SocialLink href="https://wa.me/50765591976" label="WhatsApp" external><SiWhatsapp aria-hidden="true" className="h-5 w-5" /></SocialLink>
              <SocialLink href="mailto:conectautp2@gmail.com" label="Correo electrónico"><Mail aria-hidden="true" className="h-5 w-5" /></SocialLink>
            </div>
          </div>
        </div>
        <div className="site-footer-bottom mt-12 flex items-center justify-between gap-4 border-t pt-5 text-xs max-sm:flex-col max-sm:items-start">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <span>© 2026 ConectaUTP. Todos los derechos reservados.</span>
            <a className="site-footer-link transition-colors" href="#terminos">Términos y condiciones</a>
            <a className="site-footer-link transition-colors" href="#politica-privacidad">Política de privacidad</a>
          </div>
          <span className="site-footer-credit inline-flex items-center">Desarrollado por | <img src="/NexDigital.svg" className="site-footer-credit-logo h-15 w-auto" alt="Nex Digital" /></span>
        </div>
      </div>
    </footer>
  );
}

function SocialLink({ children, href, label, external = false }: { children: ReactNode; href: string; label: string; external?: boolean }) {
  return <a className="site-footer-social flex h-10 w-10 items-center justify-center rounded-full border transition-all hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-2" href={href} aria-label={label} target={external ? '_blank' : undefined} rel={external ? 'noreferrer' : undefined}>{children}</a>;
}
