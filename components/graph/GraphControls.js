'use client';

import { useState } from 'react';
import { Maximize2, RotateCcw, Search, ZoomIn, ZoomOut } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function GraphControls({
  accounts = [],
  clusterFilter = 'all',
  onClusterFilterChange,
  onSelectAccount,
  onZoomIn,
  onZoomOut,
  onFitView,
  onResetLayout,
}) {
  const [query, setQuery] = useState('');
  const [openSuggestions, setOpenSuggestions] = useState(false);

  const normalized = query.trim().toLowerCase();
  const suggestions = normalized
    ? accounts
        .filter(
          (acc) =>
            acc.accountId.toLowerCase().includes(normalized) ||
            acc.label.toLowerCase().includes(normalized)
        )
        .slice(0, 6)
    : [];

  const handleChoose = (accountId) => {
    setQuery(accountId);
    setOpenSuggestions(false);
    onSelectAccount?.(accountId);
  };

  const clusterButtons = [
    { id: 'all', label: 'All Accounts' },
    { id: 'cluster-alpha', label: 'Mule Cluster Alpha' },
    { id: 'cluster-beta', label: 'Structuring Beta' },
    { id: 'high-risk', label: 'High-Risk Only' },
  ];

  return (
    <div className="space-y-3 rounded-lg border border-[#E2E8F0] bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Search account */}
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#64748B]" />
          <input
            type="text"
            value={query}
            onFocus={() => setOpenSuggestions(true)}
            onBlur={() => setTimeout(() => setOpenSuggestions(false), 150)}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpenSuggestions(true);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && suggestions.length > 0) {
                e.preventDefault();
                handleChoose(suggestions[0].accountId);
              }
            }}
            placeholder="Search account ID (e.g. ACC-9041)..."
            aria-label="Search account in network graph"
            className="h-9 w-full rounded-md border border-[#CBD5E1] bg-white pl-8 pr-3 font-mono text-xs text-[#0F172A] placeholder:text-[#94A3B8] focus:border-[#0284C7] focus:outline-none"
          />

          {openSuggestions && suggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-10 z-30 overflow-hidden rounded-md border border-[#CBD5E1] bg-white shadow-xl">
              {suggestions.map((acc) => (
                <button
                  key={acc.accountId}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleChoose(acc.accountId);
                  }}
                  className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-xs hover:bg-[#F8FAFC] cursor-pointer"
                >
                  <div className="min-w-0">
                    <div className="font-mono font-semibold text-[#0284C7]">{acc.accountId}</div>
                    <div className="truncate text-[11px] text-[#64748B]">{acc.label}</div>
                  </div>
                  <span className="font-mono text-[11px] tabular-nums text-[#0F172A] shrink-0">
                    Risk {acc.riskScore}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Cluster Filter Tabs */}
        <div
          className="inline-flex flex-wrap items-center rounded-md border border-[#E2E8F0] bg-[#F1F5F9] p-0.5"
          role="group"
          aria-label="Filter network graph nodes"
        >
          {clusterButtons.map((btn) => {
            const active = clusterFilter === btn.id;
            return (
              <button
                key={btn.id}
                type="button"
                onClick={() => onClusterFilterChange?.(btn.id)}
                className={`rounded px-2.5 py-1.5 text-xs font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  active
                    ? 'bg-white text-[#0284C7] shadow-xs'
                    : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                {btn.label}
              </button>
            );
          })}
        </div>

        {/* Canvas Controls */}
        <div className="flex items-center gap-1.5">
          <Button variant="secondary" size="xs" onClick={onZoomIn} aria-label="Zoom in">
            <ZoomIn className="h-3.5 w-3.5" />
          </Button>
          <Button variant="secondary" size="xs" onClick={onZoomOut} aria-label="Zoom out">
            <ZoomOut className="h-3.5 w-3.5" />
          </Button>
          <Button variant="secondary" size="xs" onClick={onFitView}>
            <Maximize2 className="h-3.5 w-3.5" />
            Fit View
          </Button>
          <Button variant="ghost" size="xs" onClick={onResetLayout}>
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </Button>
        </div>
      </div>

      {/* Graph Legend */}
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t border-[#F1F5F9] pt-3 text-[11px] text-[#64748B]">
        <div className="flex flex-wrap items-center gap-4">
          <span className="font-medium text-[#0F172A]">Accounts:</span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-[2px] border border-[#16A34A] bg-[#F0FDF4]" />
            Normal
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-[2px] border border-[#D97706] bg-[#FFFBEB]" />
            Suspicious
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-[2px] border border-[#DC2626] bg-[#FEF2F2]" />
            High-Risk
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <span className="font-medium text-[#0F172A]">Transfers:</span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-0.5 w-4 bg-[#94A3B8]" />
            Normal
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-0.5 w-4 bg-[#D97706]" />
            Suspicious
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-0.5 w-4 bg-[#DC2626]" />
            High-Risk Path
          </span>
        </div>
      </div>
    </div>
  );
}
