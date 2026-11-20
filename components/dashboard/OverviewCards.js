'use client';

import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';
import { formatCurrency, formatNumber } from '@/lib/utils';

export default function OverviewCards({ stats, loading = false, onNavigateFilter }) {
  if (loading || !stats) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((idx) => (
          <div
            key={idx}
            className="h-[132px] animate-pulse rounded-lg border border-[#E2E8F0] bg-white p-5"
          />
        ))}
      </div>
    );
  }

  const cards = [
    {
      id: 'total',
      label: 'Total Transactions',
      value: formatNumber(stats.totalTransactions.value),
      change: stats.totalTransactions.change,
      trend: stats.totalTransactions.trend,
      meta: `${stats.totalTransactions.sampleCount} active ledger rows · ${stats.totalTransactions.periodLabel}`,
      icon: Activity,
      accentClass: 'text-[#0284C7]',
      deltaClass: 'text-[#0284C7]',
      filterAction: { riskLevel: 'ALL', status: 'ALL' },
    },
    {
      id: 'fraud',
      label: 'Fraud Detected',
      value: formatNumber(stats.fraudDetected.value),
      change: stats.fraudDetected.change,
      trend: stats.fraudDetected.trend,
      meta: stats.fraudDetected.periodLabel,
      icon: ShieldAlert,
      accentClass: 'text-[#DC2626]',
      deltaClass: 'text-[#DC2626]',
      filterAction: { riskLevel: 'CRITICAL', status: 'ALL' },
    },
    {
      id: 'suspicious',
      label: 'Suspicious Transactions',
      value: formatNumber(stats.suspiciousTransactions.value),
      change: stats.suspiciousTransactions.change,
      trend: stats.suspiciousTransactions.trend,
      meta: stats.suspiciousTransactions.periodLabel,
      icon: AlertTriangle,
      accentClass: 'text-[#D97706]',
      deltaClass: 'text-[#15803D]',
      filterAction: { riskLevel: 'HIGH', status: 'ALL' },
    },
    {
      id: 'prevented',
      label: 'Amount Prevented',
      value: formatCurrency(stats.amountPrevented.value, { maximumFractionDigits: 0 }),
      change: stats.amountPrevented.change,
      trend: stats.amountPrevented.trend,
      meta: stats.amountPrevented.periodLabel,
      icon: ShieldCheck,
      accentClass: 'text-[#16A34A]',
      deltaClass: 'text-[#15803D]',
      filterAction: { riskLevel: 'ALL', status: 'Blocked' },
    },
  ];

  return (
    <div className="space-y-2.5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          const TrendIcon = card.trend === 'up' ? ArrowUpRight : ArrowDownRight;

          return (
            <button
              key={card.id}
              type="button"
              onClick={() => onNavigateFilter?.(card.filterAction)}
              className="group flex flex-col justify-between rounded-lg border border-[#E2E8F0] bg-white p-5 text-left transition-colors duration-150 hover:border-[#CBD5E1] hover:bg-[#F8FAFC] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0284C7]"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-[#64748B]">{card.label}</span>
                <Icon className={`h-4 w-4 shrink-0 ${card.accentClass}`} />
              </div>

              <div className="mt-3 flex items-baseline justify-between gap-2">
                <span className="font-mono text-2xl font-semibold tracking-tight tabular-nums text-[#0F172A]">
                  {card.value}
                </span>
                <span
                  className={`inline-flex items-center gap-0.5 font-mono text-xs font-medium tabular-nums ${card.deltaClass}`}
                >
                  <TrendIcon className="h-3.5 w-3.5" />
                  {card.change}
                </span>
              </div>

              <div className="mt-2.5 flex items-center justify-between gap-2 border-t border-[#F1F5F9] pt-2.5 text-[11px] text-[#64748B]">
                <span className="truncate">{card.meta}</span>
                <span className="shrink-0 font-medium text-[#0284C7] opacity-0 transition-opacity group-hover:opacity-100">
                  Filter
                </span>
              </div>
            </button>
          );
        })}
      </div>
      <p className="text-[11px] text-[#64748B]">
        Synthetic prototype dataset — figures reflect simulated transaction telemetry and update dynamically with local analyst actions.
      </p>
    </div>
  );
}
