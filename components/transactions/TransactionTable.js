'use client';

import { ArrowUpDown, ChevronLeft, ChevronRight, Eye, SearchX } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import ProgressBar from '@/components/ui/ProgressBar';
import EmptyState from '@/components/ui/EmptyState';
import { formatCurrency, formatShortTime } from '@/lib/utils';

function riskVariant(level) {
  if (level === 'CRITICAL') return 'critical';
  if (level === 'HIGH') return 'high';
  if (level === 'MEDIUM') return 'warning';
  return 'success';
}

function statusVariant(status) {
  if (status === 'Blocked') return 'critical';
  if (status === 'Flagged') return 'high';
  if (status === 'Under Review') return 'warning';
  return 'success';
}

export default function TransactionTable({
  transactions = [],
  totalCount = 0,
  page = 1,
  pageSize = 10,
  totalPages = 1,
  sortBy = 'timestamp',
  sortDir = 'desc',
  loading = false,
  onSort,
  onPageChange,
  onSelectTransaction,
  onResetFilters,
}) {
  const toggleSort = (field) => {
    if (sortBy === field) {
      onSort?.(field, sortDir === 'desc' ? 'asc' : 'desc');
    } else {
      onSort?.(field, 'desc');
    }
  };

  if (loading) {
    return (
      <div className="rounded-lg border border-[#E2E8F0] bg-white p-5 space-y-2.5">
        {[1, 2, 3, 4, 5, 6].map((idx) => (
          <div key={idx} className="h-11 animate-pulse rounded bg-[#F1F5F9]" />
        ))}
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <EmptyState
        icon={SearchX}
        title="No transactions match current filters"
        description="Try widening your amount bounds, date range, or clearing the risk level and status selectors."
        actionLabel="Reset Filters"
        onAction={onResetFilters}
      />
    );
  }

  const startRow = (page - 1) * pageSize + 1;
  const endRow = Math.min(page * pageSize, totalCount);

  return (
    <div className="overflow-hidden rounded-lg border border-[#E2E8F0] bg-white">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1040px] border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-[11px] font-medium text-[#64748B]">
              <th className="px-4 py-3 font-medium">
                <button
                  type="button"
                  onClick={() => toggleSort('id')}
                  className="inline-flex items-center gap-1 hover:text-[#0F172A] cursor-pointer"
                >
                  Transaction ID
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </th>
              <th className="px-4 py-3 font-medium">Source Account</th>
              <th className="px-4 py-3 font-medium">Destination Account</th>
              <th className="px-4 py-3 text-right font-medium">
                <button
                  type="button"
                  onClick={() => toggleSort('amount')}
                  className="inline-flex items-center gap-1 hover:text-[#0F172A] cursor-pointer"
                >
                  Amount
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </th>
              <th className="px-4 py-3 font-medium">Transaction Type</th>
              <th className="px-4 py-3 font-medium">
                <button
                  type="button"
                  onClick={() => toggleSort('timestamp')}
                  className="inline-flex items-center gap-1 hover:text-[#0F172A] cursor-pointer"
                >
                  Time (UTC)
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </th>
              <th className="px-4 py-3 font-medium">
                <button
                  type="button"
                  onClick={() => toggleSort('riskScore')}
                  className="inline-flex items-center gap-1 hover:text-[#0F172A] cursor-pointer"
                >
                  Risk Score
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </th>
              <th className="px-4 py-3 font-medium">Risk Level</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[#F1F5F9]">
            {transactions.map((tx) => (
              <tr
                key={tx.id}
                onClick={() => onSelectTransaction?.(tx.id)}
                className="group cursor-pointer transition-colors hover:bg-[#F8FAFC]"
              >
                <td className="px-4 py-3 font-mono font-semibold text-[#0284C7] whitespace-nowrap">
                  {tx.id}
                </td>
                <td className="px-4 py-3">
                  <div className="font-mono text-[#0F172A]">{tx.senderAccount}</div>
                  <div className="text-[11px] text-[#64748B] truncate max-w-[140px]">
                    {tx.senderName}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="font-mono text-[#0F172A]">{tx.receiverAccount}</div>
                  <div className="text-[11px] text-[#64748B] truncate max-w-[140px]">
                    {tx.receiverName}
                  </div>
                </td>
                <td className="px-4 py-3 text-right font-mono font-medium tabular-nums text-[#0F172A] whitespace-nowrap">
                  {formatCurrency(tx.amount)}
                </td>
                <td className="px-4 py-3 text-[#334155] whitespace-nowrap">{tx.type}</td>
                <td className="px-4 py-3 font-mono tabular-nums text-[#64748B] whitespace-nowrap">
                  {formatShortTime(tx.timestamp)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 min-w-[96px]">
                    <ProgressBar value={tx.riskScore} className="w-14" />
                    <span className="font-mono font-semibold tabular-nums text-[#0F172A]">
                      {tx.riskScore}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <Badge variant={riskVariant(tx.riskLevel)}>{tx.riskLevel}</Badge>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <Badge variant={statusVariant(tx.status)}>{tx.status}</Badge>
                </td>
                <td
                  className="px-4 py-3 text-right whitespace-nowrap"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button
                    variant="secondary"
                    size="xs"
                    onClick={() => onSelectTransaction?.(tx.id)}
                  >
                    <Eye className="h-3.5 w-3.5" />
                    Investigate
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 text-xs">
        <div className="font-mono tabular-nums text-[#64748B]">
          Showing {startRow}–{endRow} of {totalCount} prototype transactions
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="xs"
            disabled={page <= 1}
            onClick={() => onPageChange?.(page - 1)}
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Previous
          </Button>
          <span className="px-2 font-mono tabular-nums text-[#0F172A]">
            Page {page} / {totalPages}
          </span>
          <Button
            variant="secondary"
            size="xs"
            disabled={page >= totalPages}
            onClick={() => onPageChange?.(page + 1)}
          >
            Next
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
