import { Button } from './Button';

export function Banner() {
  return (
    <section className="mx-auto mb-[38px] flex min-h-[90px] w-[calc(100%-48px)] max-w-[1080px] items-center gap-7 rounded-xl bg-linear-to-r from-[#3d44da] to-[#7b32ca] px-9 py-[15px] text-white">
      <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-white/70 text-[29px]" aria-hidden="true">♧</div>
      <div>
        <h2 className="mb-[5px] text-[17px]">¿Tienes una habilidad que compartir?</h2>
        <p className="text-[10px] leading-[1.35]">Publica tu servicio y conecta con personas<br />de tu comunidad.</p>
      </div>
      <Button variant="secondary" className="ml-auto min-w-[150px]">Publicar mi servicio</Button>
    </section>
  );
}
