interface BrandProps {
  inverted?: boolean;
}

export function Brand({ inverted = false }: BrandProps) {
  return (
    <a
      className={`inline-flex items-center text-[23px] font-bold tracking-[-1.3px] leading-none ${
        inverted ? 'text-white' : 'text-[#141414]'
      }`}
      href="#inicio"
      aria-label="ConectaUTP, volver al inicio"
    >
      <img className="mr-[-2px] h-[30px] w-[30px]" src="/Logo.svg" alt="" aria-hidden="true" />
      <span>onecta <strong className={inverted ? 'text-white' : 'text-[#7b32ca]'}>UTP</strong></span>
    </a>
  );
}
