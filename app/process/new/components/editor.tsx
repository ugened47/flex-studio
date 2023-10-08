'use client';

import React, {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import Case from 'case';
import cx from 'classnames';
import ELK from 'elkjs/lib/elk.bundled.js';
import ReactFlow, {
  Background,
  Connection,
  ConnectionMode,
  Controls,
  Edge,
  EdgeProps,
  MarkerType,
  MiniMap,
  Node,
  NodeToolbar,
  Panel,
  Position,
  ReactFlowInstance,
  ReactFlowProvider,
  addEdge,
  useEdgesState,
  useNodesState,
  useReactFlow,
  useUpdateNodeInternals,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { inter } from '@/app/fonts';
import {
  AutomaticArrow,
  AutomaticArrowHead,
  AutomaticArrowTail,
  CustomerArrow,
  OperatorArrow,
  PrivilegedStateIcon,
  ProviderArrow,
} from '@/components/shared/icons/transition-arrow';

import customNode from './custom-node';
import FloatingConnectionLine from './floating-connection-line';
import FloatingEdge from './floating-edge';
import { getRandomColor } from './utils';

const nodeTypes = {
  custom: customNode,
};

const edgeTypes = {
  floating: FloatingEdge,
};

const initialNodes: Node[] = [
  {
    id: 'initial',
    type: 'custom',
    position: { x: 0, y: 0 },
    data: { label: 'initial' },
  },
];
const initialEdges: Edge<any>[] = [];

const flowKey = 'flow';

const getNodeId = () => `node_${+new Date()}`;

let id = 0;
const getId = () => `dndnode_${id++}`;

enum SelectedEdgeType {
  Customer = 'customer',
  Provider = 'provider',
  Operator = 'operator',
  Automatic = 'automatic',
}

enum EdgeColor {
  customer = '#F5A623',
  provider = '#BD10E0',
  operator = '#417505',
  automatic = '#888888',
}

const proOptions = { hideAttribution: true };

const elk = new ELK();

// Elk has a *huge* amount of options to configure. To see everything you can
// tweak check out:
//
// - https://www.eclipse.org/elk/reference/algorithms.html
// - https://www.eclipse.org/elk/reference/options.html
const elkOptions = {
  'elk.algorithm': 'layered',
  'elk.layered.spacing.nodeNodeBetweenLayers': '100',
  'elk.spacing.nodeNode': '80',
};

const getLayoutedElements = async (
  nodes: Node[],
  edges: Edge[],
  options: any = {},
) => {
  const isHorizontal = options?.['elk.direction'] === 'RIGHT';
  const graph = {
    id: 'root',
    layoutOptions: options,
    children: nodes.map((node) => ({
      ...node,
      // Adjust the target and source handle positions based on the layout
      // direction.
      targetPosition: isHorizontal ? 'left' : 'top',
      sourcePosition: isHorizontal ? 'right' : 'bottom',

      // Hardcode a width and height for elk to use when layouting.
      width: 150,
      height: 50,
    })),
    edges: edges,
  };

  try {
    const layoutedGraph = await elk.layout(graph as any);
    return {
      nodes: layoutedGraph?.children?.map((node_1) => ({
        ...node_1,
        // React Flow expects a position property on the node instead of `x`
        // and `y` fields.
        position: { x: node_1.x, y: node_1.y },
      })),

      edges: layoutedGraph.edges,
    };
  } catch (message) {
    return console.error(message);
  }
};

function GraphEditorComponent() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance<any, any>>(
    null as any,
  );
  const { setViewport, fitView } = useReactFlow();

  const [newStateName, setNewStateName] = useState<string>('');

  const [selectedEdgeType, setSelectedEdgeType] = useState<SelectedEdgeType>(
    SelectedEdgeType.Customer,
  );

  const [newEdgeName, setNewEdgeName] = useState<string>('');

  const reactFlowWrapper = useRef<any>(null);

  const onLayout = useCallback(
    ({ direction, useInitialNodes = false }: any) => {
      const opts = { 'elk.direction': direction, ...elkOptions };
      const ns = useInitialNodes ? initialNodes : nodes;
      const es = useInitialNodes ? initialEdges : edges;

      getLayoutedElements(ns, es, opts).then(
        ({ nodes: layoutedNodes, edges: layoutedEdges }: any) => {
          setNodes(layoutedNodes);
          setEdges(layoutedEdges);

          window.requestAnimationFrame(() => fitView());
        },
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [nodes, edges],
  );

  // Calculate the initial layout on mount.
  useLayoutEffect(() => {
    onLayout({ direction: 'DOWN', useInitialNodes: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onConnect = useCallback(
    (params: Connection) => {
      const edgeName = Case.kebab(newEdgeName);

      if (!edgeName) return;

      setEdges((eds) => {
        console.log('params', params);

        return addEdge(
          {
            ...params,
            id: edgeName,
            type: 'default',
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: EdgeColor[selectedEdgeType],
            },
            label: edgeName,
            style: {
              strokeWidth: 2,
              stroke: EdgeColor[selectedEdgeType],
            },
          },
          eds,
        );
      });

      setNewEdgeName('');
    },
    [setEdges, setNodes, selectedEdgeType, newEdgeName, setNewEdgeName],
  );

  const onSave = useCallback(() => {
    if (rfInstance) {
      const flow = rfInstance.toObject();
      localStorage.setItem(flowKey, JSON.stringify(flow));
    }
  }, [rfInstance]);

  const onRestore = useCallback(() => {
    const restoreFlow = async () => {
      const flow = JSON.parse(localStorage.getItem(flowKey) as string);

      if (flow) {
        const { x = 0, y = 0, zoom = 1 } = flow.viewport;
        setNodes(flow.nodes || []);
        setEdges(flow.edges || []);
        setViewport({ x, y, zoom });
      }
    };

    restoreFlow();
  }, [setEdges, setNodes, setViewport]);

  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();

      const reactFlowBounds =
        reactFlowWrapper?.current?.getBoundingClientRect?.();
      const stateName = event.dataTransfer.getData('application/reactflow');

      // check if the dropped element is valid
      if (typeof stateName === 'undefined' || !stateName) {
        return;
      }

      const position = rfInstance?.project?.({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      const formattedStateName = Case.kebab(stateName);

      const newNode = {
        id: formattedStateName,
        data: { label: formattedStateName },
        type: 'custom',
        position,
      };

      setNodes((nds) => nds.concat(newNode));

      setNewStateName('');
    },
    [rfInstance, setNodes],
  );

  return (
    <div className="h-full w-full" ref={reactFlowWrapper}>
      <ReactFlow
        className="bg-teal-50"
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={setRfInstance}
        fitView
        attributionPosition="top-right"
        connectionMode={ConnectionMode.Loose}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        // connectionLineComponent={FloatingConnectionLine}
        proOptions={proOptions}
        onDrop={onDrop}
        onDragOver={onDragOver}
      >
        <Panel position="top-right">
          <div className="max-w-xs">
            <GraphgActions
              onLayout={onLayout}
              onSave={onSave}
              onRestore={onRestore}
            />

            <SelectPanel
              onSelect={setSelectedEdgeType}
              selectedEdge={selectedEdgeType}
              onEdgeNameChange={setNewEdgeName}
              newEdgeName={newEdgeName}
            />

            <Sidebar
              stateName={newStateName}
              onStateNameChange={setNewStateName}
            />
          </div>
        </Panel>
        <Controls />
        <MiniMap />
        <NodeToolbar />
        {/* @ts-ignore */}
        <Background variant="dots" gap={12} size={1} />
      </ReactFlow>
    </div>
  );
}

const GraphEditor = () => (
  <ReactFlowProvider>
    <GraphEditorComponent />
  </ReactFlowProvider>
);

export default GraphEditor;

interface SelectPanelProps {
  onSelect: (edgeType: SelectedEdgeType) => void;
  togglePrivileged?: (edgeType: string) => void;
  selectedEdge?: SelectedEdgeType;
  newEdgeName: string;
  onEdgeNameChange: (edgeName: string) => void;
}

const SelectPanel = ({
  onSelect,
  selectedEdge,
  onEdgeNameChange,
  newEdgeName,
}: SelectPanelProps) => {
  const handleSelect = (edgeType: SelectedEdgeType) => {
    onSelect(edgeType);
  };

  const edgeTypes = useMemo(
    () => [
      {
        type: SelectedEdgeType.Customer,
        label: 'Customer',
        icon: <CustomerArrow />,
      },
      {
        type: SelectedEdgeType.Provider,
        label: 'Provider',
        icon: <ProviderArrow />,
      },
      {
        type: SelectedEdgeType.Operator,
        label: 'Marketplace Operator',
        icon: <OperatorArrow />,
      },
      {
        type: SelectedEdgeType.Automatic,
        label: 'Automatic',
        icon: <AutomaticArrow />,
      },
    ],
    [],
  );

  return (
    <div className="flex flex-col rounded-xl border border-gray-200 bg-white shadow-md p-2">
      <input
        className="flex flex-row items-center gap-2 cursor-pointer mb-2 rounded-xl border-gray-200 bg-gray-50 shadow-md p-1"
        placeholder="Transition name"
        value={newEdgeName}
        onChange={(event) => onEdgeNameChange(event.target.value)}
      />

      {edgeTypes.map(({ type, label, icon }) => (
        <div
          key={type}
          className={cx(
            'flex flex-row items-center gap-2 cursor-pointer mb-2',
            {
              'rounded-xl border-gray-200 bg-gray-50 shadow-md p-1':
                selectedEdge === type,
            },
          )}
          onClick={() => handleSelect(type)}
        >
          {icon}
          <span className="underline text-[#4A4A4A] text-sm leading-6 relative top-[-2px]">
            {label}
          </span>
        </div>
      ))}

      <div className="flex flex-row items-center gap-2">
        <PrivilegedStateIcon />
        <span className="text-[#4A4A4A] text-sm leading-6">
          Privileged transition
        </span>
      </div>
    </div>
  );
};

interface SidebarProps {
  stateName: string;
  onStateNameChange: (stateName: string) => void;
}

const Sidebar = ({ stateName, onStateNameChange }: SidebarProps) => {
  const onDragStart = (event: React.DragEvent<HTMLDivElement>) => {
    if (!stateName) return;

    event.dataTransfer.setData('application/reactflow', stateName);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="flex flex-col rounded-xl border border-gray-200 bg-white shadow-md p-2">
      <div className="description">
        You can drag these nodes to the pane on the right.
      </div>
      <div
        className="mb-2 mr-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-gradient-to-bl focus:outline-none focus:ring-4 focus:ring-cyan-300 dark:focus:ring-cyan-800"
        onDragStart={onDragStart}
        draggable
      >
        <input
          className="w-full text-sm font-medium text-white bg-transparent border-0 border-b-[1px] border-white placeholder-white focus:ring-0 focus:border-white focus:border-b-2 hover:border-b-2 placeholder:italic"
          placeholder="State name"
          value={stateName}
          onChange={(event) => onStateNameChange(event.target.value)}
        />
      </div>
    </div>
  );
};

interface GraphgActionsProps {
  onLayout: ({ direction, useInitialNodes }: any) => void;
  onSave: () => void;
  onRestore: () => void;
}

const GraphgActions = ({ onLayout, onSave, onRestore }: GraphgActionsProps) => {
  return (
    <div className="flex flex-col rounded-xl border border-gray-200 bg-white shadow-md p-2">
      <button
        onClick={() => onLayout({ direction: 'DOWN' })}
        className="mb-2 mr-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-gradient-to-bl focus:outline-none focus:ring-4 focus:ring-cyan-300 dark:focus:ring-cyan-800"
      >
        vertical layout
      </button>

      <button
        onClick={onSave}
        className="mb-2 mr-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-gradient-to-bl focus:outline-none focus:ring-4 focus:ring-cyan-300 dark:focus:ring-cyan-800"
      >
        save
      </button>
      <button
        onClick={onRestore}
        className="group relative mb-2 mr-2 inline-flex items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-pink-500 to-orange-400 p-0.5 text-sm font-medium text-gray-900 hover:text-white focus:outline-none focus:ring-4 focus:ring-pink-200 group-hover:from-pink-500 group-hover:to-orange-400 dark:text-white dark:focus:ring-pink-800"
      >
        <span className="relative rounded-md px-5 py-2.5 text-gray-900 transition-all duration-75 ease-in group-hover:bg-opacity-0 group-hover:text-white">
          restore
        </span>
      </button>
    </div>
  );
};
