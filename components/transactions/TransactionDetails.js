'use client';

import { useState } from 'react';
import {
  CheckCircle2,
  Code2,
  GitBranch,
  History,
  ShieldAlert,
  ShieldCheck,
  ShieldOff,
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import RiskAnalysis from '@/components/investigation/RiskAnalysis';
import ModelPredictions from '@/components/investigation/ModelPredictions';
import EvidencePanel from '@/components/investigation/EvidencePanel';
import AIExplanation from '@/components/investigation/AIExplanation';
import { SIMULATED_ACTIONS } from '@/lib/constants';
import { normalizePredictionPayload } from '@/lib/risk-engine';
import { formatCurrency, formatTimestamp } from '@/lib/utils';

function statusVariant(status) {
  if (status === 'Blocked') return 'critical';
  if (status === 'Flagged') return 'high';
  if (status === 'Under Review') return 'warning';
  return 'success';
}

const ACTION_ICONS = {
  reviewed: CheckCircle2,
  escalate: ShieldAlert,
  hold: ShieldOff,
  approve: ShieldCheck,
};

export default function TransactionDetails({
  transaction,
  onSimulateAction,
  onInspectInGraph,
  actionBusy = false,
}) {
  const [showSchemaPayload, setShowSchemaPayload] = useState(false);

  if (!transaction) return null;

  const normalized = normalizePredictionPayload(transaction);

  return (
    <div className="space-y-5">
      {/* Transaction Overview */}
      <Card
        title="Transaction Overview"
        subtitle={`${transaction.channel} · ${transaction.location}`}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={statusVariant(transaction.status)}>{transaction.status}</Badge>
            {onInspectInGraph && (
              <Button
                variant="secondary"
                size="xs"
                onClick={() => onInspectInGraph(transaction.senderAccount)}
              >
                <GitBranch className="h-3.5 w-3.5 text-[#0284C7]" />
                Inspect in Graph
              </Button>
            )}
          </div>
        }
      >
        <div className="grid grid-cols-2 gap-x-5 gap-y-4 sm:grid-cols-3">
          <div>
            <div className="text-[11px] text-[#64748B]">Transaction ID</div>
            <div className="mt-1 font-mono text-sm font-semibold text-[#0284C7]">
              {transaction.id}
            </div>
          </div>
          <div>
            <div className="text-[11px] text-[#64748B]">Amount</div>
            <div className="mt-1 font-mono text-sm font-semibold tabular-nums text-[#0F172A]">
              {formatCurrency(transaction.amount)} {transaction.currency}
            </div>
          </div>
          <div>
            <div className="text-[11px] text-[#64748B]">Transaction Type</div>
            <div className="mt-1 text-xs font-medium text-[#0F172A]">{transaction.type}</div>
          </div>
          <div>
            <div className="text-[11px] text-[#64748B]">Sender Account</div>
            <button
              type="button"
              onClick={() => onInspectInGraph?.(transaction.senderAccount)}
              className="mt-1 text-left font-mono text-xs font-medium text-[#0F172A] hover:text-[#0284C7] cursor-pointer"
            >
              {transaction.senderAccount}
            </button>
            <div className="text-[11px] text-[#64748B] truncate">{transaction.senderName}</div>
          </div>
          <div>
            <div className="text-[11px] text-[#64748B]">Receiver Account</div>
            <button
              type="button"
              onClick={() => onInspectInGraph?.(transaction.receiverAccount)}
              className="mt-1 text-left font-mono text-xs font-medium text-[#0F172A] hover:text-[#0284C7] cursor-pointer"
            >
              {transaction.receiverAccount}
            </button>
            <div className="text-[11px] text-[#64748B] truncate">{transaction.receiverName}</div>
          </div>
          <div>
            <div className="text-[11px] text-[#64748B]">Timestamp</div>
            <div className="mt-1 font-mono text-xs tabular-nums text-[#334155]">
              {formatTimestamp(transaction.timestamp)}
            </div>
          </div>
        </div>
      </Card>

      {/* Analyst Simulated Actions */}
      <Card
        title="Analyst Actions (Simulated)"
        subtitle="Updates local prototype state only — does not execute live banking holds or settlements"
        action={<Badge variant="warning">Simulated Controls</Badge>}
      >
        <div className="flex flex-wrap items-center gap-2.5">
          {SIMULATED_ACTIONS.map((act) => {
            const Icon = ACTION_ICONS[act.id] || CheckCircle2;
            const isCurrent = transaction.status === act.resultingStatus;
            return (
              <Button
                key={act.id}
                variant={act.variant}
                size="sm"
                disabled={actionBusy}
                onClick={() => onSimulateAction?.(transaction.id, act.id)}
                className={isCurrent ? 'ring-2 ring-[#0284C7]/50' : ''}
              >
                <Icon className="h-3.5 w-3.5" />
                {act.label}
              </Button>
            );
          })}
        </div>

        {transaction.actionHistory && transaction.actionHistory.length > 0 && (
          <div className="mt-4 border-t border-[#F1F5F9] pt-3">
            <div className="mb-2 flex items-center gap-1.5 text-[11px] font-medium text-[#64748B]">
              <History className="h-3.5 w-3.5" />
              Session Action Audit Log (Local Prototype)
            </div>
            <div className="space-y-1.5">
              {transaction.actionHistory.map((entry) => (
                <div
                  key={entry.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-1.5 text-[11px]"
                >
                  <span className="text-[#0F172A]">
                    {entry.action}{' '}
                    <span className="text-[#64748B]">by {entry.actor}</span>
                  </span>
                  <span className="font-mono tabular-nums text-[#64748B]">
                    {formatTimestamp(entry.timestamp)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Risk Assessment */}
      <RiskAnalysis transaction={transaction} normalizedPrediction={normalized} />

      {/* Explainable Evidence + Simulated AI Explanation */}
      <EvidencePanel evidence={transaction.evidence} />
      <AIExplanation explanation={transaction.aiExplanation} />

      {/* Multi-Model Predictions */}
      <ModelPredictions models={transaction.modelPredictions} />

      {/* Integration-Ready Normalized Payload Inspector */}
      <Card
        title="Normalized GNN Prediction Contract"
        subtitle="Backend-agnostic JavaScript data structure ready for future GNN Edge Classifier API responses"
        action={
          <Button
            variant="secondary"
            size="xs"
            onClick={() => setShowSchemaPayload((prev) => !prev)}
          >
            <Code2 className="h-3.5 w-3.5" />
            {showSchemaPayload ? 'Hide JSON' : 'Inspect JSON'}
          </Button>
        }
      >
        {showSchemaPayload ? (
          <pre className="overflow-x-auto rounded-md border border-[#E2E8F0] bg-[#F8FAFC] p-3.5 font-mono text-[11px] leading-relaxed text-[#0369A1]">
            {JSON.stringify(
              {
                transactionId: normalized.transactionId,
                prediction: normalized.prediction,
                evidence: normalized.evidence.map((e) => ({
                  factor: e.factor,
                  severity: e.severity,
                  weight: e.weight,
                })),
                model: normalized.model,
                timestamp: normalized.timestamp,
              },
              null,
              2
            )}
          </pre>
        ) : (
          <p className="text-xs text-[#64748B]">
            Click <span className="font-medium text-[#0F172A]">Inspect JSON</span> to preview the normalized prediction schema emitted by <code className="font-mono text-[#0284C7]">lib/risk-engine.js</code> and consumed by this investigation workspace.
          </p>
        )}
      </Card>
    </div>
  );
}
