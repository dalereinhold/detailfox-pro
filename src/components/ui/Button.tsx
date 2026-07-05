import { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
}

const VARIANTS: Record<Variant, string> = {
  primary:
    'bg-zinc-900 text-white hover:bg-zinc-800 disabled:bg-zinc-200 disabled:text-zinc-400 disabled:cursor-not-allowed',
  secondary:
    'bg-white text-zinc-900 border border-zinc-300 hover:border-zinc-900 disabled:opacity-50 disabled:cursor-not-allowed',
  ghost:
    'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 disabled:opacity-50 disabled:cursor-not-allowed',
  danger:
    'bg-white text-red-600 border border-red-300 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed',
};

const SIZES: Record<Size, string> = {
  sm: 'text-xs font-bold uppercase tracking-widest px-3 py-2 gap-1.5',
  md: 'text-sm font-semibold px-5 py-3 gap-2',
  lg: 'text-base font-semibold px-6 py-3.5 gap-2',
};

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-lg transition-colors ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
