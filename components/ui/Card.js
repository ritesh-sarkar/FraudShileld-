import { cn } from '@/lib/utils';

export default function Card({
  title,
  subtitle,
  action,
  children,
  className,
  bodyClassName,
  noPadding = false,
}) {
  return (
    <section
      className={cn(
        'rounded-lg border border-[#E2E8F0] bg-white text-[#0F172A]',
        className
      )}
    >
      {(title || subtitle || action) && (
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#E2E8F0] px-5 py-4">
          <div className="min-w-0">
            {title && (
              <h2 className="font-display text-sm font-semibold tracking-tight text-[#0F172A]">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="mt-0.5 text-xs text-[#64748B]">{subtitle}</p>
            )}
          </div>
          {action && <div className="flex items-center gap-2 shrink-0">{action}</div>}
        </div>
      )}
      <div className={cn(!noPadding && 'p-5', bodyClassName)}>{children}</div>
    </section>
  );
}
