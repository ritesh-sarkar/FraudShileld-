// Centralized FraudShield risk levels, transaction statuses, model statuses, and navigation configuration

export const RISK_LEVELS = {
  LOW: {
    key: 'LOW',
    label: 'Low Risk',
    shortLabel: 'Low',
    min: 0,
    max: 29,
    color: '#16A34A',
    textClass: 'text-[#15803D]',
    bgClass: 'bg-[#F0FDF4]',
    borderClass: 'border-[#BBF7D0]',
    barClass: 'bg-[#16A34A]',
  },
  MEDIUM: {
    key: 'MEDIUM',
    label: 'Medium Risk',
    shortLabel: 'Medium',
    min: 30,
    max: 59,
    color: '#D97706',
    textClass: 'text-[#B45309]',
    bgClass: 'bg-[#FFFBEB]',
    borderClass: 'border-[#FDE68A]',
    barClass: 'bg-[#D97706]',
  },
  HIGH: {
    key: 'HIGH',
    label: 'High Risk',
    shortLabel: 'High',
    min: 60,
    max: 79,
    color: '#EA580C',
    textClass: 'text-[#C2410C]',
    bgClass: 'bg-[#FFF7ED]',
    borderClass: 'border-[#FED7AA]',
    barClass: 'bg-[#EA580C]',
  },
  CRITICAL: {
    key: 'CRITICAL',
    label: 'Critical Risk',
    shortLabel: 'Critical',
    min: 80,
    max: 100,
    color: '#DC2626',
    textClass: 'text-[#B91C1C]',
    bgClass: 'bg-[#FEF2F2]',
    borderClass: 'border-[#FECACA]',
    barClass: 'bg-[#DC2626]',
  },
};

export const TRANSACTION_STATUSES = {
  Approved: {
    key: 'Approved',
    label: 'Approved',
    color: '#16A34A',
    textClass: 'text-[#15803D]',
    bgClass: 'bg-[#F0FDF4]',
    borderClass: 'border-[#BBF7D0]',
  },
  'Under Review': {
    key: 'Under Review',
    label: 'Under Review',
    color: '#D97706',
    textClass: 'text-[#B45309]',
    bgClass: 'bg-[#FFFBEB]',
    borderClass: 'border-[#FDE68A]',
  },
  Flagged: {
    key: 'Flagged',
    label: 'Flagged',
    color: '#EA580C',
    textClass: 'text-[#C2410C]',
    bgClass: 'bg-[#FFF7ED]',
    borderClass: 'border-[#FED7AA]',
  },
  Blocked: {
    key: 'Blocked',
    label: 'Blocked',
    color: '#DC2626',
    textClass: 'text-[#B91C1C]',
    bgClass: 'bg-[#FEF2F2]',
    borderClass: 'border-[#FECACA]',
  },
};

export const MODEL_STATUSES = {
  prototype: {
    key: 'prototype',
    label: 'Prototype',
    description: 'Working prototype implementation — connected via frontend adapter stub.',
    textClass: 'text-[#0369A1]',
    bgClass: 'bg-[#F0F9FF]',
    borderClass: 'border-[#BAE6FD]',
  },
  integration_pending: {
    key: 'integration_pending',
    label: 'Integration Pending',
    description: 'Architecture slot reserved; awaiting live backend inference endpoint.',
    textClass: 'text-[#B45309]',
    bgClass: 'bg-[#FFFBEB]',
    borderClass: 'border-[#FDE68A]',
  },
  mock_prediction: {
    key: 'mock_prediction',
    label: 'Mock Prediction',
    description: 'Displaying simulated heuristic scores for prototype demonstration only.',
    textClass: 'text-[#6D28D9]',
    bgClass: 'bg-[#F5F3FF]',
    borderClass: 'border-[#DDD6FE]',
  },
  not_implemented: {
    key: 'not_implemented',
    label: 'Not Implemented',
    description: 'Planned architecture module not yet implemented in this prototype.',
    textClass: 'text-[#475569]',
    bgClass: 'bg-[#F1F5F9]',
    borderClass: 'border-[#CBD5E1]',
  },
};

export const NAVIGATION_ITEMS = [
  {
    id: 'overview',
    label: 'Overview',
    title: 'Security Overview',
    breadcrumb: ['FraudShield', 'Overview'],
    description: 'Real-time prototype transaction posture, risk distribution, and alert triage.',
  },
  {
    id: 'transactions',
    label: 'Transaction Monitoring',
    title: 'Transaction Monitoring',
    breadcrumb: ['FraudShield', 'Transactions'],
    description: 'Search, filter, and inspect incoming account transfers and risk assessments.',
  },
  {
    id: 'graph',
    label: 'Graph Intelligence',
    title: 'Graph Intelligence',
    breadcrumb: ['FraudShield', 'Graph Intelligence'],
    description: 'Interactive account-to-account transfer topology and suspicious cluster analysis.',
  },
  {
    id: 'investigations',
    label: 'Investigations',
    title: 'Case Investigations',
    breadcrumb: ['FraudShield', 'Investigations'],
    description: 'Deep-dive transaction evidence, model prediction slots, and simulated analyst actions.',
  },
  {
    id: 'performance',
    label: 'Model Performance',
    title: 'Model Performance',
    breadcrumb: ['FraudShield', 'Model Performance'],
    description: 'Evaluation readiness dashboard and labeled demo preview metrics.',
  },
];

export const CHART_RANGES = [
  { id: '24h', label: '24 Hours' },
  { id: '7d', label: '7 Days' },
  { id: '30d', label: '30 Days' },
];

export const TRANSACTION_TYPES = [
  'Wire Transfer',
  'ACH Credit',
  'Instant P2P',
  'Cross-Border SWIFT',
  'Crypto On-Ramp',
  'Card-Not-Present',
];

export const DATE_FILTER_OPTIONS = [
  { id: 'all', label: 'All Dates' },
  { id: '24h', label: 'Last 24 Hours' },
  { id: '7d', label: 'Last 7 Days' },
  { id: '30d', label: 'Last 30 Days' },
];

export const SIMULATED_ACTIONS = [
  {
    id: 'reviewed',
    label: 'Mark as Reviewed',
    resultingStatus: 'Under Review',
    variant: 'secondary',
    summary: 'Logged analyst review note in local session state.',
  },
  {
    id: 'escalate',
    label: 'Escalate',
    resultingStatus: 'Flagged',
    variant: 'warning',
    summary: 'Escalated case to Tier-2 fraud queue (simulated local state).',
  },
  {
    id: 'hold',
    label: 'Simulate Hold',
    resultingStatus: 'Blocked',
    variant: 'danger',
    summary: 'Applied simulated funds hold — no real banking action executed.',
  },
  {
    id: 'approve',
    label: 'Approve',
    resultingStatus: 'Approved',
    variant: 'success',
    summary: 'Marked transaction approved in local prototype session.',
  },
];
