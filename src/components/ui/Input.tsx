'use client';

import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import clsx from 'clsx';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-[#8888a0] font-heading"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#55556a] pointer-events-none">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={clsx(
              'w-full bg-[#111118] text-[#f0f0f5] placeholder-[#55556a]',
              'border border-[#2a2a3a] rounded-xl',
              'px-4 py-2.5 text-sm',
              'transition-all duration-200',
              'focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              icon && 'pl-11',
              error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
              className,
            )}
            {...props}
          />
        </div>
        {error && (
          <p className="text-xs text-red-400 mt-0.5">{error}</p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';

export { Input };
export type { InputProps };
