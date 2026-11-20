'use client';

import { ArrowRight, ChevronRight } from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import ProgressBar from '@/components/ui/ProgressBar';
import { formatCurrency, formatShortTime } from '@/lib/utils';

function riskBadgeVariant(level) {
  if (level === 'CRITICAL') return 'critical';
  if (level === 'HIGH') return 'high';
  if (level === 'MEDIUM') return 'warning';
  return 'success';
}

function statusBadgeVariant(status) {
  if (status === 'Blocked') return 'critical';
  if (status === 'Flagged') return 'high';
  if (status === 'Under Review') return 'warning';
  return 'success';
}

export default function RecentTransactions({
  transactions = [],
  loading = false,
  onSelectTransaction,
  onViewAll,
}) {
  const recent = transactions.slice(0, 8);

  return (
    <Card
      title="Recent Transactions"
      subtitle="Select any row to inspect evidence, model predictions, and simulated analyst actions"
      noPadding
      action={
        <Button variant="ghost" size="xs" onClick={onViewAll}>
          View All
          <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      }
    >
      {loading ? (
        <div className="space-y-2 p-5">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-10 animate-pulse rounded bg-[#F1F5F9]" />
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-[11px] font-medium text-[#64748B]">
                <th className="px-4 py-3 font-medium">Transaction ID</th>
                <th className="px-4 py-3 font-medium">Sender</th>
                <th className="px-4 py-3 font-medium">Receiver</th>
                <th className="px-4 py-3 text-right font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Timestamp</th>
                <th className="px-4 py-3 font-medium">Risk Score</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="w-8 px-3 py-3" aria-label="Inspect" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {recent.map((tx) => (
                <tr
                  key={tx.id}
                  onClick={() => onSelectTransaction?.(tx.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSelectTransaction?.(tx.id);
                    }
                  }}
                  tabIndex={0}
                  className="group cursor-pointer transition-colors hover:bg-[#F8FAFC] focus-visible:bg-[#F0F9FF] focus-visible:outline-none"
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
                  <td className="px-4 py-3 font-mono tabular-nums text-[#64748B] whitespace-nowrap">
                    {formatShortTime(tx.timestamp)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5 min-w-[132px]">
                      <ProgressBar value={tx.riskScore} className="w-16" />
                      <span className="font-mono font-semibold tabular-nums text-[#0F172A]">
                        {tx.riskScore}
                      </span>
                      <Badge variant={riskBadgeVariant(tx.riskLevel)}>
                        {tx.riskLevel}
                      </Badge>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <Badge variant={statusBadgeVariant(tx.status)}>{tx.status}</Badge>
                  </td>
                  <td className="px-3 py-3 text-right text-[#94A3B8] group-hover:text-[#0284C7]">
                    <ChevronRight className="h-4 w-4 inline-block" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
