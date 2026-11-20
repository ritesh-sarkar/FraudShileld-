'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Background,
  Handle,
  MarkerType,
  MiniMap,
  Position,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import Badge from '@/components/ui/Badge';
import GraphControls from './GraphControls';
import NodeDetails from './NodeDetails';
import { formatCurrency } from '@/lib/utils';

function AccountNode({ data, selected }) {
  const tierStyles = {
    'high-risk': {
      border: 'border-[#DC2626]/70',
      badgeBg: 'bg-[#FEF2F2] text-[#B91C1C] border border-[#FECACA]',
      indicator: 'bg-[#DC2626]',
    },
    suspicious: {
      border: 'border-[#D97706]/70',
      badgeBg: 'bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A]',
      indicator: 'bg-[#D97706]',
    },
    normal: {
      border: 'border-[#CBD5E1]',
      badgeBg: 'bg-[#F0FDF4] text-[#15803D] border border-[#BBF7D0]',
      indicator: 'bg-[#16A34A]',
    },
  };

  const style = tierStyles[data.riskTier] || tierStyles.normal;
  const ringClass =
    selected || data.isFocused
      ? 'ring-2 ring-[#0284C7] border-[#0284C7]'
      : style.border;

  return (
    <div
      className={`min-w-[178px] rounded-md border bg-white px-3 py-2.5 text-[#0F172A] shadow-sm transition-colors ${ringClass}`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!h-2 !w-2 !border-white !bg-[#94A3B8]"
      />

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span className={`h-2 w-2 rounded-[2px] ${style.indicator}`} />
          <span className="font-mono text-xs font-semibold text-[#0F172A]">
            {data.accountId}
          </span>
        </div>
        <span
          className={`rounded px-1.5 py-0.5 font-mono text-[10px] font-semibold tabular-nums ${style.badgeBg}`}
        >
          {data.riskScore}
        </span>
      </div>

      <div className="mt-1 truncate text-[11px] font-medium text-[#334155] max-w-[162px]">
        {data.label}
      </div>
      <div className="mt-0.5 truncate text-[10px] text-[#64748B] max-w-[162px]">
        {data.accountType}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!h-2 !w-2 !border-white !bg-[#94A3B8]"
      />
    </div>
  );
}

const NODE_TYPES = {
  accountNode: AccountNode,
};

function NetworkGraphInner({
  graphData,
  focusedAccountId,
  onOpenTransaction,
}) {
  const { zoomIn, zoomOut, fitView, setCenter } = useReactFlow();
  const [clusterFilter, setClusterFilter] = useState('all');
  const [selectedNodeId, setSelectedNodeId] = useState(focusedAccountId || null);
  const [selectedEdgeId, setSelectedEdgeId] = useState(null);

  const styledGraph = useMemo(() => {
    const rawNodes = graphData?.nodes || [];
    const rawEdges = graphData?.edges || [];

    const visibleNodeIds = new Set(
      rawNodes
        .filter((node) => {
          if (clusterFilter === 'all') return true;
          if (clusterFilter === 'high-risk') return node.data.riskTier === 'high-risk';
          return node.data.clusterId === clusterFilter;
        })
        .map((n) => n.id)
    );

    const nodes = rawNodes
      .filter((n) => visibleNodeIds.has(n.id))
      .map((node) => ({
        ...node,
        selected: node.id === selectedNodeId,
        data: {
          ...node.data,
          isFocused: node.id === selectedNodeId,
        },
      }));

    const edges = rawEdges
      .filter((e) => visibleNodeIds.has(e.source) && visibleNodeIds.has(e.target))
      .map((edge) => {
        const tier = edge.data.edgeTier;
        const isSelected = edge.id === selectedEdgeId;
        const stroke = isSelected
          ? '#0284C7'
          : tier === 'high-risk'
            ? '#DC2626'
            : tier === 'suspicious'
              ? '#D97706'
              : '#94A3B8';

        return {
          ...edge,
          type: 'smoothstep',
          animated: tier === 'high-risk',
          label: formatCurrency(edge.data.amount, { compact: true }),
          labelStyle: {
            fill: isSelected ? '#0284C7' : '#334155',
            fontSize: 10,
            fontFamily: 'var(--font-jetbrains-mono)',
            fontWeight: 600,
          },
          labelBgStyle: {
            fill: '#FFFFFF',
            fillOpacity: 0.96,
            stroke: isSelected ? '#0284C7' : '#CBD5E1',
            strokeWidth: 1,
          },
          labelBgPadding: [4, 2],
          labelBgBorderRadius: 3,
          style: {
            stroke,
            strokeWidth: isSelected ? 2.6 : tier === 'high-risk' ? 2.1 : 1.5,
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 16,
            height: 16,
            color: stroke,
          },
        };
      });

    return { nodes, edges };
  }, [graphData, clusterFilter, selectedNodeId, selectedEdgeId]);

  const [nodes, setNodes, onNodesChange] = useNodesState(styledGraph.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(styledGraph.edges);

  useEffect(() => {
    setNodes(styledGraph.nodes);
    setEdges(styledGraph.edges);
  }, [styledGraph, setNodes, setEdges]);

  const [prevFocusedAccountId, setPrevFocusedAccountId] = useState(focusedAccountId);
  if (focusedAccountId !== prevFocusedAccountId) {
    setPrevFocusedAccountId(focusedAccountId);
    if (focusedAccountId) {
      setClusterFilter('all');
      setSelectedEdgeId(null);
      setSelectedNodeId(focusedAccountId);
    }
  }

  const focusNodeById = useCallback(
    (accountId) => {
      if (!accountId) return;
      setSelectedEdgeId(null);
      setSelectedNodeId(accountId);
      const target = (graphData?.nodes || []).find((n) => n.id === accountId);
      if (target) {
        setTimeout(() => {
          setCenter(target.position.x + 90, target.position.y + 40, {
            zoom: 1.05,
            duration: 300,
          });
        }, 50);
      }
    },
    [graphData, setCenter]
  );

  useEffect(() => {
    if (!focusedAccountId) return undefined;
    const target = (graphData?.nodes || []).find((n) => n.id === focusedAccountId);
    if (!target) return undefined;
    const timer = setTimeout(() => {
      setCenter(target.position.x + 90, target.position.y + 40, {
        zoom: 1.05,
        duration: 300,
      });
    }, 60);
    return () => clearTimeout(timer);
  }, [focusedAccountId, graphData, setCenter]);

  const handleResetLayout = () => {
    setClusterFilter('all');
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
    setNodes(styledGraph.nodes);
    setTimeout(() => fitView({ padding: 0.16, duration: 250 }), 60);
  };

  const handleClusterFocus = (clusterId, focusAcc) => {
    setClusterFilter(clusterId);
    setSelectedEdgeId(null);
    setSelectedNodeId(focusAcc || null);
    setTimeout(() => fitView({ padding: 0.2, duration: 280 }), 80);
  };

  const selectedNode = useMemo(
    () => (graphData?.nodes || []).find((n) => n.id === selectedNodeId) || null,
    [graphData, selectedNodeId]
  );

  const selectedEdge = useMemo(
    () => (graphData?.edges || []).find((e) => e.id === selectedEdgeId) || null,
    [graphData, selectedEdgeId]
  );

  const accountList = useMemo(
    () => (graphData?.nodes || []).map((n) => n.data),
    [graphData]
  );

  return (
    <div className="space-y-4">
      {/* Explicit Prototype Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#E2E8F0] bg-white px-5 py-3.5">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h2 className="font-display text-sm font-semibold text-[#0F172A]">
              Graph Visualization — Prototype Data
            </h2>
            <Badge variant="violet">Topology Layer · Not Live GNN Inference</Badge>
          </div>
          <p className="mt-1 text-xs text-[#64748B]">
            Account-to-account transfer network highlighting suspected Cluster Alpha mule layering and Cluster Beta structuring paths.
          </p>
        </div>
        <div className="font-mono text-xs tabular-nums text-[#64748B]">
          {nodes.length} accounts · {edges.length} directed transfers
        </div>
      </div>

      {/* Controls Bar */}
      <GraphControls
        accounts={accountList}
        clusterFilter={clusterFilter}
        onClusterFilterChange={(next) => {
          setClusterFilter(next);
          setTimeout(() => fitView({ padding: 0.18, duration: 240 }), 60);
        }}
        onSelectAccount={(accountId) => {
          setClusterFilter('all');
          focusNodeById(accountId);
        }}
        onZoomIn={() => zoomIn({ duration: 200 })}
        onZoomOut={() => zoomOut({ duration: 200 })}
        onFitView={() => fitView({ padding: 0.16, duration: 240 })}
        onResetLayout={handleResetLayout}
      />

      {/* Main Split Canvas + Inspection Panel */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <div className="h-[520px] overflow-hidden rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] sm:h-[580px] xl:col-span-8">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={NODE_TYPES}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={(_, node) => {
              setSelectedEdgeId(null);
              setSelectedNodeId(node.id);
            }}
            onEdgeClick={(_, edge) => {
              setSelectedNodeId(null);
              setSelectedEdgeId(edge.id);
            }}
            onPaneClick={() => {
              setSelectedNodeId(null);
              setSelectedEdgeId(null);
            }}
            fitView
            fitViewOptions={{ padding: 0.16 }}
            minZoom={0.35}
            maxZoom={1.9}
            proOptions={{ hideAttribution: true }}
          >
            <Background color="#CBD5E1" gap={22} size={1.2} />
            <MiniMap
              nodeColor={(n) => {
                if (n.data?.riskTier === 'high-risk') return '#DC2626';
                if (n.data?.riskTier === 'suspicious') return '#D97706';
                return '#16A34A';
              }}
              maskColor="rgba(241, 245, 249, 0.72)"
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #CBD5E1',
                borderRadius: 6,
              }}
            />
          </ReactFlow>
        </div>

        <div className="xl:col-span-4">
          <NodeDetails
            selectedNode={selectedNode}
            selectedEdge={selectedEdge}
            clusters={graphData?.clusters || []}
            allEdges={graphData?.edges || []}
            onSelectAccount={(accountId) => {
              setClusterFilter('all');
              focusNodeById(accountId);
            }}
            onClearSelection={() => {
              setSelectedNodeId(null);
              setSelectedEdgeId(null);
            }}
            onOpenTransaction={onOpenTransaction}
            onFocusCluster={handleClusterFocus}
          />
        </div>
      </div>
    </div>
  );
}

export default function NetworkGraph({ graphData, focusedAccountId, onOpenTransaction }) {
  return (
    <ReactFlowProvider>
      <NetworkGraphInner
        graphData={graphData}
        focusedAccountId={focusedAccountId}
        onOpenTransaction={onOpenTransaction}
      />
    </ReactFlowProvider>
  );
}
