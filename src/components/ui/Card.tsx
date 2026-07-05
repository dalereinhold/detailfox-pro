import { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function Card({ className = '', children, ...rest }: CardProps) {
  return (
    <div
      className={`bg-white border border-zinc-200 rounded-2xl ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function CardHeader({ className = '', children, ...rest }: CardHeaderProps) {
  return (
    <div
      className={`flex items-center justify-between gap-2 px-5 py-4 border-b border-zinc-200 bg-zinc-100 ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}

interface CardBodyProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function CardBody({ className = '', children, ...rest }: CardBodyProps) {
  return (
    <div className={`p-5 ${className}`} {...rest}>
      {children}
    </div>
  );
}
