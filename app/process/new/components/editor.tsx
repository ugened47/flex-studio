"use client";

import React, { useCallback, useLayoutEffect, useMemo, useState } from "react";

import ReactFlow, {
  Connection,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  NodeToolbar,
  ConnectionMode,
  Edge,
  useReactFlow,
  ReactFlowInstance,
  Panel,
  ReactFlowProvider,
  MarkerType,
  EdgeProps,
  Node,
  useUpdateNodeInternals,
  Position,
} from "reactflow";

import cx from "classnames";

import "reactflow/dist/style.css";
import customNode from "./custom-node";
import FloatingEdge from "./floating-edge";
import FloatingConnectionLine from "./floating-connection-line";
import { getRandomColor } from "./utils";
import { AutomaticArrow, AutomaticArrowHead, AutomaticArrowTail, CustomerArrow, OperatorArrow, PrivilegedStateIcon, ProviderArrow } from "@/components/shared/icons/transition-arrow";

import ELK from 'elkjs/lib/elk.bundled.js';

const nodeTypes = {
  custom: customNode,
};

const edgeTypes = {
  floating: FloatingEdge
};

const initialNodes: Node[] = [
  {
    id: "initial",
    type: "custom",
    position: { x: 0, y: 0 },
    data: { label: "initial" },
  },
];
const initialEdges: Edge<any>[] = [];

const flowKey = "flow";

const getNodeId = () => `node_${+new Date()}`;

enum SelectedEdgeType {
  Customer = "customer",
  Provider = "provider",
  Operator = "operator",
  Automatic = "automatic",
}

enum EdgeColor {
  customer = "#F5A623",
  provider = "#BD10E0",
  operator = "#417505",
  automatic = "#888888",
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

const getLayoutedElements = (nodes: Node[], edges: Edge[], options: any = {}) => {
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

  return elk
    .layout(graph as any)
    .then((layoutedGraph) => ({
      nodes: layoutedGraph?.children?.map((node) => ({
        ...node,
        // React Flow expects a position property on the node instead of `x`
        // and `y` fields.
        position: { x: node.x, y: node.y },
      })),

      edges: layoutedGraph.edges,
    }))
    .catch(console.error);
};

function GraphEditorComponent() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance<any, any>>(
    null as any,
  );
  const { setViewport, fitView } = useReactFlow();

  const [selectedEdgeType, setSelectedEdgeType] = useState<SelectedEdgeType>(SelectedEdgeType.Customer);

  // const updateNodeInternals = useUpdateNodeInternals();

  const onLayout = useCallback(
    ({ direction, useInitialNodes = false }: any) => {
      const opts = { 'elk.direction': direction, ...elkOptions };
      const ns = useInitialNodes ? initialNodes : nodes;
      const es = useInitialNodes ? initialEdges : edges;

      getLayoutedElements(ns, es, opts).then(({ nodes: layoutedNodes, edges: layoutedEdges }: any) => {
        setNodes(layoutedNodes);
        setEdges(layoutedEdges);

        window.requestAnimationFrame(() => fitView());
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [nodes, edges]
  );

    // Calculate the initial layout on mount.
    useLayoutEffect(() => {
      onLayout({ direction: 'DOWN', useInitialNodes: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) => {
        // updateNodeInternals()
        console.log('params', params);

        const edgeName = `${selectedEdgeType}/${params.source}-to-${params.target}`

        // setNodes((nds) =>
        //   nds.map((node) => {
        //     if (node.id === params.target) {

        //       node.data = {
        //         ...node.data,
        //         handles: [
        //           ...node.data.handles?.filter((el: any) => el.id !== `${selectedEdgeType}_${params.source}_${params.target}`) || [],
        //           {
        //             id: `${selectedEdgeType}_${params.source}_${params.target}`,
        //             position: Position.Top,
        //             type: 'target',
        //             className: `!w-3 !h-3 !bg-[${EdgeColor[selectedEdgeType]}] !rounded !left-${nds.length * 3 + 1}`,
        //           },
        //         ],
        //       };
        //     }
  
        //     return node;
        //   })
        // );

        // updateNodeInternals(params.target!);
      
        return addEdge(
          {
            ...params,
            id: edgeName,
            targetHandle: edgeName,
            type: "smoothstep",
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
        )},
      )
    },
    [setEdges, setNodes, selectedEdgeType],
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

  const onAdd = useCallback(() => {
    const center = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

    const newNode = {
      id: getNodeId(),
      data: { label: "Added node" },
      type: "custom",
      position: {
        x: Math.random() * center.x - 100,
        y: Math.random() * center.y,
      },
    };
    setNodes((nds) => nds.concat(newNode));
  }, [setNodes]);

  return (
    <div className="h-full w-full">
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
      >
        <Panel position="top-right">
        <button onClick={() => onLayout({ direction: 'DOWN' })}>vertical layout</button>

          <button
            onClick={onAdd}
            className="mb-2 mr-2 rounded-lg bg-gradient-to-br from-purple-600 to-blue-500 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-gradient-to-bl focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800"
          >
            add node
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
            <span className="relative rounded-md bg-white px-5 py-2.5 text-gray-900 transition-all duration-75 ease-in group-hover:bg-opacity-0 group-hover:text-white">
              restore
            </span>
          </button>
          <SelectPanel
            onSelect={setSelectedEdgeType}
            selectedEdge={selectedEdgeType}
          />
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
}

const SelectPanel = ({ onSelect, selectedEdge }: SelectPanelProps) => {

  const handleSelect = (edgeType: SelectedEdgeType) => {
    onSelect(edgeType);
  }

  const edgeTypes = useMemo(() => [
    {
      type: SelectedEdgeType.Customer,
      label: "Customer",
      icon: <CustomerArrow />,
    },
    {
      type: SelectedEdgeType.Provider,
      label: "Provider",
      icon: <ProviderArrow />,
    },
    {
      type: SelectedEdgeType.Operator,
      label: "Marketplace Operator",
      icon: <OperatorArrow />,
    },
    {
      type: SelectedEdgeType.Automatic,
      label: "Automatic",
      icon: <AutomaticArrow />,
    },
  ], []);

  return (
    <div className="flex flex-col rounded-xl border border-gray-200 bg-white shadow-md p-2">

      {/* <div className="flex flex-row items-center gap-2 cursor-pointer">
        <AutomaticArrowTail />
        <span className="underline text-[#4A4A4A] text-sm leading-6 relative top-[-2px]">Transition</span>
        <AutomaticArrowHead />
      </div> */}

      {edgeTypes.map(({ type, label, icon }) => (
        <div
          key={type}
          className={cx("flex flex-row items-center gap-2 cursor-pointer mb-2", {
            "rounded-xl border-gray-200 bg-gray-50 shadow-md p-1": selectedEdge === type,
          })}
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
        <span className="text-[#4A4A4A] text-sm leading-6">Privileged transition</span>
      </div>
    </div>
  )
};