'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, Cpu, DatabaseZap, RefreshCw } from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import PerformanceCharts from './PerformanceCharts';
import { getModelMetrics } from '@/lib/api';
import { MODEL_STATUSES } from '@/lib/constants';

function statusBadgeVariant(statusKey) {
  if (statusKey === 'prototype') return 'cyan';
  if (statusKey === 'mock_prediction') return 'violet';
  if (statusKey === 'integration_pending') return 'warning';
  return 'neutral';
}

export default function ModelMetrics() {
  const [mode, setMode] = useState('demo'); // 'demo' | 'live'
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleModeChange = (nextMode) => {
    if (nextMode === mode) return;
    setLoading(true);
    setMode(nextMode);
  };

  const handleRefreshMetrics = async (targetMode = mode) => {
    setLoading(true);
    try {
      const response = await getModelMetrics(targetMode);
      setData(response);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    getModelMetrics(mode)
      .then((response) => {
        if (!cancelled) setData(response);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [mode]);

  return (
    <div className="space-y-5">
      {/* Prominent Honest Disclaimer + Mode Toggle */}
      <div className="flex flex-col gap-4 rounded-lg border border-[#FDE68A] bg-[#FFFBEB] px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[#D97706]" />
          <div>
            <div className="font-mono text-xs font-semibold tracking-wide text-[#92400E]">
              DEMO METRICS — NOT FROM ACTUAL MODEL EVALUATION
            </div>
            <p className="mt-1 text-xs leading-relaxed text-[#78350F]">
              FraudShield does not fabricate real ML benchmarks. Switch between the honest pending state for live GNN evaluation telemetry and the clearly labeled demo preview below.
            </p>
          </div>
        </div>

        <div
          className="inline-flex items-center self-start rounded-md border border-[#E2E8F0] bg-white p-0.5 lg:self-auto shrink-0"
          role="group"
          aria-label="Evaluation data source mode"
        >
          <button
            type="button"
            onClick={() => handleModeChange('demo')}
            className={`rounded px-3 py-1.5 text-xs font-medium whitespace-nowrap cursor-pointer transition-colors ${
              mode === 'demo'
                ? 'bg-[#F0F9FF] text-[#0284C7]'
                : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            Demo UI Preview
          </button>
          <button
            type="button"
            onClick={() => handleModeChange('live')}
            className={`rounded px-3 py-1.5 text-xs font-medium whitespace-nowrap cursor-pointer transition-colors ${
              mode === 'live'
                ? 'bg-[#F0F9FF] text-[#0284C7]'
                : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            Actual Evaluation (Pending)
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-28 animate-pulse rounded-lg border border-[#E2E8F0] bg-white"
              />
            ))}
          </div>
          <div className="h-72 animate-pulse rounded-lg border border-[#E2E8F0] bg-white" />
        </div>
      ) : mode === 'live' ? (
        /* Honest Empty / Pending State for Real Model Evaluation */
        <div className="space-y-5">
          <EmptyState
            icon={DatabaseZap}
            title="Actual Model Evaluation Results Not Yet Connected"
            description={data?.message}
            actionLabel="Check Endpoint Again"
            onAction={() => handleRefreshMetrics('live')}
            secondaryActionLabel="View Labeled Demo Preview"
            onSecondaryAction={() => handleModeChange('demo')}
          />

          <Card
            title="Expected Evaluation Endpoint Contract"
            subtitle={`Configured backend target: ${data?.apiUrl || 'http://localhost:8000'}/api/v1/models/metrics`}
            action={
              <Button variant="secondary" size="xs" onClick={() => handleRefreshMetrics('live')}>
                <RefreshCw className="h-3.5 w-3.5" />
                Retry Poll
              </Button>
            }
          >
            <pre className="overflow-x-auto rounded-md border border-[#E2E8F0] bg-[#F8FAFC] p-4 font-mono text-[11px] leading-relaxed text-[#0369A1]">
{`{
  "model": "GNN Edge Classifier",
  "status": "evaluated",
  "metrics": {
    "precision": 0.0,
    "recall": 0.0,
    "f1Score": 0.0,
    "prAuc": 0.0,
    "falsePositiveRate": 0.0,
    "p95LatencyMs": 0
  },
  "confusionMatrix": { "tp": 0, "fp": 0, "fn": 0, "tn": 0 }
}`}
            </pre>
          </Card>
        </div>
      ) : (
        /* Demo Preview Metrics */
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
            {(data?.kpis || []).map((metric) => (
              <div
                key={metric.id}
                className="flex flex-col justify-between rounded-lg border border-[#E2E8F0] bg-white p-4"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium text-[#64748B]">{metric.label}</span>
                  <span className="font-mono text-[10px] font-semibold text-[#B45309]">DEMO</span>
                </div>
                <div className="mt-3 font-mono text-2xl font-semibold tabular-nums text-[#0F172A]">
                  {metric.value}
                </div>
                <div className="mt-2 border-t border-[#F1F5F9] pt-2 text-[11px] text-[#64748B]">
                  {metric.note}
                </div>
              </div>
            ))}
          </div>

          <PerformanceCharts metrics={data} />
        </div>
      )}

      {/* Architecture Model Readiness Registry (Shown in Both Modes) */}
      <Card
        title="Model Pipeline Readiness Registry"
        subtitle="Honest implementation status across all planned FraudShield detection components"
        noPadding
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-[11px] font-medium text-[#64748B]">
                <th className="px-5 py-3 font-medium">Model Component</th>
                <th className="px-5 py-3 font-medium">Planned Architecture</th>
                <th className="px-5 py-3 font-medium">Current Status</th>
                <th className="px-5 py-3 font-medium">Integration Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {(data?.modelRegistry || []).map((row) => {
                const statusMeta = MODEL_STATUSES[row.status] || MODEL_STATUSES.not_implemented;
                return (
                  <tr key={row.name} className="hover:bg-[#F8FAFC]">
                    <td className="px-5 py-3.5 font-medium text-[#0F172A] whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Cpu className="h-3.5 w-3.5 text-[#64748B]" />
                        {row.name}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-[11px] text-[#334155]">
                      {row.architecture}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <Badge variant={statusBadgeVariant(row.status)}>
                        {statusMeta.label}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5 text-[#64748B]">{row.readiness}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
