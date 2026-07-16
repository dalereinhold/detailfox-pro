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
    'bg-indigo-600 text-white hover:bg-indigo-500 disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed dark:bg-indigo-600 dark:text-white dark:hover:bg-indigo-500 dark:disabled:bg-slate-700 dark:disabled:text-slate-400',
  secondary:
    'bg-white text-zinc-900 border border-zinc-300 hover:border-zinc-900 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-slate-700 dark:text-slate-100 dark:border-slate-600 dark:hover:bg-slate-600',
  ghost:
    'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 disabled:opacity-50 disabled:cursor-not-allowed dark:text-slate-300 dark:hover:text-slate-100 dark:hover:bg-slate-700',
  danger:
    'bg-white text-red-600 border border-red-300 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-slate-800 dark:text-rose-300 dark:border-rose-800 dark:hover:bg-slate-700',
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
