import { cn } from '@/lib/utils';

const VARIANT_CLASSES = {
  neutral: 'text-[#475569] bg-[#F1F5F9] border-[#CBD5E1]',
  cyan: 'text-[#0369A1] bg-[#F0F9FF] border-[#BAE6FD]',
  violet: 'text-[#6D28D9] bg-[#F5F3FF] border-[#DDD6FE]',
  success: 'text-[#15803D] bg-[#F0FDF4] border-[#BBF7D0]',
  warning: 'text-[#B45309] bg-[#FFFBEB] border-[#FDE68A]',
  high: 'text-[#C2410C] bg-[#FFF7ED] border-[#FED7AA]',
  critical: 'text-[#B91C1C] bg-[#FEF2F2] border-[#FECACA]',
};

export default function Badge({ children, variant = 'neutral', mono = false, className }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded border px-2 py-0.5 text-[11px] font-medium leading-4 whitespace-nowrap shrink-0',
        mono && 'font-mono tabular-nums',
        VARIANT_CLASSES[variant] || VARIANT_CLASSES.neutral,
        className
      )}
    >
      {children}
    </span>
  );
}
