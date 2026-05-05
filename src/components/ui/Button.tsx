'use client';

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import clsx from 'clsx';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
  children: ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: clsx(
    'bg-violet-400 text-[#0a0a0f] font-bold',
    'hover:bg-violet-300 hover:shadow-[0_0_20px_rgba(167,139,250,0.3),0_0_60px_rgba(167,139,250,0.15)]',
    'active:bg-violet-500',
  ),
  secondary: clsx(
    'bg-[#111118] text-[#f0f0f5] border border-[#2a2a3a]',
    'hover:bg-[#1a1a24] hover:border-[#3a3a4a]',
    'active:bg-[#111118]',
  ),
  ghost: clsx(
    'bg-transparent text-[#8888a0]',
    'hover:bg-[#1a1a24] hover:text-[#f0f0f5]',
    'active:bg-[#111118]',
  ),
  outline: clsx(
    'bg-transparent text-[#f0f0f5] border border-[#2a2a3a]',
    'hover:border-violet-400 hover:text-violet-400',
    'active:bg-[#1a1a24]',
  ),
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
  md: 'px-5 py-2.5 text-sm rounded-xl gap-2',
  lg: 'px-7 py-3.5 text-base rounded-xl gap-2.5',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      loading = false,
      disabled,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={clsx(
          'inline-flex items-center justify-center font-heading font-semibold',
          'transition-all duration-200 ease-out',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0f]',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
          'cursor-pointer select-none',
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && 'w-full',
          className,
        )}
        {...props}
      >
        {loading && (
          <Loader2 className="animate-spin shrink-0" size={size === 'sm' ? 14 : size === 'md' ? 16 : 18} />
        )}
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';

export { Button };
export type { ButtonProps, ButtonVariant, ButtonSize };
