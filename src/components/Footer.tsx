import type { ReactNode } from 'react';

const footerLinks = [
  { label: 'Inicio', href: '#inicio' },
  { label: 'Explora', href: '#explorar' },
  { label: 'Nosotros', href: '#nosotros' },
  { label: 'Contáctanos', href: '#contactanos' },
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
              Únete a ConectaUTP <span className="ml-2" aria-hidden="true">↗</span>
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
              <SocialLink href="#instagram" label="Instagram"><InstagramIcon /></SocialLink>
              <SocialLink href="#whatsapp" label="WhatsApp"><WhatsAppIcon /></SocialLink>
              <SocialLink href="#correo" label="Correo electrónico"><EmailIcon /></SocialLink>
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

function InstagramIcon() {
  return <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r=".8" fill="currentColor" stroke="none" /></svg>;
}

function WhatsAppIcon() {
  return <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path d="M20 11.5a8 8 0 0 1-11.8 7L4 20l1.5-4A8 8 0 1 1 20 11.5Z" /><path d="M9 8.5c.2-.4.5-.4.8-.3l.8.9c.2.2.2.5 0 .8l-.4.5c.5 1 1.2 1.7 2.2 2.2l.5-.4c.3-.2.6-.2.8 0l.9.8c.2.2.1.6-.2.8-.5.4-1.1.5-1.7.3-2.6-.8-4.5-2.7-5.3-5.3-.2-.6-.1-1.2.3-1.7Z" /></svg>;
}

function EmailIcon() {
  return <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m4 7 8 6 8-6" /></svg>;
}
