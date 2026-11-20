'use client';

import { ArrowUpRight } from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { formatCurrency, formatRelativeAge } from '@/lib/utils';

function severityVariant(severity) {
  if (severity === 'CRITICAL') return 'critical';
  if (severity === 'HIGH') return 'high';
  return 'warning';
}

export default function FraudAlerts({ alerts = [], loading = false, onInvestigate }) {
  return (
    <Card
      title="Recent Fraud Alerts"
      subtitle="Priority prototype detections requiring analyst triage"
      noPadding
      action={
        <span className="font-mono text-xs font-medium tabular-nums text-[#DC2626]">
          {alerts.length} active
        </span>
      }
    >
      {loading ? (
        <div className="space-y-3 p-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded bg-[#F1F5F9]" />
          ))}
        </div>
      ) : (
        <div className="divide-y divide-[#F1F5F9]">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="flex flex-col gap-2.5 px-5 py-3.5 transition-colors hover:bg-[#F8FAFC]"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <Badge variant={severityVariant(alert.severity)}>{alert.severity}</Badge>
                  <span className="font-mono text-xs font-semibold text-[#0284C7]">
                    {alert.transactionId}
                  </span>
                  <span className="text-[11px] text-[#94A3B8]" aria-hidden="true">
                    ·
                  </span>
                  <span className="font-mono text-[11px] tabular-nums text-[#64748B]">
                    {formatRelativeAge(alert.timestamp)}
                  </span>
                </div>
                <span className="font-mono text-xs font-semibold tabular-nums text-[#0F172A] shrink-0">
                  Score {alert.riskScore}
                </span>
              </div>

              <p className="text-xs leading-relaxed text-[#334155]">{alert.reason}</p>

              <div className="flex items-center justify-between gap-3 pt-0.5">
                <div className="font-mono text-[11px] tabular-nums text-[#64748B] truncate">
                  {alert.senderAccount} → {alert.receiverAccount} · {formatCurrency(alert.amount)}
                </div>
                <Button
                  variant="secondary"
                  size="xs"
                  onClick={() => onInvestigate?.(alert.transactionId)}
                >
                  Investigate
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
