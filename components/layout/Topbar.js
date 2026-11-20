'use client';

import { useMemo, useState } from 'react';
import {
  Bell,
  CheckCheck,
  ChevronRight,
  Menu,
  Pause,
  Play,
  Radio,
  Search,
} from 'lucide-react';
import Badge from '@/components/ui/Badge';
import { formatCurrency, formatRelativeAge } from '@/lib/utils';

export default function Topbar({
  currentNav,
  transactions = [],
  notifications = [],
  monitoringActive = true,
  onToggleMonitoring,
  onOpenMobileMenu,
  onSelectTransaction,
  onSelectAccount,
  onMarkAllNotificationsRead,
  onMarkNotificationRead,
  onOpenProfile,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return { transactions: [], accounts: [] };

    const txMatches = transactions
      .filter(
        (tx) =>
          tx.id.toLowerCase().includes(q) ||
          tx.senderAccount.toLowerCase().includes(q) ||
          tx.receiverAccount.toLowerCase().includes(q) ||
          tx.senderName.toLowerCase().includes(q) ||
          tx.receiverName.toLowerCase().includes(q)
      )
      .slice(0, 5);

    const accountMap = new Map();
    transactions.forEach((tx) => {
      if (tx.senderAccount.toLowerCase().includes(q) || tx.senderName.toLowerCase().includes(q)) {
        accountMap.set(tx.senderAccount, tx.senderName);
      }
      if (
        tx.receiverAccount.toLowerCase().includes(q) ||
        tx.receiverName.toLowerCase().includes(q)
      ) {
        accountMap.set(tx.receiverAccount, tx.receiverName);
      }
    });

    const accounts = Array.from(accountMap.entries())
      .slice(0, 4)
      .map(([id, name]) => ({ id, name }));

    return { transactions: txMatches, accounts };
  }, [searchQuery, transactions]);

  const hasResults =
    searchResults.transactions.length > 0 || searchResults.accounts.length > 0;

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-[#E2E8F0] bg-white/95 px-4 backdrop-blur sm:px-6">
      {/* Left: Mobile Trigger + Breadcrumb & Page Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          aria-label="Open navigation menu"
          className="flex lg:hidden h-9 w-9 shrink-0 items-center justify-center rounded-md border border-[#CBD5E1] bg-white text-[#0F172A] hover:bg-[#F8FAFC] cursor-pointer"
        >
          <Menu className="h-4 w-4" />
        </button>

        <div className="min-w-0">
          <div className="hidden sm:flex items-center gap-1 text-[11px] text-[#64748B]">
            {(currentNav?.breadcrumb || ['FraudShield', 'Overview']).map((crumb, idx, arr) => (
              <span key={crumb} className="inline-flex items-center gap-1 whitespace-nowrap">
                <span className={idx === arr.length - 1 ? 'text-[#0F172A] font-medium' : ''}>{crumb}</span>
                {idx < arr.length - 1 && <ChevronRight className="h-3 w-3 text-[#94A3B8]" />}
              </span>
            ))}
          </div>
          <h1 className="font-display text-sm font-semibold tracking-tight text-[#0F172A] sm:text-base truncate">
            {currentNav?.title || 'Security Overview'}
          </h1>
        </div>
      </div>

      {/* Right: Search, Monitoring Indicator, Notifications, Profile */}
      <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
        {/* Global Search */}
        <div className="relative hidden md:block w-60 xl:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#64748B]" />
          <input
            type="text"
            value={searchQuery}
            onFocus={() => setSearchOpen(true)}
            onBlur={() => setTimeout(() => setSearchOpen(false), 160)}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSearchOpen(true);
            }}
            placeholder="Search TXN or ACC ID..."
            aria-label="Search transactions or accounts"
            className="h-9 w-full rounded-md border border-[#CBD5E1] bg-white pl-8 pr-3 font-mono text-xs text-[#0F172A] placeholder:text-[#94A3B8] focus:border-[#0284C7] focus:outline-none"
          />

          {searchOpen && searchQuery.trim().length > 0 && (
            <div className="absolute right-0 top-10 z-40 w-80 overflow-hidden rounded-md border border-[#CBD5E1] bg-white shadow-xl">
              {!hasResults ? (
                <div className="px-4 py-4 text-xs text-[#64748B]">
                  No prototype transactions or accounts match &ldquo;{searchQuery}&rdquo;.
                </div>
              ) : (
                <div className="max-h-80 overflow-y-auto divide-y divide-[#F1F5F9]">
                  {searchResults.transactions.length > 0 && (
                    <div className="p-2">
                      <div className="px-2 py-1 text-[10px] font-medium text-[#64748B]">
                        Transactions
                      </div>
                      {searchResults.transactions.map((tx) => (
                        <button
                          key={tx.id}
                          type="button"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            setSearchQuery('');
                            setSearchOpen(false);
                            onSelectTransaction?.(tx.id);
                          }}
                          className="flex w-full items-center justify-between gap-2 rounded px-2 py-2 text-left text-xs hover:bg-[#F8FAFC] cursor-pointer"
                        >
                          <div className="min-w-0">
                            <div className="font-mono font-medium text-[#0284C7]">{tx.id}</div>
                            <div className="truncate font-mono text-[10px] text-[#64748B]">
                              {tx.senderAccount} → {tx.receiverAccount}
                            </div>
                          </div>
                          <div className="text-right font-mono tabular-nums shrink-0">
                            <div className="font-medium text-[#0F172A]">{formatCurrency(tx.amount, { maximumFractionDigits: 0 })}</div>
                            <div className="text-[10px] text-[#64748B]">Score {tx.riskScore}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {searchResults.accounts.length > 0 && (
                    <div className="p-2">
                      <div className="px-2 py-1 text-[10px] font-medium text-[#64748B]">
                        Accounts (Open in Graph)
                      </div>
                      {searchResults.accounts.map((acc) => (
                        <button
                          key={acc.id}
                          type="button"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            setSearchQuery('');
                            setSearchOpen(false);
                            onSelectAccount?.(acc.id);
                          }}
                          className="flex w-full items-center justify-between gap-2 rounded px-2 py-1.5 text-left text-xs hover:bg-[#F8FAFC] cursor-pointer"
                        >
                          <span className="font-mono font-medium text-[#0F172A]">{acc.id}</span>
                          <span className="truncate text-[11px] text-[#64748B]">{acc.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Live Monitoring Indicator (Interactive Simulated Stream Toggle) */}
        <button
          type="button"
          onClick={onToggleMonitoring}
          title="Toggle simulated live monitoring feed"
          className={`hidden sm:inline-flex h-9 items-center gap-2 rounded-md border px-3 text-xs font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
            monitoringActive
              ? 'border-[#BBF7D0] bg-[#F0FDF4] text-[#15803D] hover:bg-[#DCFCE7]'
              : 'border-[#CBD5E1] bg-white text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F172A]'
          }`}
        >
          <Radio className="h-3.5 w-3.5" />
          <span>{monitoringActive ? 'Monitoring: Simulated' : 'Monitoring: Paused'}</span>
          {monitoringActive ? (
            <Pause className="h-3 w-3 opacity-75" />
          ) : (
            <Play className="h-3 w-3 opacity-75" />
          )}
        </button>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setNotifOpen((prev) => !prev)}
            aria-label={`Notifications (${unreadCount} unread)`}
            className="relative flex h-9 w-9 items-center justify-center rounded-md border border-[#CBD5E1] bg-white text-[#475569] transition-colors hover:border-[#94A3B8] hover:bg-[#F8FAFC] hover:text-[#0F172A] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0284C7]"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded bg-[#DC2626] px-1 font-mono text-[10px] font-semibold text-white">
                {unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setNotifOpen(false)}
                aria-hidden="true"
              />
              <div className="absolute right-0 top-11 z-40 w-80 sm:w-96 overflow-hidden rounded-lg border border-[#CBD5E1] bg-white shadow-xl">
                <div className="flex items-center justify-between border-b border-[#E2E8F0] px-4 py-3">
                  <div>
                    <div className="text-xs font-semibold text-[#0F172A]">Fraud Alert Feed</div>
                    <div className="text-[11px] text-[#64748B]">
                      Prototype notifications ({unreadCount} unread)
                    </div>
                  </div>
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={() => onMarkAllNotificationsRead?.()}
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-[#0284C7] hover:underline cursor-pointer"
                    >
                      <CheckCheck className="h-3.5 w-3.5" />
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-80 divide-y divide-[#F1F5F9] overflow-y-auto">
                  {notifications.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        onMarkNotificationRead?.(item.id);
                        setNotifOpen(false);
                        onSelectTransaction?.(item.transactionId);
                      }}
                      className={`flex w-full flex-col gap-1.5 px-4 py-3 text-left transition-colors hover:bg-[#F8FAFC] cursor-pointer ${
                        item.read ? 'opacity-70 bg-white' : 'bg-[#F0F9FF]/60'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Badge variant={item.severity === 'CRITICAL' ? 'critical' : 'high'}>
                            {item.severity}
                          </Badge>
                          <span className="font-mono text-[11px] font-semibold text-[#0284C7]">
                            {item.transactionId}
                          </span>
                        </div>
                        <span className="font-mono text-[10px] tabular-nums text-[#64748B]">
                          {formatRelativeAge(item.timestamp)}
                        </span>
                      </div>
                      <div className="text-xs font-medium text-[#0F172A]">{item.title}</div>
                      <div className="text-[11px] leading-relaxed text-[#475569]">
                        {item.detail}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Profile Avatar */}
        <button
          type="button"
          onClick={onOpenProfile}
          aria-label="Open analyst profile"
          className="flex h-9 w-9 items-center justify-center rounded-md border border-[#CBD5E1] bg-[#F8FAFC] font-mono text-xs font-semibold text-[#0284C7] transition-colors hover:border-[#0284C7] hover:bg-[#F0F9FF] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0284C7]"
        >
          EV
        </button>
      </div>
    </header>
  );
}
