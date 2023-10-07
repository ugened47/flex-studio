'use client';

import React, { memo, useState } from 'react';

import {
  Handle,
  NodeProps,
  Position,
  useStore,
  useUpdateNodeInternals,
} from 'reactflow';

const INITIAL_STATE = 'initial';

function CustomNode(props: NodeProps) {
  const [edgeCount, incrEdge] = useState(0);

  const { data, id } = props;

  console.log('CustomNode', props);

  const updateNodeInternals = useUpdateNodeInternals();

  const edges = useStore((s) => {
    const edgs = s.edges.filter((e) => e.target === props.id);
    if (edgs.length !== edgeCount) {
      incrEdge(() => {
        updateNodeInternals(props.id);
        return edgs.length;
      });
    }
    return edgs;
  });

  const nid = `in-${edges.length + 1}`;

  const isInitial = id === INITIAL_STATE;

  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-[#B2B2B2]">
      <div className="flex">
        <div className="text-xs font-bold">{data.label}</div>
      </div>

      {!isInitial &&
        edges.map((edge, i) => (
          <Handle
            id={edge.targetHandle!}
            key={edge.id + edge.targetHandle}
            type="target"
            position={Position.Top}
            style={{ left: i * 20, background: '#555' }}
            isConnectable={false}
            className="!w-3 !h-3 !rounded"
          />
        ))}

      {!isInitial && (
        <Handle
          id={nid}
          key={nid}
          type="target"
          position={Position.Top}
          style={{ left: edges.length * 20, background: '#555' }}
          className="!w-3 !h-3 !rounded"
          onConnect={(params) => console.log('handle onConnect', params)}
          isConnectable
        />
      )}

      {/* {uniqueHandles.map((handle: any) => (
        <Handle
          key={handle.id}
          id={handle.id}
          type="target"
          position={Position.Top}
          className={handle.className}
        />
      ))} */}

      {/* <Handle type="target" id="customer" position={Position.Top} className="!w-3 !h-3 !bg-[#F5A623] !rounded !left-1" />
      <Handle type="target" id="provider" position={Position.Top} className="!w-3 !h-3 !bg-[#BD10E0] !rounded !left-4" />
      <Handle type="target" id="operator" position={Position.Top} className="!w-3 !h-3 !bg-[#417505] !rounded !left-7" />
      <Handle type="target" id="automatic" position={Position.Top} className="!w-3 !h-3 !bg-[#888888] !rounded !left-10" /> */}

      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-6 !h-3 !bg-fuchsia-500 !rounded"
      />
    </div>
  );
}

export default memo(CustomNode);
