import type { ButtonHTMLAttributes, ReactNode } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'outline';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
}

export function Button({
  children,
  variant = 'primary',
  className = '',
  ...props
}: ButtonProps) {
  const variantClasses = {
    primary: 'border-[#7b32ca] bg-[#7b32ca] text-white',
    secondary: 'border-[#d9d2eb] bg-white text-[#5420a8]',
    outline: 'border-[#a96be0] bg-transparent text-[#7b32ca]',
  };
  const classes = [
    'min-h-10 cursor-pointer rounded-[7px] border px-6 text-sm font-semibold disabled:cursor-not-allowed',
    'transition-transform duration-150 hover:-translate-y-px',
    variantClasses[variant],
    className,
  ].join(' ');

  return (
    <button className={classes} type="button" {...props}>
      {children}
    </button>
  );
}
