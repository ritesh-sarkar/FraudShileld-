'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  variant = 'drawer', // 'drawer' | 'center'
  size = 'lg', // 'md' | 'lg' | 'xl'
  headerExtra = null,
}) {
  useEffect(() => {
    if (!isOpen) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose?.();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const drawerWidth =
    size === 'xl'
      ? 'max-w-4xl'
      : size === 'md'
        ? 'max-w-xl'
        : 'max-w-3xl';

  const centerWidth =
    size === 'xl'
      ? 'max-w-3xl'
      : size === 'md'
        ? 'max-w-lg'
        : 'max-w-2xl';

  return (
    <div
      className="fixed inset-0 z-50 flex"
      role="dialog"
      aria-modal="true"
      aria-label={title || 'Dialog'}
    >
      <div
        className="fixed inset-0 bg-[#0F172A]/45 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden="true"
      />

      {variant === 'drawer' ? (
        <div
          className={cn(
            'relative z-10 ml-auto flex h-full w-full flex-col border-l border-[#E2E8F0] bg-[#F8FAFC] text-[#0F172A] shadow-2xl',
            drawerWidth
          )}
        >
          <div className="flex items-start justify-between gap-4 border-b border-[#E2E8F0] bg-white px-5 py-4 sm:px-6">
            <div className="min-w-0">
              {title && (
                <h2 className="font-display text-base font-semibold tracking-tight text-[#0F172A] truncate">
                  {title}
                </h2>
              )}
              {subtitle && (
                <p className="mt-0.5 text-xs text-[#64748B]">{subtitle}</p>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {headerExtra}
              <button
                type="button"
                onClick={onClose}
                aria-label="Close panel"
                className="flex h-9 w-9 items-center justify-center rounded-md border border-[#CBD5E1] bg-white text-[#64748B] transition-colors hover:bg-[#F1F5F9] hover:text-[#0F172A] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0284C7]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">{children}</div>
        </div>
      ) : (
        <div className="relative z-10 m-auto w-full p-4">
          <div
            className={cn(
              'mx-auto flex max-h-[88vh] w-full flex-col overflow-hidden rounded-lg border border-[#E2E8F0] bg-white text-[#0F172A] shadow-2xl',
              centerWidth
            )}
          >
            <div className="flex items-start justify-between gap-4 border-b border-[#E2E8F0] px-5 py-4">
              <div className="min-w-0">
                {title && (
                  <h2 className="font-display text-base font-semibold tracking-tight text-[#0F172A]">
                    {title}
                  </h2>
                )}
                {subtitle && (
                  <p className="mt-0.5 text-xs text-[#64748B]">{subtitle}</p>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close modal"
                className="flex h-9 w-9 items-center justify-center rounded-md border border-[#CBD5E1] bg-white text-[#64748B] transition-colors hover:bg-[#F1F5F9] hover:text-[#0F172A] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0284C7]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">{children}</div>
          </div>
        </div>
      )}
    </div>
  );
}
