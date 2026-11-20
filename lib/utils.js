import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { RISK_LEVELS } from './constants';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount, options = {}) {
  const num = Number(amount);
  if (Number.isNaN(num)) return '$0.00';
  const { compact = false, maximumFractionDigits = 2 } = options;
  if (compact) {
    if (num >= 1_000_000) {
      return `$${(num / 1_000_000).toFixed(2)}M`;
    }
    if (num >= 1_000) {
      return `$${(num / 1_000).toFixed(1)}K`;
    }
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: maximumFractionDigits === 0 ? 0 : 2,
    maximumFractionDigits,
  }).format(num);
}

export function formatNumber(value) {
  const num = Number(value);
  if (Number.isNaN(num)) return '0';
  return new Intl.NumberFormat('en-US').format(num);
}

export function formatTimestamp(isoString) {
  if (!isoString) return '—';
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return isoString;
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  const seconds = String(date.getUTCSeconds()).padStart(2, '0');
  return `${date.getUTCFullYear()}-${month}-${day} ${hours}:${minutes}:${seconds} UTC`;
}

export function formatShortTime(isoString) {
  if (!isoString) return '—';
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return isoString;
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  return `${monthNames[date.getUTCMonth()]} ${date.getUTCDate()}, ${hours}:${minutes}`;
}

export function formatRelativeAge(isoString, referenceIso = '2026-11-19T19:35:00Z') {
  if (!isoString) return '—';
  const then = new Date(isoString).getTime();
  const ref = new Date(referenceIso).getTime();
  if (Number.isNaN(then)) return '—';
  const diffMinutes = Math.max(1, Math.round((ref - then) / 60000));
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.round(diffHours / 24);
  return `${diffDays}d ago`;
}

export function getRiskLevelFromScore(score) {
  const numeric = Number(score) || 0;
  if (numeric >= 80) return 'CRITICAL';
  if (numeric >= 60) return 'HIGH';
  if (numeric >= 30) return 'MEDIUM';
  return 'LOW';
}

export function getRiskConfig(levelOrScore) {
  if (typeof levelOrScore === 'number') {
    return RISK_LEVELS[getRiskLevelFromScore(levelOrScore)];
  }
  const normalized = String(levelOrScore || 'LOW').toUpperCase();
  return RISK_LEVELS[normalized] || RISK_LEVELS.LOW;
}

export function exportTransactionsToCsv(transactions) {
  const headers = [
    'Transaction ID',
    'Source Account',
    'Destination Account',
    'Amount (USD)',
    'Type',
    'Timestamp (UTC)',
    'Risk Score',
    'Risk Level',
    'Status',
  ];

  const rows = transactions.map((tx) => [
    tx.id,
    tx.senderAccount,
    tx.receiverAccount,
    tx.amount.toFixed(2),
    tx.type,
    tx.timestamp,
    tx.riskScore,
    tx.riskLevel,
    tx.status,
  ]);

  const csvContent = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `fraudshield-prototype-transactions-${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
