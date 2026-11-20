'use client';

import { cn } from '@/lib/utils';

const VARIANT_STYLES = {
  primary:
    'bg-[#0284C7] text-white hover:bg-[#0369A1] border border-[#0284C7] font-semibold',
  secondary:
    'bg-white text-[#0F172A] hover:bg-[#F8FAFC] border border-[#CBD5E1] hover:border-[#94A3B8]',
  ghost:
    'bg-transparent text-[#475569] hover:text-[#0F172A] hover:bg-[#F1F5F9] border border-transparent',
  danger:
    'bg-[#FEF2F2] text-[#B91C1C] hover:bg-[#FEE2E2] border border-[#FECACA]',
  warning:
    'bg-[#FFFBEB] text-[#B45309] hover:bg-[#FEF3C7] border border-[#FDE68A]',
  success:
    'bg-[#F0FDF4] text-[#15803D] hover:bg-[#DCFCE7] border border-[#BBF7D0]',
  violet:
    'bg-[#F5F3FF] text-[#6D28D9] hover:bg-[#EDE9FE] border border-[#DDD6FE]',
};

const SIZE_STYLES = {
  xs: 'h-8 px-2.5 text-xs gap-1.5',
  sm: 'h-9 px-3.5 text-xs gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
};

export default function Button({
  children,
  variant = 'secondary',
  size = 'sm',
  type = 'button',
  disabled = false,
  className,
  onClick,
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'inline-flex items-center justify-center rounded-md font-medium whitespace-nowrap shrink-0 transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0284C7] focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:opacity-45 disabled:pointer-events-none',
        VARIANT_STYLES[variant] || VARIANT_STYLES.secondary,
        SIZE_STYLES[size] || SIZE_STYLES.sm,
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
