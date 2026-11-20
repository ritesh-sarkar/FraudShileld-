'use client';

import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import ProgressBar from '@/components/ui/ProgressBar';
import { getDecisionRecommendation } from '@/lib/risk-engine';
import { getRiskConfig } from '@/lib/utils';

function riskVariant(level) {
  if (level === 'CRITICAL') return 'critical';
  if (level === 'HIGH') return 'high';
  if (level === 'MEDIUM') return 'warning';
  return 'success';
}

export default function RiskAnalysis({ transaction, normalizedPrediction }) {
  if (!transaction) return null;

  const score = normalizedPrediction?.prediction?.riskScore ?? transaction.riskScore;
  const probability = normalizedPrediction?.prediction?.fraudProbability ?? Number((score / 100).toFixed(2));
  const riskLevel = normalizedPrediction?.prediction?.riskLevel ?? transaction.riskLevel;
  const verdict = normalizedPrediction?.prediction?.prediction ?? (score >= 70 ? 'FRAUD' : 'REVIEW');
  const riskMeta = getRiskConfig(riskLevel);
  const recommendation = getDecisionRecommendation(score);

  return (
    <Card
      title="Risk Assessment"
      subtitle="Normalized fraud score and recommended triage posture (prototype rules + GNN stub)"
      action={<Badge variant={riskVariant(riskLevel)}>{riskMeta.label}</Badge>}
    >
      <div className="grid grid-cols-1 gap-5 md:grid-cols-12">
        {/* Visual score readout */}
        <div className="flex flex-col justify-between rounded-md border border-[#E2E8F0] bg-[#F8FAFC] p-4 md:col-span-5">
          <div className="flex items-center justify-between text-xs text-[#64748B]">
            <span>Final Risk Score</span>
            <span className="font-mono text-[11px]">Scale 0–100</span>
          </div>

          <div className="my-3 flex items-baseline gap-2">
            <span
              className="font-mono text-4xl font-semibold tracking-tight tabular-nums"
              style={{ color: riskMeta.color }}
            >
              {score}
            </span>
            <span className="font-mono text-sm text-[#64748B]">/ 100</span>
          </div>

          <ProgressBar value={score} height="md" />

          <div className="mt-3 flex items-center justify-between border-t border-[#E2E8F0] pt-2.5 text-[11px]">
            <span className="text-[#64748B]">Fraud Probability</span>
            <span className="font-mono font-semibold tabular-nums text-[#0F172A]">
              {probability.toFixed(2)} ({Math.round(probability * 100)}%)
            </span>
          </div>
        </div>

        {/* Recommendation summary */}
        <div className="flex flex-col justify-between gap-3 md:col-span-7">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-medium text-[#64748B]">Decision Recommendation</span>
              <Badge variant={riskVariant(recommendation.tone)} mono>
                {verdict}
              </Badge>
            </div>
            <div className="font-display text-sm font-semibold text-[#0F172A]">
              {recommendation.label}
            </div>
            <p className="text-xs leading-relaxed text-[#475569]">{recommendation.summary}</p>
          </div>

          <div className="grid grid-cols-2 gap-3 border-t border-[#E2E8F0] pt-3 text-xs">
            <div>
              <div className="text-[11px] text-[#64748B]">Active Scoring Source</div>
              <div className="mt-0.5 font-mono font-medium text-[#0284C7]">GNN Edge Classifier</div>
            </div>
            <div>
              <div className="text-[11px] text-[#64748B]">Model Maturity</div>
              <div className="mt-0.5 font-mono text-[#0F172A]">Prototype Adapter</div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
