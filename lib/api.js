/**
 * Frontend API abstraction layer for FraudShield.
 *
 * All UI views fetch data exclusively through this module so the prototype
 * can connect to the real FastAPI / GNN Edge Classifier backend later by
 * pointing `NEXT_PUBLIC_API_URL` at a live service without refactoring components.
 */

import {
  MOCK_ACCOUNTS,
  MOCK_ACTIVITY_SERIES,
  MOCK_DEMO_MODEL_METRICS,
  MOCK_NOTIFICATIONS,
  MOCK_REFERENCE_TIME,
  MOCK_SYSTEM_STATUS,
  MOCK_TRANSACTIONS,
} from './mock-data';
import { SIMULATED_ACTIONS } from './constants';
import { normalizePredictionPayload } from './risk-engine';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Brief deterministic delay simulates async network boundary while keeping UI snappy
async function waitBrief(ms = 90) {
  if (ms <= 0) return;
  await new Promise((resolve) => setTimeout(resolve, ms));
}

export function getApiConfig() {
  return {
    apiUrl: API_BASE_URL,
    mode: 'prototype-mock',
    liveBackendConnected: false,
    gnnAdapterContractVersion: 'normalized-v1',
  };
}

/**
 * Returns dashboard overview KPI metrics derived dynamically from active transaction state.
 */
export async function getDashboardStats(transactionsOverride = null) {
  await waitBrief(60);
  const txList = transactionsOverride || MOCK_TRANSACTIONS;

  const flaggedOrBlocked = txList.filter(
    (tx) => tx.status === 'Blocked' || tx.riskLevel === 'CRITICAL'
  );
  const suspicious = txList.filter(
    (tx) => tx.riskLevel === 'HIGH' || tx.status === 'Under Review' || tx.status === 'Flagged'
  );
  const preventedAmount = txList
    .filter((tx) => tx.status === 'Blocked' || tx.status === 'Flagged')
    .reduce((sum, tx) => sum + tx.amount, 0);

  // Scale base ledger counter with real local dataset deltas so simulated analyst actions reflect immediately
  const baselineLedgerTotal = 148290 + (txList.length - MOCK_TRANSACTIONS.length);

  return {
    isPrototypeData: true,
    totalTransactions: {
      value: baselineLedgerTotal,
      sampleCount: txList.length,
      change: '+8.4%',
      trend: 'up',
      periodLabel: 'vs prev 7d (simulated)',
    },
    fraudDetected: {
      value: flaggedOrBlocked.length,
      change: '+14.2%',
      trend: 'up',
      periodLabel: 'critical / blocked cases',
    },
    suspiciousTransactions: {
      value: suspicious.length,
      change: '-3.1%',
      trend: 'down',
      periodLabel: 'active triage queue',
    },
    amountPrevented: {
      value: preventedAmount,
      change: '+21.6%',
      trend: 'up',
      periodLabel: 'held or flagged volume',
    },
  };
}

/**
 * Returns time-series transaction & fraud counts for 24h, 7d, or 30d.
 */
export async function getTransactionActivity(range = '24h') {
  await waitBrief(50);
  return {
    range,
    isPrototypeData: true,
    series: MOCK_ACTIVITY_SERIES[range] || MOCK_ACTIVITY_SERIES['24h'],
  };
}

/**
 * Returns risk-level breakdown counts & shares computed from active transactions.
 */
export async function getRiskDistribution(transactionsOverride = null) {
  await waitBrief(40);
  const txList = transactionsOverride || MOCK_TRANSACTIONS;
  const counts = { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 };
  txList.forEach((tx) => {
    const key = tx.riskLevel || 'LOW';
    if (counts[key] !== undefined) counts[key] += 1;
  });

  const total = Math.max(1, txList.length);
  return {
    isPrototypeData: true,
    total: txList.length,
    buckets: [
      { key: 'LOW', name: 'Low Risk', count: counts.LOW, percentage: Math.round((counts.LOW / total) * 100), color: '#16A34A' },
      { key: 'MEDIUM', name: 'Medium Risk', count: counts.MEDIUM, percentage: Math.round((counts.MEDIUM / total) * 100), color: '#D97706' },
      { key: 'HIGH', name: 'High Risk', count: counts.HIGH, percentage: Math.round((counts.HIGH / total) * 100), color: '#EA580C' },
      { key: 'CRITICAL', name: 'Critical Risk', count: counts.CRITICAL, percentage: Math.round((counts.CRITICAL / total) * 100), color: '#DC2626' },
    ],
  };
}

/**
 * Fetches filtered, sorted, paginated transactions.
 */
export async function getTransactions(filters = {}, transactionsOverride = null) {
  await waitBrief(50);
  const {
    search = '',
    riskLevel = 'ALL',
    status = 'ALL',
    minAmount = '',
    maxAmount = '',
    dateRange = 'all',
    sortBy = 'timestamp',
    sortDir = 'desc',
    page = 1,
    pageSize = 10,
  } = filters;

  const source = [...(transactionsOverride || MOCK_TRANSACTIONS)];
  const query = search.trim().toLowerCase();
  const refMs = new Date(MOCK_REFERENCE_TIME).getTime();

  const filtered = source.filter((tx) => {
    if (query) {
      const match =
        tx.id.toLowerCase().includes(query) ||
        tx.senderAccount.toLowerCase().includes(query) ||
        tx.receiverAccount.toLowerCase().includes(query) ||
        tx.senderName.toLowerCase().includes(query) ||
        tx.receiverName.toLowerCase().includes(query) ||
        tx.type.toLowerCase().includes(query);
      if (!match) return false;
    }

    if (riskLevel && riskLevel !== 'ALL' && tx.riskLevel !== riskLevel) {
      return false;
    }

    if (status && status !== 'ALL' && tx.status !== status) {
      return false;
    }

    if (minAmount !== '' && !Number.isNaN(Number(minAmount)) && tx.amount < Number(minAmount)) {
      return false;
    }

    if (maxAmount !== '' && !Number.isNaN(Number(maxAmount)) && tx.amount > Number(maxAmount)) {
      return false;
    }

    if (dateRange && dateRange !== 'all') {
      const txMs = new Date(tx.timestamp).getTime();
      const ageHours = (refMs - txMs) / (1000 * 60 * 60);
      if (dateRange === '24h' && ageHours > 24) return false;
      if (dateRange === '7d' && ageHours > 24 * 7) return false;
      if (dateRange === '30d' && ageHours > 24 * 30) return false;
    }

    return true;
  });

  filtered.sort((a, b) => {
    let cmp = 0;
    if (sortBy === 'amount') {
      cmp = a.amount - b.amount;
    } else if (sortBy === 'riskScore') {
      cmp = a.riskScore - b.riskScore;
    } else if (sortBy === 'id') {
      cmp = a.id.localeCompare(b.id);
    } else {
      cmp = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
    }
    return sortDir === 'asc' ? cmp : -cmp;
  });

  const totalCount = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const items = filtered.slice(startIndex, startIndex + pageSize);

  return {
    items,
    allFiltered: filtered,
    totalCount,
    page: safePage,
    pageSize,
    totalPages,
    isPrototypeData: true,
  };
}

/**
 * Fetches a single transaction together with its normalized GNN prediction contract.
 */
export async function getTransactionById(id, transactionsOverride = null) {
  await waitBrief(40);
  const list = transactionsOverride || MOCK_TRANSACTIONS;
  const transaction = list.find((tx) => tx.id === id) || null;
  if (!transaction) return null;

  return {
    ...transaction,
    normalizedPrediction: normalizePredictionPayload(transaction),
  };
}

/**
 * Derives priority fraud alerts directly from high/critical transactions.
 */
export async function getFraudAlerts(transactionsOverride = null) {
  await waitBrief(40);
  const list = transactionsOverride || MOCK_TRANSACTIONS;
  return list
    .filter((tx) => tx.riskScore >= 68 || tx.status === 'Flagged' || tx.status === 'Blocked')
    .sort((a, b) => b.riskScore - a.riskScore)
    .slice(0, 7)
    .map((tx) => ({
      id: `ALERT-${tx.id.replace('TXN-', '')}`,
      transactionId: tx.id,
      severity: tx.riskLevel,
      reason: tx.alertReason || `Elevated risk score (${tx.riskScore}) detected on ${tx.type}`,
      timestamp: tx.timestamp,
      riskScore: tx.riskScore,
      amount: tx.amount,
      status: tx.status,
      senderAccount: tx.senderAccount,
      receiverAccount: tx.receiverAccount,
    }));
}

/**
 * Builds interactive React Flow account nodes and transaction edges from prototype data.
 */
export async function getGraphData(accountId = null, transactionsOverride = null) {
  await waitBrief(60);
  const txList = transactionsOverride || MOCK_TRANSACTIONS;

  const accountStats = {};
  MOCK_ACCOUNTS.forEach((acc) => {
    accountStats[acc.id] = {
      ...acc,
      transactionCount: 0,
      totalInflow: 0,
      totalOutflow: 0,
      connectedAccounts: new Set(),
      transactions: [],
    };
  });

  txList.forEach((tx) => {
    const src = accountStats[tx.senderAccount];
    const dst = accountStats[tx.receiverAccount];
    if (src) {
      src.transactionCount += 1;
      src.totalOutflow += tx.amount;
      src.connectedAccounts.add(tx.receiverAccount);
      src.transactions.push(tx);
    }
    if (dst) {
      dst.transactionCount += 1;
      dst.totalInflow += tx.amount;
      dst.connectedAccounts.add(tx.senderAccount);
      dst.transactions.push(tx);
    }
  });

  const nodes = Object.values(accountStats).map((acc) => ({
    id: acc.id,
    type: 'accountNode',
    position: acc.position,
    data: {
      accountId: acc.id,
      label: acc.label,
      accountType: acc.accountType,
      jurisdiction: acc.jurisdiction,
      riskTier: acc.riskTier,
      riskScore: acc.riskScore,
      clusterId: acc.clusterId,
      clusterName: acc.clusterName,
      transactionCount: acc.transactionCount,
      totalInflow: acc.totalInflow,
      totalOutflow: acc.totalOutflow,
      connectedAccounts: Array.from(acc.connectedAccounts),
      isFocused: accountId === acc.id,
    },
  }));

  const nodeIds = new Set(nodes.map((n) => n.id));
  const edges = txList
    .filter((tx) => nodeIds.has(tx.senderAccount) && nodeIds.has(tx.receiverAccount))
    .map((tx) => {
      const edgeTier =
        tx.riskScore >= 80 ? 'high-risk' : tx.riskScore >= 55 ? 'suspicious' : 'normal';
      return {
        id: tx.id,
        source: tx.senderAccount,
        target: tx.receiverAccount,
        data: {
          transactionId: tx.id,
          amount: tx.amount,
          timestamp: tx.timestamp,
          riskScore: tx.riskScore,
          riskLevel: tx.riskLevel,
          status: tx.status,
          type: tx.type,
          edgeTier,
          clusterId: tx.clusterId,
        },
      };
    });

  return {
    label: 'Graph Visualization — Prototype Data',
    isPrototypeData: true,
    focusedAccountId: accountId,
    nodes,
    edges,
    clusters: [
      {
        id: 'cluster-alpha',
        name: 'Cluster Alpha — Mule Layering Ring',
        severity: 'CRITICAL',
        accountCount: nodes.filter((n) => n.data.clusterId === 'cluster-alpha').length,
        focusAccountId: 'ACC-9041',
      },
      {
        id: 'cluster-beta',
        name: 'Cluster Beta — Structuring Hub',
        severity: 'HIGH',
        accountCount: nodes.filter((n) => n.data.clusterId === 'cluster-beta').length,
        focusAccountId: 'ACC-5504',
      },
      {
        id: 'cluster-normal',
        name: 'Baseline Commercial Network',
        severity: 'LOW',
        accountCount: nodes.filter((n) => n.data.clusterId === 'cluster-normal').length,
        focusAccountId: 'ACC-2091',
      },
    ],
  };
}

/**
 * Fetches model evaluation metrics.
 * - mode: 'live' returns an honest empty/pending state until real GNN evaluation results are connected.
 * - mode: 'demo' returns explicitly flagged synthetic UI preview metrics.
 */
export async function getModelMetrics(mode = 'demo') {
  await waitBrief(70);
  if (mode === 'live') {
    return {
      isDemo: false,
      status: 'pending_evaluation',
      apiUrl: API_BASE_URL,
      message:
        'Live model evaluation telemetry has not been connected yet. Point NEXT_PUBLIC_API_URL to the GNN Edge Classifier evaluation endpoint to populate verified production metrics.',
      modelRegistry: MOCK_DEMO_MODEL_METRICS.modelRegistry,
    };
  }
  return MOCK_DEMO_MODEL_METRICS;
}

export async function getSystemStatus() {
  await waitBrief(40);
  return {
    isPrototypeData: true,
    services: MOCK_SYSTEM_STATUS,
  };
}

export async function getNotifications() {
  await waitBrief(30);
  return MOCK_NOTIFICATIONS;
}

/**
 * Simulates an analyst action locally without making any real banking or backend calls.
 */
export async function simulateTransactionAction(transactionId, actionId) {
  await waitBrief(80);
  const definition = SIMULATED_ACTIONS.find((a) => a.id === actionId);
  if (!definition) {
    throw new Error(`Unsupported simulated action: ${actionId}`);
  }
  return {
    transactionId,
    actionId: definition.id,
    actionLabel: definition.label,
    resultingStatus: definition.resultingStatus,
    summary: definition.summary,
    timestamp: new Date().toISOString(),
    simulated: true,
  };
}
