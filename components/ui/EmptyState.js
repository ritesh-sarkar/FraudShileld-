'use client';

import { Inbox } from 'lucide-react';
import Button from './Button';
import { cn } from '@/lib/utils';

export default function EmptyState({
  icon: Icon = Inbox,
  title = 'No matching records',
  description = 'Adjust your filters or query parameters to inspect available records.',
  actionLabel = null,
  onAction = null,
  secondaryActionLabel = null,
  onSecondaryAction = null,
  className,
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-lg border border-dashed border-[#CBD5E1] bg-white px-6 py-12 text-center',
        className
      )}
    >
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-md border border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B]">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="font-display text-sm font-semibold text-[#0F172A]">{title}</h3>
      <p className="mt-1.5 max-w-md text-xs leading-relaxed text-[#64748B]">{description}</p>
      {(actionLabel || secondaryActionLabel) && (
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
          {actionLabel && onAction && (
            <Button variant="primary" size="sm" onClick={onAction}>
              {actionLabel}
            </Button>
          )}
          {secondaryActionLabel && onSecondaryAction && (
            <Button variant="secondary" size="sm" onClick={onSecondaryAction}>
              {secondaryActionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
