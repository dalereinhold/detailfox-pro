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
    'bg-brand-primary text-white hover:bg-brand-primary disabled:bg-background-elevated disabled:text-foreground-tertiary disabled:cursor-not-allowed',
  secondary:
    'bg-background-surface text-foreground-primary border border-border-default hover:border-foreground-primary disabled:opacity-50 disabled:cursor-not-allowed',
  ghost:
    'text-foreground-tertiary hover:text-foreground-primary hover:bg-background-elevated disabled:opacity-50 disabled:cursor-not-allowed',
  danger:
    'bg-background-surface text-brand-danger border border-brand-danger hover:bg-background-elevated disabled:opacity-50 disabled:cursor-not-allowed',
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
      className={`inline-flex items-center justify-center rounded-none transition-colors ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
