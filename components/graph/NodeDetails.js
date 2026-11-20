'use client';

import { ArrowRight, ArrowUpRight, Network, X } from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import ProgressBar from '@/components/ui/ProgressBar';
import { formatCurrency, formatTimestamp } from '@/lib/utils';

function tierVariant(tier) {
  if (tier === 'high-risk' || tier === 'CRITICAL') return 'critical';
  if (tier === 'suspicious' || tier === 'HIGH') return 'warning';
  return 'success';
}

function statusVariant(status) {
  if (status === 'Blocked') return 'critical';
  if (status === 'Flagged') return 'high';
  if (status === 'Under Review') return 'warning';
  return 'success';
}

export default function NodeDetails({
  selectedNode,
  selectedEdge,
  clusters = [],
  allEdges = [],
  onSelectAccount,
  onClearSelection,
  onOpenTransaction,
  onFocusCluster,
}) {
  // Selected Edge View
  if (selectedEdge) {
    const edge = selectedEdge.data || {};
    return (
      <Card
        title="Transfer Edge Details"
        subtitle="Selected directed account-to-account transfer"
        action={
          <button
            type="button"
            onClick={onClearSelection}
            aria-label="Clear selection"
            className="rounded p-1 text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A] cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        }
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-sm font-semibold text-[#0284C7]">
              {edge.transactionId}
            </span>
            <Badge variant={statusVariant(edge.status)}>{edge.status}</Badge>
          </div>

          <div className="rounded-md border border-[#E2E8F0] bg-[#F8FAFC] p-3">
            <div className="text-[11px] text-[#64748B]">Transfer Path</div>
            <div className="mt-1.5 flex items-center gap-2 font-mono text-xs text-[#0F172A]">
              <button
                type="button"
                onClick={() => onSelectAccount?.(selectedEdge.source)}
                className="font-medium text-[#0284C7] hover:underline cursor-pointer"
              >
                {selectedEdge.source}
              </button>
              <ArrowRight className="h-3.5 w-3.5 text-[#64748B]" />
              <button
                type="button"
                onClick={() => onSelectAccount?.(selectedEdge.target)}
                className="font-medium text-[#0284C7] hover:underline cursor-pointer"
              >
                {selectedEdge.target}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <div className="text-[11px] text-[#64748B]">Amount</div>
              <div className="mt-0.5 font-mono font-semibold tabular-nums text-[#0F172A]">
                {formatCurrency(edge.amount)}
              </div>
            </div>
            <div>
              <div className="text-[11px] text-[#64748B]">Rail / Type</div>
              <div className="mt-0.5 text-[#0F172A]">{edge.type}</div>
            </div>
            <div className="col-span-2">
              <div className="text-[11px] text-[#64748B]">Timestamp</div>
              <div className="mt-0.5 font-mono tabular-nums text-[#334155]">
                {formatTimestamp(edge.timestamp)}
              </div>
            </div>
          </div>

          <div className="border-t border-[#F1F5F9] pt-3">
            <div className="mb-1.5 flex items-center justify-between text-xs">
              <span className="text-[#64748B]">Edge Risk Score</span>
              <span className="font-mono font-semibold tabular-nums text-[#0F172A]">
                {edge.riskScore} / 100
              </span>
            </div>
            <ProgressBar value={edge.riskScore} height="md" />
          </div>

          <Button
            variant="primary"
            size="md"
            className="w-full"
            onClick={() => onOpenTransaction?.(edge.transactionId)}
          >
            Open Full Investigation
            <ArrowUpRight className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    );
  }

  // Selected Account Node View
  if (selectedNode) {
    const acc = selectedNode.data || {};
    const nodeTransfers = allEdges.filter(
      (e) => e.source === acc.accountId || e.target === acc.accountId
    );

    return (
      <Card
        title="Account Node Details"
        subtitle={acc.clusterName || 'Account subgraph telemetry'}
        action={
          <button
            type="button"
            onClick={onClearSelection}
            aria-label="Clear selection"
            className="rounded p-1 text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A] cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        }
      >
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="font-mono text-sm font-semibold text-[#0284C7]">
                {acc.accountId}
              </div>
              <div className="mt-0.5 text-xs font-medium text-[#0F172A]">{acc.label}</div>
              <div className="text-[11px] text-[#64748B]">
                {acc.accountType} · {acc.jurisdiction}
              </div>
            </div>
            <Badge variant={tierVariant(acc.riskTier)}>
              {acc.riskTier === 'high-risk'
                ? 'High-Risk'
                : acc.riskTier === 'suspicious'
                  ? 'Suspicious'
                  : 'Normal'}
            </Badge>
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between text-xs">
              <span className="text-[#64748B]">Account Risk Score</span>
              <span className="font-mono font-semibold tabular-nums text-[#0F172A]">
                {acc.riskScore} / 100
              </span>
            </div>
            <ProgressBar value={acc.riskScore} height="md" />
          </div>

          <div className="grid grid-cols-3 gap-2 rounded-md border border-[#E2E8F0] bg-[#F8FAFC] p-3">
            <div>
              <div className="text-[10px] text-[#64748B]">Txns</div>
              <div className="mt-0.5 font-mono text-xs font-semibold tabular-nums text-[#0F172A]">
                {acc.transactionCount}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-[#64748B]">Total Inflow</div>
              <div className="mt-0.5 font-mono text-xs font-semibold tabular-nums text-[#15803D]">
                {formatCurrency(acc.totalInflow, { compact: true })}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-[#64748B]">Total Outflow</div>
              <div className="mt-0.5 font-mono text-xs font-semibold tabular-nums text-[#DC2626]">
                {formatCurrency(acc.totalOutflow, { compact: true })}
              </div>
            </div>
          </div>

          {/* Connected Accounts */}
          <div className="border-t border-[#F1F5F9] pt-3">
            <div className="mb-2 text-[11px] font-medium text-[#64748B]">
              Connected Accounts ({acc.connectedAccounts?.length || 0})
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(acc.connectedAccounts || []).map((peerId) => (
                <button
                  key={peerId}
                  type="button"
                  onClick={() => onSelectAccount?.(peerId)}
                  className="rounded border border-[#CBD5E1] bg-white px-2 py-1 font-mono text-[11px] text-[#0F172A] transition-colors hover:border-[#0284C7] hover:bg-[#F0F9FF] hover:text-[#0284C7] cursor-pointer"
                >
                  {peerId}
                </button>
              ))}
            </div>
          </div>

          {/* Related Transfers */}
          {nodeTransfers.length > 0 && (
            <div className="border-t border-[#F1F5F9] pt-3">
              <div className="mb-2 text-[11px] font-medium text-[#64748B]">
                Linked Transfers ({nodeTransfers.length})
              </div>
              <div className="max-h-48 space-y-1.5 overflow-y-auto pr-1">
                {nodeTransfers.map((edge) => {
                  const isOutbound = edge.source === acc.accountId;
                  return (
                    <button
                      key={edge.id}
                      type="button"
                      onClick={() => onOpenTransaction?.(edge.id)}
                      className="flex w-full items-center justify-between gap-2 rounded border border-[#E2E8F0] bg-[#F8FAFC] px-2.5 py-2 text-left text-[11px] transition-colors hover:border-[#CBD5E1] hover:bg-white cursor-pointer"
                    >
                      <div className="min-w-0">
                        <div className="font-mono font-semibold text-[#0284C7]">
                          {edge.id}{' '}
                          <span className="font-normal text-[#64748B]">
                            {isOutbound ? `→ ${edge.target}` : `← ${edge.source}`}
                          </span>
                        </div>
                        <div className="text-[10px] text-[#64748B]">{edge.data.type}</div>
                      </div>
                      <div className="text-right font-mono tabular-nums shrink-0">
                        <div className="text-[#0F172A]">{formatCurrency(edge.data.amount, { maximumFractionDigits: 0 })}</div>
                        <div className="text-[10px] text-[#64748B]">Risk {edge.data.riskScore}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </Card>
    );
  }

  // Default Cluster Overview
  return (
    <Card
      title="Network Inspection Panel"
      subtitle="Select any account node or transfer edge on the canvas"
    >
      <div className="space-y-4">
        <div className="rounded-md border border-[#E2E8F0] bg-[#F8FAFC] p-3.5 text-xs leading-relaxed text-[#475569]">
          <div className="mb-1.5 flex items-center gap-2 font-medium text-[#0F172A]">
            <Network className="h-4 w-4 text-[#0284C7]" />
            Interactive Topology Guide
          </div>
          Click an account node to inspect inflows, outflows, and neighbor connections, or click any directional arrow to investigate that transfer.
        </div>

        <div className="space-y-2.5">
          <div className="text-[11px] font-medium text-[#64748B]">Detected Prototype Clusters</div>
          {clusters.map((cluster) => (
            <button
              key={cluster.id}
              type="button"
              onClick={() => onFocusCluster?.(cluster.id, cluster.focusAccountId)}
              className="flex w-full items-center justify-between gap-3 rounded-md border border-[#E2E8F0] bg-[#F8FAFC] p-3 text-left transition-colors hover:border-[#CBD5E1] hover:bg-white cursor-pointer"
            >
              <div className="min-w-0">
                <div className="text-xs font-semibold text-[#0F172A]">{cluster.name}</div>
                <div className="mt-0.5 font-mono text-[11px] text-[#64748B]">
                  {cluster.accountCount} accounts · Focus {cluster.focusAccountId}
                </div>
              </div>
              <Badge variant={tierVariant(cluster.severity)}>{cluster.severity}</Badge>
            </button>
          ))}
        </div>

        <div className="border-t border-[#F1F5F9] pt-3 text-[11px] leading-relaxed text-[#64748B]">
          Note: This canvas renders prototype transaction graph topology for visual investigation. It is a visualization layer and not the GNN inference engine itself.
        </div>
      </div>
    </Card>
  );
}
