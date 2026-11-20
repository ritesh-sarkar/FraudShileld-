'use client';

import { Cpu, Database, FileSearch, GitBranch, Shield } from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';

const SERVICE_ICONS = {
  'tx-processing': Database,
  'gnn-classifier': Cpu,
  'graph-intelligence': GitBranch,
  'risk-engine': Shield,
  'ai-explanation': FileSearch,
};

function badgeVariantForState(state) {
  if (state === 'prototype') return 'cyan';
  if (state === 'mock_prediction') return 'violet';
  if (state === 'integration_pending') return 'warning';
  return 'neutral';
}

export default function SystemStatus({ services = [], loading = false }) {
  return (
    <Card
      title="System Architecture Status"
      subtitle="Transparent readiness status across prototype & pending backend modules"
      noPadding
    >
      {loading ? (
        <div className="space-y-3 p-5">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 animate-pulse rounded bg-[#F1F5F9]" />
          ))}
        </div>
      ) : (
        <div className="divide-y divide-[#F1F5F9]">
          {services.map((service) => {
            const Icon = SERVICE_ICONS[service.id] || Cpu;
            return (
              <div
                key={service.id}
                className="flex flex-col gap-1.5 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded border border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B]">
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-semibold text-[#0F172A]">
                        {service.name}
                      </span>
                      <span className="font-mono text-[11px] text-[#64748B]">
                        {service.updatedAt}
                      </span>
                    </div>
                    <p className="mt-0.5 text-[11px] leading-relaxed text-[#64748B]">
                      {service.detail}
                    </p>
                  </div>
                </div>
                <div className="pl-10 sm:pl-3 shrink-0">
                  <Badge variant={badgeVariantForState(service.state)}>
                    {service.status}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
