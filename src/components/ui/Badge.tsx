import { type HTMLAttributes, type ReactNode } from 'react';
import clsx from 'clsx';

type BadgeVariant = 'default' | 'fire' | 'earth' | 'air' | 'water' | 'accent';
type BadgeSize = 'sm' | 'md';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  children: ReactNode;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-[#1a1a24] text-[#8888a0]',
  fire: 'bg-red-500/15 text-red-400',
  earth: 'bg-emerald-500/15 text-emerald-400',
  air: 'bg-blue-500/15 text-blue-400',
  water: 'bg-teal-500/15 text-teal-400',
  accent: 'bg-violet-500/15 text-violet-400',
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-[10px]',
  md: 'px-3 py-1 text-xs',
};

function Badge({
  variant = 'default',
  size = 'md',
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center justify-center',
        'rounded-full uppercase font-bold tracking-wider',
        'select-none whitespace-nowrap',
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export { Badge };
export type { BadgeProps, BadgeVariant, BadgeSize };
