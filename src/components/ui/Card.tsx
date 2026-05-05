'use client';

import { type HTMLAttributes, type ReactNode } from 'react';
import clsx from 'clsx';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hover?: boolean;
  glow?: boolean;
  padding?: string;
}

function Card({
  children,
  hover = false,
  glow = false,
  padding = 'p-6',
  className,
  ...props
}: CardProps) {
  return (
    <div
      className={clsx(
        'bg-[#111118] border border-[#2a2a3a] rounded-2xl',
        padding,
        hover && 'card-hover',
        glow && 'border-violet-400/30 shadow-[0_0_20px_rgba(167,139,250,0.08)]',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export { Card };
export type { CardProps };
