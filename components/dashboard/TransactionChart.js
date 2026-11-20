'use client';

import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import Card from '@/components/ui/Card';
import { CHART_RANGES } from '@/lib/constants';
import { formatNumber } from '@/lib/utils';

function CustomActivityTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  const total = payload.find((item) => item.dataKey === 'total')?.value ?? 0;
  const fraudulent = payload.find((item) => item.dataKey === 'fraudulent')?.value ?? 0;
  const rate = total > 0 ? ((fraudulent / total) * 100).toFixed(2) : '0.00';

  return (
    <div className="rounded-md border border-[#CBD5E1] bg-white px-3.5 py-2.5 shadow-lg">
      <div className="mb-2 font-mono text-[11px] font-medium text-[#64748B]">{label}</div>
      <div className="space-y-1.5 text-xs">
        <div className="flex items-center justify-between gap-6">
          <span className="text-[#64748B]">Total Transactions</span>
          <span className="font-mono font-semibold tabular-nums text-[#0284C7]">
            {formatNumber(total)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-6">
          <span className="text-[#64748B]">Fraudulent Flagged</span>
          <span className="font-mono font-semibold tabular-nums text-[#DC2626]">
            {formatNumber(fraudulent)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-6 border-t border-[#E2E8F0] pt-1.5">
          <span className="text-[#64748B]">Observed Fraud Rate</span>
          <span className="font-mono tabular-nums text-[#0F172A]">{rate}%</span>
        </div>
      </div>
    </div>
  );
}

export default function TransactionChart({
  data = [],
  range = '24h',
  onRangeChange,
  loading = false,
}) {
  const totalVolume = data.reduce((sum, pt) => sum + (pt.total || 0), 0);
  const totalFraud = data.reduce((sum, pt) => sum + (pt.fraudulent || 0), 0);

  return (
    <Card
      title="Transaction Activity"
      subtitle="Simulated total transaction throughput against detected fraudulent events"
      action={
        <div
          className="inline-flex items-center rounded-md border border-[#E2E8F0] bg-[#F1F5F9] p-0.5"
          role="group"
          aria-label="Chart time range"
        >
          {CHART_RANGES.map((item) => {
            const active = range === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onRangeChange?.(item.id)}
                className={`rounded px-2.5 py-1 text-xs font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  active
                    ? 'bg-white text-[#0284C7] shadow-xs'
                    : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      }
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4 border-b border-[#F1F5F9] pb-3 text-xs">
        <div className="flex flex-wrap items-center gap-5">
          <div className="flex items-center gap-2">
            <span className="h-0.5 w-3.5 bg-[#0284C7]" aria-hidden="true" />
            <span className="text-[#64748B]">Total Volume:</span>
            <span className="font-mono font-semibold tabular-nums text-[#0F172A]">
              {formatNumber(totalVolume)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-0.5 w-3.5 bg-[#DC2626]" aria-hidden="true" />
            <span className="text-[#64748B]">Fraudulent:</span>
            <span className="font-mono font-semibold tabular-nums text-[#DC2626]">
              {formatNumber(totalFraud)}
            </span>
          </div>
        </div>
        <span className="text-[11px] text-[#64748B]">Prototype time-series data</span>
      </div>

      {loading ? (
        <div className="h-[268px] animate-pulse rounded bg-[#F1F5F9]" />
      ) : (
        <div className="h-[268px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
              <defs>
                <linearGradient id="fsTotalGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0284C7" stopOpacity={0.18} />
                  <stop offset="95%" stopColor="#0284C7" stopOpacity={0.01} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#E2E8F0" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fill: '#64748B', fontSize: 11, fontFamily: 'var(--font-jetbrains-mono)' }}
                axisLine={{ stroke: '#CBD5E1' }}
                tickLine={false}
              />
              <YAxis
                yAxisId="left"
                tick={{ fill: '#64748B', fontSize: 11, fontFamily: 'var(--font-jetbrains-mono)' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v)}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fill: '#DC2626', fontSize: 11, fontFamily: 'var(--font-jetbrains-mono)' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomActivityTooltip />} />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="total"
                stroke="#0284C7"
                strokeWidth={2}
                fill="url(#fsTotalGrad)"
                activeDot={{ r: 4, fill: '#0284C7', stroke: '#FFFFFF', strokeWidth: 2 }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="fraudulent"
                stroke="#DC2626"
                strokeWidth={2}
                dot={{ r: 2.5, fill: '#DC2626', strokeWidth: 0 }}
                activeDot={{ r: 4.5, fill: '#DC2626', stroke: '#FFFFFF', strokeWidth: 2 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
