/**
 * Frontend-only demo risk calculation and prediction normalization engine.
 *
 * IMPORTANT:
 * This module exists strictly for hackathon prototype demonstration and
 * schema normalization. It does NOT perform live machine learning inference.
 * When the real GNN Edge Classifier backend is connected, normalized prediction
 * payloads from `lib/api.js` will map directly into the exact same contract.
 */

import { getRiskLevelFromScore } from './utils';

/**
 * Derive an actionable analyst recommendation from a normalized risk score.
 */
export function getDecisionRecommendation(riskScore) {
  if (riskScore >= 80) {
    return {
      code: 'HOLD_AND_ESCALATE',
      label: 'Simulate Hold & Escalate',
      summary: 'High likelihood of coordinated fraud pattern. Recommend immediate simulated hold and Tier-2 graph investigation.',
      tone: 'CRITICAL',
    };
  }
  if (riskScore >= 60) {
    return {
      code: 'MANUAL_REVIEW',
      label: 'Priority Analyst Review',
      summary: 'Multiple anomalous indicators detected. Verify beneficiary relationship and recent transfer velocity before release.',
      tone: 'HIGH',
    };
  }
  if (riskScore >= 30) {
    return {
      code: 'ENHANCED_MONITORING',
      label: 'Monitor & Secondary Check',
      summary: 'Moderate deviation from account baseline. Keep under passive observation or request step-up confirmation.',
      tone: 'MEDIUM',
    };
  }
  return {
    code: 'AUTO_APPROVE',
    label: 'Low Risk — Standard Settlement',
    summary: 'Consistent with established account history and counterparty graph neighborhood.',
    tone: 'LOW',
  };
}

/**
 * Demo heuristic calculator for prototype sandbox scoring.
 * Never represented as production ML inference.
 */
export function calculateDemoRiskScore({ amount = 0, velocityCount = 1, isNewReceiver = false, hasSuspiciousNeighbor = false, offHours = false }) {
  let score = 12;
  if (amount > 50000) score += 28;
  else if (amount > 15000) score += 18;
  else if (amount > 5000) score += 10;

  if (velocityCount >= 6) score += 22;
  else if (velocityCount >= 3) score += 12;

  if (isNewReceiver) score += 14;
  if (hasSuspiciousNeighbor) score += 24;
  if (offHours) score += 8;

  const clamped = Math.max(1, Math.min(99, Math.round(score)));
  return {
    riskScore: clamped,
    fraudProbability: Number((clamped / 100).toFixed(2)),
    riskLevel: getRiskLevelFromScore(clamped),
    isDemoCalculation: true,
  };
}

/**
 * Normalizes any transaction or future backend model payload into the standard
 * FraudShield prediction contract consumed across Investigation UI panels.
 */
export function normalizePredictionPayload(transaction) {
  if (!transaction) return null;

  const riskScore = Number(transaction.riskScore ?? 0);
  const fraudProbability = Number((transaction.gnnProbability ?? riskScore / 100).toFixed(2));
  const riskLevel = transaction.riskLevel || getRiskLevelFromScore(riskScore);
  const binaryLabel = riskScore >= 70 ? 'FRAUD' : riskScore >= 40 ? 'SUSPICIOUS' : 'LEGITIMATE';

  return {
    transactionId: transaction.id,
    prediction: {
      fraudProbability,
      riskScore,
      riskLevel,
      prediction: binaryLabel,
    },
    evidence: (transaction.evidence || []).map((item) => ({
      id: item.id,
      factor: item.factor,
      category: item.category,
      severity: item.severity,
      weight: item.weight,
      detail: item.detail,
      source: 'mock_prototype_data',
    })),
    model: {
      name: 'GNN Edge Classifier',
      status: 'prototype',
    },
    modelSuite: transaction.modelPredictions || [],
    timestamp: transaction.timestamp || new Date().toISOString(),
  };
}
