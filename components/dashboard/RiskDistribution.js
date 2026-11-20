'use client';

import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import Card from '@/components/ui/Card';

function RiskTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const item = payload[0].payload;
  return (
    <div className="rounded-md border border-[#CBD5E1] bg-white px-3 py-2 text-xs shadow-lg">
      <div className="font-medium text-[#0F172A]">{item.name}</div>
      <div className="mt-1 font-mono tabular-nums text-[#64748B]">
        {item.count} transactions ({item.percentage}%)
      </div>
    </div>
  );
}

export default function RiskDistribution({ distribution, loading = false, onSelectRisk }) {
  const buckets = distribution?.buckets || [];
  const total = distribution?.total || 0;

  return (
    <Card
      title="Risk Distribution"
      subtitle="Active monitored ledger segmented by risk tier"
      action={
        <span className="font-mono text-xs tabular-nums text-[#64748B]">
          {total} total
        </span>
      }
    >
      {loading ? (
        <div className="h-[268px] animate-pulse rounded bg-[#F1F5F9]" />
      ) : (
        <div className="flex h-full flex-col justify-between gap-4">
          <div className="h-[156px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={buckets}
                layout="vertical"
                margin={{ top: 2, right: 14, left: 0, bottom: 2 }}
                barCategoryGap="24%"
              >
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={92}
                  tick={{ fill: '#475569', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<RiskTooltip />} cursor={{ fill: '#F1F5F9' }} />
                <Bar
                  dataKey="count"
                  radius={[0, 3, 3, 0]}
                  onClick={(entry) => entry?.key && onSelectRisk?.(entry.key)}
                  className="cursor-pointer"
                >
                  {buckets.map((bucket) => (
                    <Cell key={bucket.key} fill={bucket.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="divide-y divide-[#F1F5F9] border-t border-[#E2E8F0]">
            {buckets.map((bucket) => (
              <button
                key={bucket.key}
                type="button"
                onClick={() => onSelectRisk?.(bucket.key)}
                className="flex w-full items-center justify-between py-2 text-xs transition-colors hover:bg-[#F8FAFC] px-1.5 rounded cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className="h-2.5 w-2.5 rounded-[2px] shrink-0"
                    style={{ backgroundColor: bucket.color }}
                    aria-hidden="true"
                  />
                  <span className="font-medium text-[#0F172A]">{bucket.name}</span>
                </div>
                <div className="flex items-center gap-3 font-mono tabular-nums">
                  <span className="text-[#0F172A]">{bucket.count}</span>
                  <span className="w-10 text-right text-[#64748B]">{bucket.percentage}%</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
