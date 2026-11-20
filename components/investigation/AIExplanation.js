'use client';

import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';

export default function AIExplanation({ explanation }) {
  if (!explanation) return null;

  return (
    <Card
      title="AI Explanation Brief"
      subtitle="Structured natural-language rationale for fraud investigators"
      action={<Badge variant="violet">Simulated · No Live LLM</Badge>}
    >
      <div className="space-y-4">
        <div>
          <div className="text-[11px] font-medium text-[#64748B]">Why This Transaction Was Flagged</div>
          <p className="mt-1.5 text-xs leading-relaxed text-[#0F172A]">{explanation.summary}</p>
        </div>

        <div className="border-t border-[#F1F5F9] pt-3.5">
          <div className="text-[11px] font-medium text-[#64748B]">Contributing Risk Factors</div>
          <ul className="mt-2 space-y-1.5 text-xs text-[#334155]">
            {(explanation.contributingFactors || []).map((factor, idx) => (
              <li key={idx} className="flex items-start gap-2.5 leading-relaxed">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#0284C7]" aria-hidden="true" />
                <span>{factor}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="grid grid-cols-1 gap-3 border-t border-[#F1F5F9] pt-3.5 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <div className="text-[11px] font-medium text-[#64748B]">Recommended Analyst Action</div>
            <p className="mt-1 text-xs leading-relaxed text-[#0F172A]">
              {explanation.recommendedAction}
            </p>
          </div>
          <div className="rounded-md border border-[#E2E8F0] bg-[#F8FAFC] p-3">
            <div className="text-[11px] text-[#64748B]">Prototype Model Score</div>
            <div className="mt-1 font-mono text-lg font-semibold tabular-nums text-[#0284C7]">
              {typeof explanation.confidence === 'number'
                ? `${Math.round(explanation.confidence * 100)}%`
                : 'N/A'}
            </div>
            <div className="mt-0.5 text-[11px] text-[#64748B] truncate">
              {explanation.modelRef || 'GNN Prototype'}
            </div>
          </div>
        </div>

        <div className="rounded border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2 text-[11px] text-[#64748B]">
          Simulated Explanation: Generated from deterministic prototype templates. No external LLM API is connected in this demo.
        </div>
      </div>
    </Card>
  );
}
