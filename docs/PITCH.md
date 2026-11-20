# FinSphere — FraudShield | Product Brief & Pitch

## 1. Project overview

**FinSphere — FraudShield** is a research and hackathon prototype for transaction fraud-risk analysis. It combines transaction behaviour, account-level context, graph relationships, and unsupervised anomaly signals to support risk ranking and investigation.

**Challenge statement:** Real-time fraud and anomaly detection across transactions.  
**Specific focus:** Detection precision with fewer false positives.

## 2. Problem

Financial crime can involve more than one suspicious payment. Funds may pass through multiple accounts, while a decision based only on an individual transaction can miss the wider relationship context. At the same time, overly sensitive detection can generate false alerts and create unnecessary friction for legitimate customers.

FraudShield explores a multi-signal approach: evaluate the transaction, consider account history, assess the sender–receiver relationship, and identify unusual behaviour.

## 3. Proposed solution

The prototype brings together five trained baseline models:

1. **XGBoost Transaction Fraud** — transaction behaviour and prior sender, receiver, and pair patterns.
2. **Extra Trees Account Risk** — historical account-context risk.
3. **GraphSAGE Node Classifier** — account features and historical graph-neighbour context.
4. **GraphSAGE Embedding + Edge MLP** — relationship risk between source and destination accounts.
5. **Isolation Forest** — unusual transaction patterns without requiring supervised fraud labels.

A fixed weighted Risk Fusion baseline combines four percentile-ranked signals. A deterministic Transaction Guardian maps the fused score to a simulated `ALLOW`, `VERIFY`, or `HOLD` outcome.

## 4. Intended users

- **Fraud and financial-crime analysts:** Review suspicious transactions and account relationships.
- **Risk operations teams:** Monitor risk signals and simulated decision outcomes.
- **Technical evaluators:** Inspect model evaluation, data limitations, API behaviour, and system architecture.

A customer-facing transaction experience may be added as part of future product development. The current handoff primarily specifies an analyst-facing monitoring prototype.

## 5. User and analyst workflow

### Customer-side concept (future)

1. A customer initiates a payment through a participating banking channel.
2. The transaction is evaluated by the bank's authorized risk system.
3. If additional verification is required, the customer receives a clear verification request.
4. The customer sees an understandable transaction status.

This is a proposed experience only. No customer app or bank integration is included in the current prototype.

### Analyst-side prototype

1. The analyst opens the Overview dashboard.
2. The analyst searches or filters the precomputed transaction monitor.
3. The analyst opens a transaction detail view and reviews the available model signals and reasons.
4. The analyst checks account risk details.
5. The analyst reviews the simulated Guardian outcome.

Graph Explorer and persistent decision/audit workflows are specified as interface concepts/placeholders in the frontend handoff; they are not complete live integrations in the current package.

## 6. Differentiating development areas

| Planned capability | Purpose | Status |
|---|---|---|
| FlowTrace | Explore account connections and multi-hop fund movement | Planned |
| PrecisionGate | Select operating thresholds using validation data and monitor precision/recall/false positives | Planned |
| CaseLens | Generate evidence-grounded investigation summaries and reason codes | Planned |
| Live scoring pipeline | Generate features and run model inference per transaction | Planned |
| Analyst review and audit | Capture human decisions and maintain review history | Planned |

These are roadmap items, not current implemented capabilities.

## 7. Current evidence

The packaged experiment uses IBM AMLSim 1K synthetic data with SAR/typology proxy labels. The transaction test set contains 170,004 rows and 88 positive proxy labels; the account test set contains 2,892 rows and 151 positive proxy labels. Reference model metrics are documented in [Technical Whitepaper](TECHNICAL_WHITEPAPER.md#8-reference-evaluation-results).

The strongest current transaction-level ranking baseline is XGBoost (Average Precision 47.32%, ROC-AUC 93.67%). This does not mean the system is production-ready or that its selected operating threshold has acceptable precision. The packaged edge model has low Average Precision (1.23%), and requires improvement and careful validation.

## 8. Short pitch

> FinSphere's FraudShield is a multi-signal financial fraud-risk prototype. It combines transaction-level machine learning, account-risk analysis, graph-based relationship scoring, and unsupervised anomaly detection. Its current demo uses synthetic AMLSim test data, a transparent weighted risk-fusion rule, and a simulation-only decision policy. Our next development priorities are FlowTrace for network investigation, PrecisionGate for precision-aware thresholding, and CaseLens for evidence-grounded analyst explanations.

## 9. Scope and limitations

FraudShield is a prototype. It is not connected to a bank, payment gateway, or live transaction stream. Its API serves precomputed synthetic test results. Its scores are not calibrated fraud probabilities, and its decision policy is not an approved financial institution policy.
