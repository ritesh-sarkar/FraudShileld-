# FinSphere — FraudShield | System Dashboard Specification

## Purpose

This document defines the information architecture and data presentation rules for the FraudShield analyst-facing prototype dashboard. It is a frontend/product specification, not evidence that every screen or integration is already implemented.

## Global interface rules

- Desktop-first financial operations interface.
- Prioritize readable tables, clear risk labels, and traceable evidence.
- Use restrained financial-product styling.
- Risk status colours: green for `ALLOW`/low, amber for `VERIFY`/medium, red for `HOLD`/high.
- Show a persistent `SIMULATION ONLY` label wherever a Guardian decision appears.
- Label scores `Risk score` or `Relative risk`; never call them `fraud probability`.
- Display dataset attribution: `IBM AMLSim 1K — synthetic SAR proxy labels`.
- Keep model metrics paired with evaluation split and positive sample count.
- Mark unsupported integrations and placeholder content explicitly.

## 1. Overview

**Purpose:** Give an analyst a fast summary of the synthetic demo environment.

**Specified elements:**
- Transactions monitored (demo fixture count).
- High-risk queue (demo policy output).
- Accounts screened (demo fixture count).
- Model/module status.
- Risk distribution chart.
- Recent high-risk transactions.

**Data source:** `GET /api/overview`.

Do not imply a live stream or live bank monitoring.

## 2. Transaction Monitor

**Purpose:** Search and inspect precomputed transaction records.

**Suggested columns:**

| Field | Meaning |
|---|---|
| Transaction ID | Synthetic transaction identifier |
| Time | Fixture timestamp |
| Sender | Synthetic sender account ID |
| Receiver | Synthetic receiver account ID |
| Amount | Transaction amount in fixture |
| Relative risk | Fusion rank score |
| Risk band | Prototype risk band |
| Decision | `ALLOW`, `VERIFY`, or `HOLD` — simulation only |

**Filters:** Decision, simulation seed, date, risk range, transaction/account search.

**Current API support:** `GET /api/transactions` supports `decision`, `search`, and `limit`. Seed/date/risk-range filters may require frontend-side filtering or future API support; do not claim they are server-side filters unless implemented.

## 3. Transaction Detail

**Purpose:** Present the evidence available for one synthetic transaction.

**Specified elements:**
- Sender and receiver IDs.
- Amount and timestamp.
- XGBoost transaction signal.
- Graph Edge signal.
- Account risk signal.
- Anomaly signal.
- Fused relative risk score.
- Guardian demo decision.
- Top component reasons.
- Audit timeline placeholder.

**Data source:** `GET /api/transactions/{transaction_id}`.

Do not imply that a reason generated from component scores is a complete causal explanation.

## 4. Account Intelligence

**Purpose:** Review account-level synthetic risk outputs.

**Available elements:**
- Account ID.
- Extra Trees account score.
- GraphSAGE node score.
- Account risk score where provided by fixture.

Counterparty lists, detailed transaction volume histories, and full account timelines are placeholders unless the relevant data is supplied. The synthetic SAR membership label is evaluation-only and must not be shown in the UI.

**Data source:** `GET /api/accounts/{account_id}`.

## 5. Graph Explorer

**Purpose:** Provide a visual investigation surface for account-to-account relationships.

**Planned visual elements:**
- Account nodes.
- Directed transaction edges.
- Selected account and counterparties.
- Edge amount and time metadata where available.
- Highlighted paths and clusters when supported by graph data.

**Current status:** Graph data integration is a design placeholder in the supplied package. Do not fabricate connected accounts, paths, clusters, or suspicious network findings. Use clearly labelled sample/demo graph data only if it is separately created for visualization.

**Planned feature name:** FlowTrace.

## 6. Model Center

Show these exact module names and statuses:

| Module | Status | Display guidance |
|---|---|---|
| XGBoost Transaction Fraud | `TRAINED_BASELINE` | AP, ROC-AUC, evaluation size and positives |
| Extra Trees Account Risk | `TRAINED_BASELINE` | Account-level metrics and limitations |
| GraphSAGE Node Classifier | `TRAINED_BASELINE` | Account-level metrics and 32-d embedding note |
| GraphSAGE Embedding + Edge MLP | `TRAINED_BASELINE` | Relationship score; emphasize low AP |
| Isolation Forest | `TRAINED_BASELINE` | Unsupervised anomaly score; no supervised fraud metric |
| Risk Fusion | `PROTOTYPE_RULE_BASED` | Fixed weighted percentile-rank formula |
| Transaction Guardian | `PROTOTYPE_POLICY` | Deterministic demo thresholds |

## 7. Decision & Audit

**Purpose:** Show the prototype policy output and provide a future place for analyst review history.

**Current elements:** Simulated decision, risk band, component signals, and demo policy thresholds.

**Placeholder/future elements:** Analyst identity, case assignment, review notes, escalation, immutable audit record, and feedback-to-model workflow. These require backend persistence and access control.

## Risk Fusion card

Current formula:

`Fusion = 0.35 × XGBoost + 0.25 × Graph Edge + 0.25 × Account Risk + 0.15 × Anomaly`

Inputs are percentile-ranked component scores. The result is a relative ranking, not a calibrated probability.

## Guardian card

| Relative risk score | Decision | Display text |
|---|---|---|
| `< 0.65` | `ALLOW` | No additional step in demo policy |
| `0.65–<0.85` | `VERIFY` | Step-up verification required (demo) |
| `>= 0.85` | `HOLD` | Manual review required (demo) |

Display `SIMULATION ONLY` prominently on all outcomes.

## Dashboard API reference

Base URL: `http://localhost:8000`

| Method | Endpoint | Dashboard use |
|---|---|---|
| GET | `/api/health` | Environment/service label |
| GET | `/api/overview` | Overview page |
| GET | `/api/models` | Model Center |
| GET | `/api/transactions` | Transaction Monitor |
| GET | `/api/transactions/{transaction_id}` | Transaction Detail |
| GET | `/api/accounts/{account_id}` | Account Intelligence |
| POST | `/api/guardian/evaluate` | Demo risk decision calculation |

## Dashboard acceptance checklist

- [ ] Every demo decision visibly says `SIMULATION ONLY`.
- [ ] No page describes the current API as a live banking feed.
- [ ] Scores are not labelled as fraud probabilities.
- [ ] Dataset is identified as synthetic AMLSim SAR/typology proxy data.
- [ ] Evaluation-only SAR membership labels are not exposed.
- [ ] Model metrics include test-set size and positive count.
- [ ] Unsupported graph and audit functionality is labelled as placeholder/planned.
- [ ] Empty or missing fields are shown as unavailable, not invented.
