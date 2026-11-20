import { cn } from '@/lib/utils';

function resolveFillColor(value, tone) {
  if (tone === 'cyan') return 'bg-[#0284C7]';
  if (tone === 'violet') return 'bg-[#7C3AED]';
  if (tone === 'success') return 'bg-[#16A34A]';
  if (tone === 'warning') return 'bg-[#D97706]';
  if (tone === 'high') return 'bg-[#EA580C]';
  if (tone === 'critical') return 'bg-[#DC2626]';

  if (value >= 80) return 'bg-[#DC2626]';
  if (value >= 60) return 'bg-[#EA580C]';
  if (value >= 30) return 'bg-[#D97706]';
  return 'bg-[#16A34A]';
}

export default function ProgressBar({
  value = 0,
  max = 100,
  tone = 'auto',
  height = 'sm',
  showValue = false,
  className,
}) {
  const numeric = Math.max(0, Math.min(max, Number(value) || 0));
  const percent = max > 0 ? Math.round((numeric / max) * 100) : 0;

  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <div
        className={cn(
          'w-full overflow-hidden rounded-sm bg-[#E2E8F0]',
          height === 'md' ? 'h-2' : 'h-1.5'
        )}
        role="progressbar"
        aria-valuenow={numeric}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        <div
          className={cn('h-full rounded-sm transition-all duration-200', resolveFillColor(percent, tone))}
          style={{ width: `${percent}%` }}
        />
      </div>
      {showValue && (
        <span className="w-9 text-right font-mono text-xs tabular-nums text-[#0F172A]">
          {numeric}
        </span>
      )}
    </div>
  );
}
