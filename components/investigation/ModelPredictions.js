'use client';

import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import ProgressBar from '@/components/ui/ProgressBar';
import { MODEL_STATUSES } from '@/lib/constants';

function statusBadgeVariant(statusKey) {
  if (statusKey === 'prototype') return 'cyan';
  if (statusKey === 'mock_prediction') return 'violet';
  if (statusKey === 'integration_pending') return 'warning';
  return 'neutral';
}

export default function ModelPredictions({ models = [] }) {
  return (
    <Card
      title="Model Predictions"
      subtitle="Multi-model architecture slots — only GNN Edge Classifier currently has a confirmed working prototype"
      noPadding
      action={<Badge variant="cyan">1 Prototype · 4 Pending/Mock</Badge>}
    >
      <div className="divide-y divide-[#F1F5F9]">
        {models.map((model) => {
          const statusMeta = MODEL_STATUSES[model.status] || MODEL_STATUSES.not_implemented;
          const hasScore = typeof model.score === 'number';

          return (
            <div key={model.id} className="px-5 py-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold text-[#0F172A]">{model.name}</span>
                    <Badge variant={statusBadgeVariant(model.status)}>
                      {statusMeta.label}
                    </Badge>
                    {model.verdict && (
                      <span className="font-mono text-[11px] text-[#64748B]">
                        Output: {model.verdict}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-[11px] text-[#64748B]">{model.role}</p>
                </div>

                <div className="text-right shrink-0">
                  {hasScore ? (
                    <div>
                      <div className="font-mono text-sm font-semibold tabular-nums text-[#0F172A]">
                        {model.score}
                        <span className="text-xs font-normal text-[#64748B]"> / 100</span>
                      </div>
                      <div className="font-mono text-[11px] tabular-nums text-[#64748B]">
                        p = {model.probability.toFixed(2)}
                        {model.latencyMs ? ` · ${model.latencyMs}ms` : ''}
                      </div>
                    </div>
                  ) : (
                    <div className="font-mono text-xs text-[#64748B]">Awaiting model</div>
                  )}
                </div>
              </div>

              {hasScore ? (
                <div className="mt-2.5 flex items-center gap-3">
                  <ProgressBar
                    value={model.score}
                    tone={model.status === 'mock_prediction' ? 'violet' : 'auto'}
                    className="flex-1"
                  />
                  <span className="text-[11px] text-[#64748B] shrink-0">
                    {model.notes}
                  </span>
                </div>
              ) : (
                <div className="mt-2 rounded border border-dashed border-[#CBD5E1] bg-[#F8FAFC] px-3 py-2 text-[11px] text-[#64748B]">
                  {model.notes}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
