import type { ReactNode } from 'react';
import { ArrowLeft, FileText } from 'lucide-react';

interface LegalDocumentProps {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}

export function LegalDocument({ eyebrow, title, description, children }: LegalDocumentProps) {
  return (
    <section className="mx-auto w-[calc(100%-48px)] max-w-4xl py-12 max-sm:py-8">
      <a className="inline-flex items-center gap-2 text-sm font-semibold text-[#5420a8] transition-colors hover:text-[#7b32ca]" href="#inicio"><ArrowLeft aria-hidden="true" className="h-4 w-4" />Volver al inicio</a>
      <header className="mt-8 border-b border-slate-200 pb-8">
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#7b32ca]"><FileText aria-hidden="true" className="h-4 w-4" />{eyebrow}</p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight max-sm:text-3xl">{title}</h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-[#676878]">{description}</p>
      </header>
      <article className="legal-document mt-8 space-y-8 text-sm leading-7 text-[#363744]">{children}</article>
    </section>
  );
}

export function LegalSection({ number, title, children }: { number: string; title: string; children: ReactNode }) {
  return <section><h2 className="text-xl font-semibold text-[#141414]"><span className="mr-2 text-[#7b32ca]">{number}.</span>{title}</h2><div className="mt-3 space-y-3">{children}</div></section>;
}

export function LegalList({ children }: { children: ReactNode }) {
  return <ul className="list-disc space-y-2 pl-5">{children}</ul>;
}
