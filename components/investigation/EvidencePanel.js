'use client';

import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import ProgressBar from '@/components/ui/ProgressBar';

function severityVariant(severity) {
  if (severity === 'CRITICAL') return 'critical';
  if (severity === 'HIGH') return 'high';
  if (severity === 'MEDIUM') return 'warning';
  return 'success';
}

export default function EvidencePanel({ evidence = [] }) {
  return (
    <Card
      title="Explainable Evidence Signals"
      subtitle="Feature & topology indicators surfaced for analyst review"
      action={<Badge variant="neutral">Mock Evidence — Prototype</Badge>}
      noPadding
    >
      {evidence.length === 0 ? (
        <div className="p-5 text-xs text-[#64748B]">
          No elevated risk evidence factors recorded for this transaction.
        </div>
      ) : (
        <div className="divide-y divide-[#F1F5F9]">
          {evidence.map((item) => (
            <div key={item.id} className="px-5 py-3.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold text-[#0F172A]">{item.factor}</span>
                  <span className="text-[11px] text-[#94A3B8]" aria-hidden="true">
                    ·
                  </span>
                  <span className="text-[11px] text-[#64748B]">{item.category}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-[11px] tabular-nums text-[#64748B]">
                    Impact {item.weight}/100
                  </span>
                  <Badge variant={severityVariant(item.severity)}>{item.severity}</Badge>
                </div>
              </div>

              <p className="mt-1.5 text-xs leading-relaxed text-[#475569]">{item.detail}</p>

              <div className="mt-2.5">
                <ProgressBar value={item.weight} className="max-w-xs" />
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="border-t border-[#E2E8F0] bg-[#F8FAFC] px-5 py-2.5 text-[11px] text-[#64748B]">
        Disclosure: Evidence weights and descriptions above are synthetic prototype data prepared for UI demonstration.
      </div>
    </Card>
  );
}
