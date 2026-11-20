'use client';

import { Download, RotateCcw, Search } from 'lucide-react';
import Button from '@/components/ui/Button';
import { DATE_FILTER_OPTIONS } from '@/lib/constants';

export default function TransactionFilters({
  filters,
  onChange,
  onReset,
  onExportCsv,
  totalResults = 0,
}) {
  const hasActiveFilters =
    filters.search !== '' ||
    filters.riskLevel !== 'ALL' ||
    filters.status !== 'ALL' ||
    filters.minAmount !== '' ||
    filters.maxAmount !== '' ||
    filters.dateRange !== 'all';

  const inputBase =
    'h-9 rounded-md border border-[#CBD5E1] bg-white px-3 text-xs text-[#0F172A] placeholder:text-[#94A3B8] focus:border-[#0284C7] focus:outline-none transition-colors';

  return (
    <div className="rounded-lg border border-[#E2E8F0] bg-white p-4 space-y-3">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
        {/* Search TX ID / Account ID */}
        <div className="relative md:col-span-4">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#64748B]" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onChange({ search: e.target.value, page: 1 })}
            placeholder="Search TXN ID, ACC ID, or entity name..."
            aria-label="Search transactions by ID or account"
            className={`${inputBase} w-full pl-8 font-mono`}
          />
        </div>

        {/* Risk Level */}
        <div className="md:col-span-2">
          <select
            value={filters.riskLevel}
            onChange={(e) => onChange({ riskLevel: e.target.value, page: 1 })}
            aria-label="Filter by risk level"
            className={`${inputBase} w-full cursor-pointer`}
          >
            <option value="ALL">All Risk Levels</option>
            <option value="CRITICAL">Critical Risk</option>
            <option value="HIGH">High Risk</option>
            <option value="MEDIUM">Medium Risk</option>
            <option value="LOW">Low Risk</option>
          </select>
        </div>

        {/* Status */}
        <div className="md:col-span-2">
          <select
            value={filters.status}
            onChange={(e) => onChange({ status: e.target.value, page: 1 })}
            aria-label="Filter by transaction status"
            className={`${inputBase} w-full cursor-pointer`}
          >
            <option value="ALL">All Statuses</option>
            <option value="Flagged">Flagged</option>
            <option value="Blocked">Blocked</option>
            <option value="Under Review">Under Review</option>
            <option value="Approved">Approved</option>
          </select>
        </div>

        {/* Date Range */}
        <div className="md:col-span-2">
          <select
            value={filters.dateRange}
            onChange={(e) => onChange({ dateRange: e.target.value, page: 1 })}
            aria-label="Filter by date range"
            className={`${inputBase} w-full cursor-pointer`}
          >
            {DATE_FILTER_OPTIONS.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Sort */}
        <div className="md:col-span-2">
          <select
            value={`${filters.sortBy}:${filters.sortDir}`}
            onChange={(e) => {
              const [sortBy, sortDir] = e.target.value.split(':');
              onChange({ sortBy, sortDir, page: 1 });
            }}
            aria-label="Sort transactions"
            className={`${inputBase} w-full cursor-pointer`}
          >
            <option value="timestamp:desc">Newest First</option>
            <option value="timestamp:asc">Oldest First</option>
            <option value="riskScore:desc">Highest Risk</option>
            <option value="riskScore:asc">Lowest Risk</option>
            <option value="amount:desc">Largest Amount</option>
            <option value="amount:asc">Smallest Amount</option>
          </select>
        </div>
      </div>

      {/* Secondary row: Amount range + utility actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#F1F5F9] pt-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="text-xs text-[#64748B]">Amount (USD):</span>
          <input
            type="number"
            min="0"
            step="100"
            value={filters.minAmount}
            onChange={(e) => onChange({ minAmount: e.target.value, page: 1 })}
            placeholder="Min $"
            aria-label="Minimum transaction amount"
            className={`${inputBase} w-28 font-mono tabular-nums`}
          />
          <span className="text-xs text-[#64748B]">to</span>
          <input
            type="number"
            min="0"
            step="100"
            value={filters.maxAmount}
            onChange={(e) => onChange({ maxAmount: e.target.value, page: 1 })}
            placeholder="Max $"
            aria-label="Maximum transaction amount"
            className={`${inputBase} w-28 font-mono tabular-nums`}
          />
          <span className="ml-1 font-mono text-xs tabular-nums text-[#64748B]">
            {totalResults} matching {totalResults === 1 ? 'record' : 'records'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <Button variant="ghost" size="xs" onClick={onReset}>
              <RotateCcw className="h-3.5 w-3.5" />
              Reset Filters
            </Button>
          )}
          <Button variant="secondary" size="xs" onClick={onExportCsv} disabled={totalResults === 0}>
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </Button>
        </div>
      </div>
    </div>
  );
}
