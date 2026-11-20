'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  AlertCircle,
  Calculator,
  CheckCircle2,
  RefreshCw,
  RotateCcw,
  Shield,
} from 'lucide-react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import OverviewCards from '@/components/dashboard/OverviewCards';
import TransactionChart from '@/components/dashboard/TransactionChart';
import RiskDistribution from '@/components/dashboard/RiskDistribution';
import RecentTransactions from '@/components/dashboard/RecentTransactions';
import FraudAlerts from '@/components/dashboard/FraudAlerts';
import SystemStatus from '@/components/dashboard/SystemStatus';
import TransactionFilters from '@/components/transactions/TransactionFilters';
import TransactionTable from '@/components/transactions/TransactionTable';
import TransactionDetails from '@/components/transactions/TransactionDetails';
import NetworkGraph from '@/components/graph/NetworkGraph';
import ModelMetrics from '@/components/performance/ModelMetrics';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import EmptyState from '@/components/ui/EmptyState';
import {
  getApiConfig,
  getDashboardStats,
  getFraudAlerts,
  getGraphData,
  getNotifications,
  getRiskDistribution,
  getSystemStatus,
  getTransactionActivity,
  getTransactions,
  simulateTransactionAction,
} from '@/lib/api';
import { MOCK_TRANSACTIONS } from '@/lib/mock-data';
import { NAVIGATION_ITEMS } from '@/lib/constants';
import { calculateDemoRiskScore } from '@/lib/risk-engine';
import { exportTransactionsToCsv, formatCurrency, formatShortTime } from '@/lib/utils';

const DEFAULT_FILTERS = {
  search: '',
  riskLevel: 'ALL',
  status: 'ALL',
  minAmount: '',
  maxAmount: '',
  dateRange: 'all',
  sortBy: 'timestamp',
  sortDir: 'desc',
  page: 1,
  pageSize: 10,
};

export default function DashboardLayout({
  initialView = 'overview',
  initialTransactionId = null,
}) {
  const validInitialView = NAVIGATION_ITEMS.some((n) => n.id === initialView)
    ? initialView
    : 'overview';

  const [activeView, setActiveView] = useState(validInitialView);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [monitoringActive, setMonitoringActive] = useState(true);

  // Core reactive transaction ledger (seeded from mock data via API boundary)
  const [transactions, setTransactions] = useState(() =>
    MOCK_TRANSACTIONS.map((tx) => ({ ...tx, actionHistory: [...(tx.actionHistory || [])] }))
  );

  // Async API view slices
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [stats, setStats] = useState(null);
  const [chartRange, setChartRange] = useState('24h');
  const [chartSeries, setChartSeries] = useState([]);
  const [chartLoading, setChartLoading] = useState(false);
  const [riskDist, setRiskDist] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [systemServices, setSystemServices] = useState([]);
  const [graphData, setGraphData] = useState(null);
  const [notifications, setNotifications] = useState([]);

  // Monitoring filters & paginated result
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [tableResult, setTableResult] = useState({
    items: [],
    allFiltered: [],
    totalCount: 0,
    page: 1,
    pageSize: 10,
    totalPages: 1,
  });

  // Investigation drawer & dedicated Investigations workspace state
  const [drawerTxId, setDrawerTxId] = useState(initialTransactionId);
  const [workspaceTxId, setWorkspaceTxId] = useState(
    initialTransactionId || MOCK_TRANSACTIONS[0]?.id || null
  );
  const [investigationQueueFilter, setInvestigationQueueFilter] = useState('priority');
  const [focusedAccountId, setFocusedAccountId] = useState(null);
  const [actionBusy, setActionBusy] = useState(false);
  const [sessionActionCount, setSessionActionCount] = useState(0);

  // Utility modals & toast
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [systemModalOpen, setSystemModalOpen] = useState(false);
  const [toast, setToast] = useState(null);

  // Demo Risk Calculator inside Settings Modal (exercises lib/risk-engine.js interactively)
  const [demoCalc, setDemoCalc] = useState({
    amount: 28000,
    velocityCount: 4,
    isNewReceiver: true,
    hasSuspiciousNeighbor: true,
    offHours: false,
  });

  const apiConfig = useMemo(() => getApiConfig(), []);
  const demoCalcResult = useMemo(() => calculateDemoRiskScore(demoCalc), [demoCalc]);

  const showToast = useCallback((message, tone = 'info') => {
    setToast({ id: Date.now(), message, tone });
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  // Manual refresh helper for retry & refresh buttons
  const loadDashboardData = useCallback(async (txSnapshot, activeRange) => {
    try {
      const [statsRes, activityRes, distRes, alertsRes, sysRes, graphRes, notifRes] =
        await Promise.all([
          getDashboardStats(txSnapshot),
          getTransactionActivity(activeRange),
          getRiskDistribution(txSnapshot),
          getFraudAlerts(txSnapshot),
          getSystemStatus(),
          getGraphData(null, txSnapshot),
          getNotifications(),
        ]);

      setErrorMsg(null);
      setStats(statsRes);
      setChartSeries(activityRes.series);
      setRiskDist(distRes);
      setAlerts(alertsRes);
      setSystemServices(sysRes.services);
      setGraphData(graphRes);
      setNotifications((prev) => (prev.length > 0 ? prev : notifRes));
    } catch (err) {
      setErrorMsg(err?.message || 'Unable to load FraudShield prototype telemetry.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Reactive API refresh when transaction ledger or chart range updates
  useEffect(() => {
    let cancelled = false;
    Promise.all([
      getDashboardStats(transactions),
      getTransactionActivity(chartRange),
      getRiskDistribution(transactions),
      getFraudAlerts(transactions),
      getSystemStatus(),
      getGraphData(null, transactions),
      getNotifications(),
    ])
      .then(([statsRes, activityRes, distRes, alertsRes, sysRes, graphRes, notifRes]) => {
        if (cancelled) return;
        setErrorMsg(null);
        setStats(statsRes);
        setChartSeries(activityRes.series);
        setRiskDist(distRes);
        setAlerts(alertsRes);
        setSystemServices(sysRes.services);
        setGraphData(graphRes);
        setNotifications((prev) => (prev.length > 0 ? prev : notifRes));
      })
      .catch((err) => {
        if (!cancelled) {
          setErrorMsg(err?.message || 'Unable to load FraudShield prototype telemetry.');
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [transactions, chartRange]);

  // Refresh filtered monitoring table whenever filters or transactions update
  useEffect(() => {
    let active = true;
    getTransactions(filters, transactions).then((res) => {
      if (active) setTableResult(res);
    });
    return () => {
      active = false;
    };
  }, [filters, transactions]);

  const handleChartRangeChange = async (nextRange) => {
    setChartRange(nextRange);
    setChartLoading(true);
    try {
      const res = await getTransactionActivity(nextRange);
      setChartSeries(res.series);
    } finally {
      setChartLoading(false);
    }
  };

  const handleSelectView = (viewId) => {
    setActiveView(viewId);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('view', viewId);
      window.history.replaceState({}, '', url.toString());
    }
  };

  const handleOpenTransaction = (txId) => {
    setWorkspaceTxId(txId);
    if (activeView === 'investigations') {
      setDrawerTxId(null);
    } else {
      setDrawerTxId(txId);
    }
  };

  const handleInspectInGraph = (accountId) => {
    setDrawerTxId(null);
    setFocusedAccountId(accountId);
    handleSelectView('graph');
  };

  const handleNavigateFilteredTransactions = (partialFilters) => {
    setFilters((prev) => ({
      ...DEFAULT_FILTERS,
      ...partialFilters,
      page: 1,
      pageSize: prev.pageSize,
    }));
    handleSelectView('transactions');
  };

  const handleSimulateAction = async (transactionId, actionId) => {
    setActionBusy(true);
    try {
      const result = await simulateTransactionAction(transactionId, actionId);
      setTransactions((prev) =>
        prev.map((tx) => {
          if (tx.id !== transactionId) return tx;
          return {
            ...tx,
            status: result.resultingStatus,
            actionHistory: [
              {
                id: `act-${Date.now()}`,
                action: `${result.actionLabel} (Simulated)`,
                actor: 'Elena Vance (Analyst)',
                timestamp: result.timestamp,
                simulated: true,
              },
              ...(tx.actionHistory || []),
            ],
          };
        })
      );
      setSessionActionCount((c) => c + 1);
      showToast(
        `${result.actionLabel} applied to ${transactionId} → ${result.resultingStatus} (simulated local state)`,
        actionId === 'hold' ? 'critical' : actionId === 'approve' ? 'success' : 'info'
      );
    } catch (err) {
      showToast(err?.message || 'Simulated action failed.', 'critical');
    } finally {
      setActionBusy(false);
    }
  };

  const handleResetPrototypeSession = () => {
    setTransactions(
      MOCK_TRANSACTIONS.map((tx) => ({ ...tx, actionHistory: [...(tx.actionHistory || [])] }))
    );
    setFilters(DEFAULT_FILTERS);
    setSessionActionCount(0);
    setSettingsOpen(false);
    showToast('Prototype ledger and local simulated actions restored to initial state.', 'info');
  };

  const currentNav = useMemo(
    () => NAVIGATION_ITEMS.find((item) => item.id === activeView) || NAVIGATION_ITEMS[0],
    [activeView]
  );

  const criticalCount = useMemo(
    () => transactions.filter((tx) => tx.riskLevel === 'CRITICAL' && tx.status !== 'Approved').length,
    [transactions]
  );

  const drawerTransaction = useMemo(
    () => transactions.find((tx) => tx.id === drawerTxId) || null,
    [transactions, drawerTxId]
  );

  const workspaceTransaction = useMemo(
    () => transactions.find((tx) => tx.id === workspaceTxId) || transactions[0] || null,
    [transactions, workspaceTxId]
  );

  const investigationQueue = useMemo(() => {
    return [...transactions]
      .filter((tx) => {
        if (investigationQueueFilter === 'priority') {
          return tx.riskLevel === 'CRITICAL' || tx.riskLevel === 'HIGH';
        }
        if (investigationQueueFilter === 'review') {
          return tx.status === 'Under Review' || tx.status === 'Flagged';
        }
        return true;
      })
      .sort((a, b) => b.riskScore - a.riskScore);
  }, [transactions, investigationQueueFilter]);

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] text-[#0F172A]">
      <Sidebar
        activeView={activeView}
        onSelectView={handleSelectView}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((c) => !c)}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
        criticalCount={criticalCount}
        onOpenSettings={() => setSettingsOpen(true)}
        onOpenProfile={() => setProfileOpen(true)}
        onOpenSystemStatus={() => setSystemModalOpen(true)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          currentNav={currentNav}
          transactions={transactions}
          notifications={notifications}
          monitoringActive={monitoringActive}
          onToggleMonitoring={() => {
            setMonitoringActive((prev) => {
              const next = !prev;
              showToast(
                next
                  ? 'Simulated real-time monitoring stream resumed.'
                  : 'Simulated real-time monitoring stream paused.',
                'info'
              );
              return next;
            });
          }}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onSelectTransaction={handleOpenTransaction}
          onSelectAccount={handleInspectInGraph}
          onMarkAllNotificationsRead={() =>
            setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
          }
          onMarkNotificationRead={(id) =>
            setNotifications((prev) =>
              prev.map((n) => (n.id === id ? { ...n, read: true } : n))
            )
          }
          onOpenProfile={() => setProfileOpen(true)}
        />

        {/* Main Workspace Canvas */}
        <main className="mx-auto w-full max-w-[1440px] flex-1 px-4 py-6 sm:px-6">
          {errorMsg ? (
            <EmptyState
              icon={AlertCircle}
              title="Telemetry Load Error"
              description={errorMsg}
              actionLabel="Retry Prototype Load"
              onAction={() => {
                setLoading(true);
                loadDashboardData(transactions, chartRange);
              }}
            />
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeView}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
              >
                {/* 1. OVERVIEW DASHBOARD */}
                {activeView === 'overview' && (
                  <div className="space-y-6">
                    <OverviewCards
                      stats={stats}
                      loading={loading}
                      onNavigateFilter={handleNavigateFilteredTransactions}
                    />

                    <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
                      <div className="xl:col-span-8">
                        <TransactionChart
                          data={chartSeries}
                          range={chartRange}
                          onRangeChange={handleChartRangeChange}
                          loading={loading || chartLoading}
                        />
                      </div>
                      <div className="xl:col-span-4">
                        <RiskDistribution
                          distribution={riskDist}
                          loading={loading}
                          onSelectRisk={(riskLevel) =>
                            handleNavigateFilteredTransactions({ riskLevel })
                          }
                        />
                      </div>
                    </div>

                    <RecentTransactions
                      transactions={transactions}
                      loading={loading}
                      onSelectTransaction={handleOpenTransaction}
                      onViewAll={() => handleSelectView('transactions')}
                    />

                    <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
                      <div className="xl:col-span-7">
                        <FraudAlerts
                          alerts={alerts}
                          loading={loading}
                          onInvestigate={handleOpenTransaction}
                        />
                      </div>
                      <div className="xl:col-span-5">
                        <SystemStatus services={systemServices} loading={loading} />
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. TRANSACTION MONITORING */}
                {activeView === 'transactions' && (
                  <div className="space-y-5">
                    <TransactionFilters
                      filters={filters}
                      onChange={(patch) => setFilters((prev) => ({ ...prev, ...patch }))}
                      onReset={() => setFilters(DEFAULT_FILTERS)}
                      onExportCsv={() => {
                        exportTransactionsToCsv(tableResult.allFiltered || []);
                        showToast(
                          `Exported ${tableResult.totalCount} prototype records to CSV.`,
                          'success'
                        );
                      }}
                      totalResults={tableResult.totalCount}
                    />

                    <TransactionTable
                      transactions={tableResult.items}
                      totalCount={tableResult.totalCount}
                      page={tableResult.page}
                      pageSize={tableResult.pageSize}
                      totalPages={tableResult.totalPages}
                      sortBy={filters.sortBy}
                      sortDir={filters.sortDir}
                      loading={loading}
                      onSort={(sortBy, sortDir) =>
                        setFilters((prev) => ({ ...prev, sortBy, sortDir, page: 1 }))
                      }
                      onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))}
                      onSelectTransaction={handleOpenTransaction}
                      onResetFilters={() => setFilters(DEFAULT_FILTERS)}
                    />
                  </div>
                )}

                {/* 3. GRAPH INTELLIGENCE */}
                {activeView === 'graph' && (
                  <NetworkGraph
                    graphData={graphData}
                    focusedAccountId={focusedAccountId}
                    onOpenTransaction={(txId) => {
                      setWorkspaceTxId(txId);
                      setDrawerTxId(txId);
                    }}
                  />
                )}

                {/* 4. INVESTIGATIONS WORKSPACE */}
                {activeView === 'investigations' && (
                  <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
                    {/* Case Queue */}
                    <div className="xl:col-span-4">
                      <Card
                        title="Investigation Queue"
                        subtitle="Select a flagged or reviewed transaction to inspect"
                        noPadding
                        action={
                          <span className="font-mono text-xs tabular-nums text-[#64748B]">
                            {investigationQueue.length} cases
                          </span>
                        }
                      >
                        <div className="border-b border-[#E2E8F0] px-4 py-3">
                          <div className="inline-flex w-full rounded-md border border-[#E2E8F0] bg-[#F1F5F9] p-0.5">
                            {[
                              { id: 'priority', label: 'Critical & High' },
                              { id: 'review', label: 'Action Needed' },
                              { id: 'all', label: 'All' },
                            ].map((tab) => (
                              <button
                                key={tab.id}
                                type="button"
                                onClick={() => setInvestigationQueueFilter(tab.id)}
                                className={`flex-1 rounded px-2 py-1.5 text-xs font-medium whitespace-nowrap cursor-pointer transition-colors ${
                                  investigationQueueFilter === tab.id
                                    ? 'bg-white text-[#0284C7] shadow-xs'
                                    : 'text-[#475569] hover:text-[#0F172A]'
                                }`}
                              >
                                {tab.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="max-h-[760px] divide-y divide-[#F1F5F9] overflow-y-auto">
                          {investigationQueue.map((tx) => {
                            const selected = workspaceTransaction?.id === tx.id;
                            return (
                              <button
                                key={tx.id}
                                type="button"
                                onClick={() => setWorkspaceTxId(tx.id)}
                                className={`flex w-full flex-col gap-1.5 px-4 py-3.5 text-left transition-colors cursor-pointer ${
                                  selected
                                    ? 'bg-[#F0F9FF] ring-1 ring-inset ring-[#BAE6FD]'
                                    : 'hover:bg-[#F8FAFC]'
                                }`}
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <span className="font-mono text-xs font-semibold text-[#0284C7]">
                                    {tx.id}
                                  </span>
                                  <div className="flex items-center gap-1.5">
                                    <Badge
                                      variant={
                                        tx.riskLevel === 'CRITICAL'
                                          ? 'critical'
                                          : tx.riskLevel === 'HIGH'
                                            ? 'high'
                                            : tx.riskLevel === 'MEDIUM'
                                              ? 'warning'
                                              : 'success'
                                      }
                                    >
                                      Score {tx.riskScore}
                                    </Badge>
                                  </div>
                                </div>

                                <div className="flex items-center justify-between gap-2 text-xs">
                                  <span className="font-mono text-[#475569] truncate">
                                    {tx.senderAccount} → {tx.receiverAccount}
                                  </span>
                                  <span className="font-mono font-semibold tabular-nums text-[#0F172A] shrink-0">
                                    {formatCurrency(tx.amount, { maximumFractionDigits: 0 })}
                                  </span>
                                </div>

                                <div className="flex items-center justify-between text-[11px] text-[#64748B]">
                                  <span>{tx.status}</span>
                                  <span className="font-mono tabular-nums">
                                    {formatShortTime(tx.timestamp)}
                                  </span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </Card>
                    </div>

                    {/* Full Investigation Panel */}
                    <div className="xl:col-span-8">
                      {workspaceTransaction ? (
                        <TransactionDetails
                          transaction={workspaceTransaction}
                          onSimulateAction={handleSimulateAction}
                          onInspectInGraph={handleInspectInGraph}
                          actionBusy={actionBusy}
                        />
                      ) : (
                        <EmptyState
                          title="Select a transaction to investigate"
                          description="Pick any transaction from the queue to inspect risk scores, model prediction slots, and evidence."
                        />
                      )}
                    </div>
                  </div>
                )}

                {/* 5. MODEL PERFORMANCE */}
                {activeView === 'performance' && <ModelMetrics />}
              </motion.div>
            </AnimatePresence>
          )}
        </main>
      </div>

      {/* Transaction Investigation Slide-Over Drawer (from Overview / Monitoring / Graph / Search) */}
      <Modal
        isOpen={Boolean(drawerTransaction)}
        onClose={() => setDrawerTxId(null)}
        variant="drawer"
        size="xl"
        title={
          drawerTransaction
            ? `Investigation — ${drawerTransaction.id}`
            : 'Transaction Investigation'
        }
        subtitle={
          drawerTransaction
            ? `${drawerTransaction.senderAccount} → ${drawerTransaction.receiverAccount} · ${formatCurrency(drawerTransaction.amount)}`
            : ''
        }
        headerExtra={
          drawerTransaction && (
            <Button
              variant="secondary"
              size="xs"
              onClick={() => {
                setWorkspaceTxId(drawerTransaction.id);
                setDrawerTxId(null);
                handleSelectView('investigations');
              }}
            >
              Open Full Workspace
            </Button>
          )
        }
      >
        {drawerTransaction && (
          <TransactionDetails
            transaction={drawerTransaction}
            onSimulateAction={handleSimulateAction}
            onInspectInGraph={handleInspectInGraph}
            actionBusy={actionBusy}
          />
        )}
      </Modal>

      {/* Settings & Integration Config Modal */}
      <Modal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        variant="center"
        size="lg"
        title="Prototype Settings & Backend Integration"
        subtitle="Inspect environment configuration and test demo scoring rules"
      >
        <div className="space-y-5">
          {/* API Integration Config */}
          <div className="rounded-md border border-[#E2E8F0] bg-[#F8FAFC] p-4 space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-medium text-[#0F172A]">Backend API Endpoint</span>
              <Badge variant="warning">Mock Adapter Active</Badge>
            </div>
            <div className="rounded border border-[#E2E8F0] bg-white px-3 py-2 font-mono text-[11px] text-[#0369A1]">
              NEXT_PUBLIC_API_URL={apiConfig.apiUrl}
            </div>
            <p className="text-[11px] leading-relaxed text-[#475569]">
              All dashboard views route through <code className="font-mono font-medium text-[#0F172A]">lib/api.js</code>. Connect a live GNN Edge Classifier backend service without modifying React components.
            </p>
          </div>

          {/* Interactive Demo Risk Engine Sandbox */}
          <div className="rounded-md border border-[#E2E8F0] bg-[#F8FAFC] p-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#0F172A]">
                <Calculator className="h-4 w-4 text-[#0284C7]" />
                Demo Risk Rule Sandbox
              </div>
              <Badge variant="neutral">Frontend Demo Only</Badge>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 text-xs">
              <label className="space-y-1">
                <span className="text-[11px] text-[#64748B]">Transfer Amount (USD)</span>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={demoCalc.amount}
                  onChange={(e) =>
                    setDemoCalc((prev) => ({ ...prev, amount: Number(e.target.value) || 0 }))
                  }
                  className="h-9 w-full rounded border border-[#CBD5E1] bg-white px-3 font-mono text-xs text-[#0F172A] focus:border-[#0284C7] focus:outline-none"
                />
              </label>

              <label className="space-y-1">
                <span className="text-[11px] text-[#64748B]">2h Transfer Velocity</span>
                <input
                  type="number"
                  min="1"
                  max="25"
                  value={demoCalc.velocityCount}
                  onChange={(e) =>
                    setDemoCalc((prev) => ({
                      ...prev,
                      velocityCount: Number(e.target.value) || 1,
                    }))
                  }
                  className="h-9 w-full rounded border border-[#CBD5E1] bg-white px-3 font-mono text-xs text-[#0F172A] focus:border-[#0284C7] focus:outline-none"
                />
              </label>
            </div>

            <div className="flex flex-wrap gap-4 pt-1 text-xs text-[#334155]">
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={demoCalc.isNewReceiver}
                  onChange={(e) =>
                    setDemoCalc((prev) => ({ ...prev, isNewReceiver: e.target.checked }))
                  }
                  className="accent-[#0284C7]"
                />
                New receiver
              </label>
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={demoCalc.hasSuspiciousNeighbor}
                  onChange={(e) =>
                    setDemoCalc((prev) => ({
                      ...prev,
                      hasSuspiciousNeighbor: e.target.checked,
                    }))
                  }
                  className="accent-[#0284C7]"
                />
                Suspicious graph neighbor
              </label>
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={demoCalc.offHours}
                  onChange={(e) =>
                    setDemoCalc((prev) => ({ ...prev, offHours: e.target.checked }))
                  }
                  className="accent-[#0284C7]"
                />
                Off-hours timing
              </label>
            </div>

            <div className="flex items-center justify-between border-t border-[#E2E8F0] pt-3">
              <span className="text-xs text-[#64748B]">Computed Demo Output</span>
              <div className="flex items-center gap-2.5 font-mono">
                <span className="text-sm font-semibold tabular-nums text-[#0F172A]">
                  Score {demoCalcResult.riskScore} / 100
                </span>
                <Badge
                  variant={
                    demoCalcResult.riskLevel === 'CRITICAL'
                      ? 'critical'
                      : demoCalcResult.riskLevel === 'HIGH'
                        ? 'high'
                        : demoCalcResult.riskLevel === 'MEDIUM'
                          ? 'warning'
                          : 'success'
                  }
                >
                  {demoCalcResult.riskLevel}
                </Badge>
              </div>
            </div>
          </div>

          {/* Reset Session */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#E2E8F0] pt-4">
            <div className="text-xs text-[#64748B]">
              {sessionActionCount} simulated analyst {sessionActionCount === 1 ? 'action' : 'actions'} applied this session.
            </div>
            <Button variant="danger" size="sm" onClick={handleResetPrototypeSession}>
              <RotateCcw className="h-3.5 w-3.5" />
              Reset Simulated State
            </Button>
          </div>
        </div>
      </Modal>

      {/* Analyst Profile Modal */}
      <Modal
        isOpen={profileOpen}
        onClose={() => setProfileOpen(false)}
        variant="center"
        size="md"
        title="Analyst Session Profile"
        subtitle="FraudShield SOC Hackathon Prototype"
      >
        <div className="space-y-4 text-xs">
          <div className="flex items-center gap-3.5 rounded-md border border-[#E2E8F0] bg-[#F8FAFC] p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-md border border-[#BAE6FD] bg-[#F0F9FF] font-mono text-base font-bold text-[#0284C7]">
              EV
            </div>
            <div>
              <div className="text-sm font-semibold text-[#0F172A]">Elena Vance</div>
              <div className="text-xs text-[#64748B]">Lead Financial Crime Analyst · Tier-2 SOC</div>
              <div className="mt-1 font-mono text-[11px] font-medium text-[#0284C7]">
                Session Actions Logged: {sessionActionCount}
              </div>
            </div>
          </div>

          <div className="rounded-md border border-[#E2E8F0] bg-[#F8FAFC] p-4 space-y-2 text-[#475569]">
            <div className="flex items-center gap-2 font-medium text-[#0F172A]">
              <Shield className="h-4 w-4 text-[#0284C7]" />
              Prototype Scope Notice
            </div>
            <p className="leading-relaxed">
              This workspace demonstrates FraudShield’s graph intelligence, risk triage, and GNN integration contract for the CloudCamp AI Builders Congress hackathon. Actions execute in local browser memory only.
            </p>
          </div>

          <div className="flex justify-end">
            <Button variant="secondary" size="sm" onClick={() => setProfileOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>

      {/* Quick System Status Modal (Accessible from Sidebar from any page) */}
      <Modal
        isOpen={systemModalOpen}
        onClose={() => setSystemModalOpen(false)}
        variant="center"
        size="lg"
        title="FraudShield Architecture Readiness"
        subtitle="Honest component maturity across frontend prototype & pending ML modules"
      >
        <div className="space-y-4">
          <SystemStatus services={systemServices} loading={loading} />
          <div className="flex items-center justify-between gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setSystemModalOpen(false);
                handleSelectView('performance');
              }}
            >
              Open Model Performance
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                loadDashboardData(transactions, chartRange);
                showToast('Refreshed prototype status checks.', 'info');
              }}
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh Status
            </Button>
          </div>
        </div>
      </Modal>

      {/* Simulated Action Toast Feedback */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 right-5 z-50 flex max-w-md items-center gap-2.5 rounded-md border border-[#CBD5E1] bg-white px-4 py-3 text-xs text-[#0F172A] shadow-xl"
        >
          <CheckCircle2
            className={`h-4 w-4 shrink-0 ${
              toast.tone === 'critical'
                ? 'text-[#DC2626]'
                : toast.tone === 'success'
                  ? 'text-[#16A34A]'
                  : 'text-[#0284C7]'
            }`}
          />
          <span className="leading-relaxed">{toast.message}</span>
        </div>
      )}
    </div>
  );
}
