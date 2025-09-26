import React from 'react'
import ReactFlow, {
  Node,
  Edge,
  NodeChange,
  EdgeChange,
  Connection,
  Controls,
  Background,
  MiniMap,
} from 'reactflow'

interface BuilderCanvasProps {
  nodes: Node[]
  edges: Edge[]
  onNodesChange: (changes: NodeChange[]) => void
  onEdgesChange: (changes: EdgeChange[]) => void
  onConnect: (connection: Connection) => void
  onNodeClick: (event: React.MouseEvent, node: Node) => void
}

export function BuilderCanvas({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onNodeClick,
}: BuilderCanvasProps) {
  return (
    <div className="h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        fitView
        attributionPosition="bottom-left"
      >
        <Background />
        <Controls />
        <MiniMap
          nodeStrokeColor={(n) => {
            if (n.type === 'input') return '#0041d0'
            if (n.type === 'output') return '#ff0072'
            return '#1a192b'
          }}
          nodeColor={(n) => {
            if (n.type === 'input') return '#0041d0'
            if (n.type === 'output') return '#ff0072'
            return '#eee'
          }}
        />
      </ReactFlow>
    </div>
  )
}
