'use client';

import { useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { formatNumber } from '@/lib/utils';

function PRTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  const gnn = payload.find((p) => p.dataKey === 'precision')?.value;
  const base = payload.find((p) => p.dataKey === 'baseline')?.value;

  return (
    <div className="rounded-md border border-[#CBD5E1] bg-white px-3 py-2 text-xs shadow-lg">
      <div className="font-mono text-[11px] text-[#64748B]">Recall: {label}</div>
      <div className="mt-1 space-y-1 font-mono tabular-nums">
        <div className="font-medium text-[#0284C7]">GNN Demo Preview: {gnn}</div>
        <div className="text-[#64748B]">Rule Baseline Demo: {base}</div>
      </div>
    </div>
  );
}

function ComparisonTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  const row = payload[0]?.payload;
  return (
    <div className="rounded-md border border-[#CBD5E1] bg-white px-3 py-2.5 text-xs shadow-lg">
      <div className="font-medium text-[#0F172A]">{label}</div>
      <div className="mb-1.5 text-[11px] text-[#64748B]">Status: {row?.status}</div>
      <div className="space-y-1 font-mono tabular-nums">
        {payload.map((entry) => (
          <div key={entry.dataKey} className="flex items-center justify-between gap-4">
            <span style={{ color: entry.color }}>{entry.name}</span>
            <span className="font-medium text-[#0F172A]">{entry.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PerformanceCharts({ metrics }) {
  const [activeCell, setActiveCell] = useState('tp');
  if (!metrics) return null;

  const cm = metrics.confusionMatrix;
  const total = cm.totalSamples || 1;

  const matrixCells = [
    {
      id: 'tp',
      label: 'True Positive',
      short: 'TP',
      count: cm.truePositive,
      share: ((cm.truePositive / total) * 100).toFixed(1),
      tone: 'border-[#BBF7D0] bg-[#F0FDF4] text-[#15803D]',
      note: 'Simulated fraudulent transfers correctly flagged by the demo operating threshold.',
    },
    {
      id: 'fn',
      label: 'False Negative',
      short: 'FN',
      count: cm.falseNegative,
      share: ((cm.falseNegative / total) * 100).toFixed(1),
      tone: 'border-[#FECACA] bg-[#FEF2F2] text-[#B91C1C]',
      note: 'Simulated fraudulent transfers missed under the demo threshold (recall cost).',
    },
    {
      id: 'fp',
      label: 'False Positive',
      short: 'FP',
      count: cm.falsePositive,
      share: ((cm.falsePositive / total) * 100).toFixed(1),
      tone: 'border-[#FDE68A] bg-[#FFFBEB] text-[#B45309]',
      note: 'Legitimate transfers incorrectly escalated for analyst review (customer friction).',
    },
    {
      id: 'tn',
      label: 'True Negative',
      short: 'TN',
      count: cm.trueNegative,
      share: ((cm.trueNegative / total) * 100).toFixed(1),
      tone: 'border-[#BAE6FD] bg-[#F0F9FF] text-[#0369A1]',
      note: 'Legitimate transfers correctly cleared without manual intervention.',
    },
  ];

  const selectedCell = matrixCells.find((c) => c.id === activeCell) || matrixCells[0];

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
      {/* Confusion Matrix */}
      <Card
        title="Confusion Matrix (Demo Preview)"
        subtitle="Synthetic 2x2 classification preview — click a quadrant to inspect"
        action={<Badge variant="warning">Demo Only</Badge>}
        className="lg:col-span-5"
      >
        <div className="mb-2 grid grid-cols-2 gap-2 text-center text-[11px] font-medium text-[#64748B]">
          <div>Predicted Fraud</div>
          <div>Predicted Legitimate</div>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {matrixCells.map((cell) => {
            const isSelected = cell.id === activeCell;
            return (
              <button
                key={cell.id}
                type="button"
                onClick={() => setActiveCell(cell.id)}
                className={`rounded-md border p-4 text-left transition-all cursor-pointer ${cell.tone} ${
                  isSelected ? 'ring-2 ring-[#0284C7]' : 'opacity-90 hover:opacity-100'
                }`}
              >
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-medium">{cell.label}</span>
                  <span className="font-mono font-semibold">{cell.short}</span>
                </div>
                <div className="mt-2 font-mono text-2xl font-semibold tabular-nums text-[#0F172A]">
                  {formatNumber(cell.count)}
                </div>
                <div className="mt-0.5 font-mono text-[11px] tabular-nums text-[#475569]">
                  {cell.share}% of {formatNumber(total)}
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-4 rounded-md border border-[#E2E8F0] bg-[#F8FAFC] p-3 text-xs leading-relaxed text-[#475569]">
          <span className="font-semibold text-[#0F172A]">{selectedCell.label}: </span>
          {selectedCell.note}
        </div>
      </Card>

      {/* Precision / Recall Curve */}
      <Card
        title="Precision / Recall Curve (Demo Preview)"
        subtitle="Simulated GNN prototype curve vs baseline heuristic across recall thresholds"
        action={<Badge variant="warning">Demo Only</Badge>}
        className="lg:col-span-7"
      >
        <div className="h-[296px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={metrics.precisionRecallCurve}
              margin={{ top: 10, right: 12, left: -14, bottom: 4 }}
            >
              <defs>
                <linearGradient id="fsPrGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0284C7" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#0284C7" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#E2E8F0" strokeDasharray="3 3" />
              <XAxis
                dataKey="recall"
                tick={{ fill: '#64748B', fontSize: 11, fontFamily: 'var(--font-jetbrains-mono)' }}
                axisLine={{ stroke: '#CBD5E1' }}
                tickLine={false}
              />
              <YAxis
                domain={[0, 1]}
                tick={{ fill: '#64748B', fontSize: 11, fontFamily: 'var(--font-jetbrains-mono)' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<PRTooltip />} />
              <Area
                type="monotone"
                dataKey="precision"
                name="GNN Prototype (Demo)"
                stroke="#0284C7"
                strokeWidth={2}
                fill="url(#fsPrGrad)"
              />
              <Area
                type="monotone"
                dataKey="baseline"
                name="Baseline Heuristic (Demo)"
                stroke="#7C3AED"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                fill="none"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Model Comparison Chart */}
      <Card
        title="Planned Architecture Comparison (Demo Preview)"
        subtitle="Illustrative placeholder benchmark targets — not actual evaluation results"
        action={<Badge variant="warning">DEMO METRICS — NOT ACTUAL EVALUATION</Badge>}
        className="lg:col-span-12"
      >
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={metrics.modelComparison}
              margin={{ top: 10, right: 16, left: -12, bottom: 4 }}
              barGap={4}
            >
              <CartesianGrid stroke="#E2E8F0" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="model"
                tick={{ fill: '#334155', fontSize: 11 }}
                axisLine={{ stroke: '#CBD5E1' }}
                tickLine={false}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fill: '#64748B', fontSize: 11, fontFamily: 'var(--font-jetbrains-mono)' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip content={<ComparisonTooltip />} cursor={{ fill: '#F1F5F9' }} />
              <Legend
                wrapperStyle={{ fontSize: 11, color: '#475569', paddingTop: 8 }}
              />
              <Bar dataKey="precision" name="Precision" fill="#0284C7" radius={[2, 2, 0, 0]} />
              <Bar dataKey="recall" name="Recall" fill="#7C3AED" radius={[2, 2, 0, 0]} />
              <Bar dataKey="f1" name="F1 Score" fill="#16A34A" radius={[2, 2, 0, 0]} />
              <Bar dataKey="prAuc" name="PR-AUC" fill="#D97706" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
