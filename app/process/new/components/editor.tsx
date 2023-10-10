'use client';

import React, { useCallback, useLayoutEffect, useRef, useState } from 'react';

import Case from 'case';
import ELK from 'elkjs/lib/elk.bundled.js';
import ReactFlow, {
  Background,
  Connection,
  ConnectionMode,
  Controls,
  Edge,
  MarkerType,
  Node,
  NodeToolbar,
  Panel,
  ReactFlowInstance,
  ReactFlowProvider,
  addEdge,
  updateEdge,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { EdgeColor, SelectedEdgeType } from '@/lib/constants';

import CustomNode from './custom-node';
import EdnPanel from './edn-panel';
import FloatingEdge from './floating-edge';
import GraphgActionsPanel from './graphg-actions-panel';
import NewNodePanel from './new-node-panel';
import NewTransitionPanel from './new-transition-panel';

const nodeTypes = {
  custom: CustomNode,
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

type Transition = {
  ':name': string;
  ':from': string;
  ':to': string;
  // ... other properties as needed
};

type EDNData = {
  ':format': string;
  ':transitions': Transition[];
  // ... other properties as needed
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
              strokeWidth: 1,
              stroke: EdgeColor[selectedEdgeType],
            },
            data: {
              edgeType: selectedEdgeType,
            },
          },
          eds,
        );
      });

      setNewEdgeName('');
    },
    [setEdges, selectedEdgeType, newEdgeName, setNewEdgeName],
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

  const onEdgeUpdate = useCallback(
    (oldEdge: Edge, newConnection: Connection) =>
      setEdges((els) => updateEdge(oldEdge, newConnection, els)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
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
        onEdgeUpdate={onEdgeUpdate}
        onEdgeClick={(event, edge) => {
          console.log('edge', edge);
        }}
      >
        <Panel position="top-right">
          <div className="max-w-xs">
            <GraphgActionsPanel
              onLayout={onLayout}
              onSave={onSave}
              onRestore={onRestore}
            />

            <NewTransitionPanel
              onSelect={setSelectedEdgeType}
              selectedEdge={selectedEdgeType}
              onEdgeNameChange={setNewEdgeName}
              newEdgeName={newEdgeName}
            />

            <NewNodePanel
              stateName={newStateName}
              onStateNameChange={setNewStateName}
            />
          </div>
        </Panel>
        <Panel position="top-left">
          <EdnPanel rfInstance={rfInstance} />
        </Panel>
        <Controls />
        {/* <MiniMap /> */}
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
