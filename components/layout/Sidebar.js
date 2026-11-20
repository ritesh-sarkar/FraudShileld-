'use client';

import {
  Activity,
  BarChart3,
  FileSearch,
  GitBranch,
  LayoutDashboard,
  PanelLeftClose,
  PanelLeftOpen,
  Server,
  Settings,
  Shield,
  X,
} from 'lucide-react';
import { NAVIGATION_ITEMS } from '@/lib/constants';
import { cn } from '@/lib/utils';

const NAV_ICONS = {
  overview: LayoutDashboard,
  transactions: Activity,
  graph: GitBranch,
  investigations: FileSearch,
  performance: BarChart3,
};

export default function Sidebar({
  activeView,
  onSelectView,
  collapsed = false,
  onToggleCollapse,
  mobileOpen = false,
  onCloseMobile,
  criticalCount = 0,
  onOpenSettings,
  onOpenProfile,
  onOpenSystemStatus,
}) {
  const renderNavContent = (isCompact) => (
    <div className="flex h-full flex-col bg-white text-[#0F172A]">
      {/* Brand Lockup */}
      <div className="flex h-16 items-center justify-between gap-2 border-b border-[#E2E8F0] px-4">
        <button
          type="button"
          onClick={() => {
            onSelectView?.('overview');
            onCloseMobile?.();
          }}
          className="flex items-center gap-2.5 text-left min-w-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0284C7] rounded"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-[#BAE6FD] bg-[#F0F9FF] text-[#0284C7]">
            <Shield className="h-4 w-4" />
          </div>
          {!isCompact && (
            <div className="min-w-0">
              <div className="font-display text-sm font-bold tracking-tight text-[#0F172A] truncate">
                FraudShield
              </div>
              <div className="text-[11px] text-[#64748B] truncate">
                AI Fraud Intelligence
              </div>
            </div>
          )}
        </button>

        {/* Desktop Collapse Toggle */}
        <button
          type="button"
          onClick={onToggleCollapse}
          aria-label={isCompact ? 'Expand sidebar' : 'Collapse sidebar'}
          className="hidden lg:flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A] cursor-pointer"
        >
          {isCompact ? (
            <PanelLeftOpen className="h-4 w-4" />
          ) : (
            <PanelLeftClose className="h-4 w-4" />
          )}
        </button>

        {/* Mobile Close Button */}
        <button
          type="button"
          onClick={onCloseMobile}
          aria-label="Close navigation menu"
          className="flex lg:hidden h-8 w-8 shrink-0 items-center justify-center rounded-md text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A] cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Primary Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4" aria-label="Main navigation">
        {!isCompact && (
          <div className="mb-2 px-2.5 text-[11px] font-medium text-[#64748B]">
            Security Console
          </div>
        )}
        {NAVIGATION_ITEMS.map((item) => {
          const Icon = NAV_ICONS[item.id] || LayoutDashboard;
          const active = activeView === item.id;
          const showCount = item.id === 'investigations' && criticalCount > 0;

          return (
            <button
              key={item.id}
              type="button"
              title={isCompact ? item.label : undefined}
              onClick={() => {
                onSelectView?.(item.id);
                onCloseMobile?.();
              }}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex w-full items-center gap-3 rounded-md px-2.5 py-2.5 text-xs font-medium transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0284C7]',
                active
                  ? 'bg-[#F0F9FF] text-[#0284C7] ring-1 ring-inset ring-[#BAE6FD]'
                  : 'text-[#475569] hover:bg-[#F8FAFC] hover:text-[#0F172A]',
                isCompact && 'justify-center px-0'
              )}
            >
              <Icon className={cn('h-4 w-4 shrink-0', active ? 'text-[#0284C7]' : 'text-[#64748B]')} />
              {!isCompact && (
                <>
                  <span className="flex-1 truncate text-left whitespace-nowrap">{item.label}</span>
                  {showCount && (
                    <span className="font-mono text-[11px] font-semibold tabular-nums text-[#DC2626]">
                      {criticalCount}
                    </span>
                  )}
                </>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Section: System Status, Profile, Settings */}
      <div className="border-t border-[#E2E8F0] p-3 space-y-1.5">
        <button
          type="button"
          onClick={() => {
            onOpenSystemStatus?.();
            onCloseMobile?.();
          }}
          title={isCompact ? 'System Status: Prototype Mode' : undefined}
          className={cn(
            'flex w-full items-center gap-2.5 rounded-md border border-[#E2E8F0] bg-[#F8FAFC] px-2.5 py-2 text-left transition-colors hover:border-[#CBD5E1] hover:bg-[#F1F5F9] cursor-pointer',
            isCompact && 'justify-center px-0'
          )}
        >
          <Server className="h-4 w-4 shrink-0 text-[#0284C7]" />
          {!isCompact && (
            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-medium text-[#0F172A] truncate">
                System Status
              </div>
              <div className="font-mono text-[10px] text-[#64748B] truncate">
                GNN Prototype · Mock Feed
              </div>
            </div>
          )}
        </button>

        <button
          type="button"
          onClick={() => {
            onOpenSettings?.();
            onCloseMobile?.();
          }}
          title={isCompact ? 'Settings & API Config' : undefined}
          className={cn(
            'flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-xs text-[#475569] transition-colors hover:bg-[#F8FAFC] hover:text-[#0F172A] cursor-pointer',
            isCompact && 'justify-center px-0'
          )}
        >
          <Settings className="h-4 w-4 shrink-0 text-[#64748B]" />
          {!isCompact && <span className="truncate">Settings</span>}
        </button>

        <button
          type="button"
          onClick={() => {
            onOpenProfile?.();
            onCloseMobile?.();
          }}
          title={isCompact ? 'Elena Vance — Lead Analyst' : undefined}
          className={cn(
            'flex w-full items-center gap-2.5 rounded-md border border-transparent px-2 py-2 text-left transition-colors hover:border-[#E2E8F0] hover:bg-[#F8FAFC] cursor-pointer',
            isCompact && 'justify-center px-0'
          )}
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-[#CBD5E1] bg-[#F8FAFC] font-mono text-xs font-semibold text-[#0284C7]">
            EV
          </div>
          {!isCompact && (
            <div className="min-w-0 flex-1">
              <div className="truncate text-xs font-medium text-[#0F172A]">Elena Vance</div>
              <div className="truncate text-[11px] text-[#64748B]">Lead Fraud Analyst</div>
            </div>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        className={cn(
          'hidden lg:block shrink-0 border-r border-[#E2E8F0] transition-all duration-150',
          collapsed ? 'w-[72px]' : 'w-64'
        )}
      >
        <div className="sticky top-0 h-screen">{renderNavContent(collapsed)}</div>
      </aside>

      {/* Mobile / Tablet Slide-over Sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-[#0F172A]/45 backdrop-blur-[2px]"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <aside className="relative z-10 h-full w-64 border-r border-[#E2E8F0] shadow-xl">
            {renderNavContent(false)}
          </aside>
        </div>
      )}
    </>
  );
}
