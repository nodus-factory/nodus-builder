import React, { useCallback, useRef } from 'react'
import ReactFlow, {
  Node,
  Edge,
  NodeChange,
  EdgeChange,
  Connection,
  Controls,
  Background,
  MiniMap,
  ReactFlowProvider,
  useReactFlow,
} from 'reactflow'

interface BuilderCanvasProps {
  nodes: Node[]
  edges: Edge[]
  onNodesChange: (changes: NodeChange[]) => void
  onEdgesChange: (changes: EdgeChange[]) => void
  onConnect: (connection: Connection) => void
  onNodeClick: (event: React.MouseEvent, node: Node) => void
}

function BuilderCanvasInner({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onNodeClick,
}: BuilderCanvasProps) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const { screenToFlowPosition } = useReactFlow()

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  const onDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault()

    const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect()
    if (!reactFlowBounds) return

    const data = event.dataTransfer.getData('application/reactflow')
    if (!data) return

    try {
      const { type, minigraf, position } = JSON.parse(data)
      
      if (type === 'minigraf') {
        const position = screenToFlowPosition({
          x: event.clientX - reactFlowBounds.left,
          y: event.clientY - reactFlowBounds.top,
        })

        const newNode: Node = {
          id: `${minigraf.id}_${Date.now()}`,
          type: 'default',
          position,
          data: {
            label: minigraf.id,
            minigraf: minigraf,
            description: minigraf.description,
          },
        }

        // Add the new node
        onNodesChange([{
          type: 'add',
          item: newNode,
        }])
      }
    } catch (error) {
      console.error('Failed to parse drop data:', error)
    }
  }, [screenToFlowPosition, onNodesChange])

  return (
    <div className="h-full" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onDrop={onDrop}
        onDragOver={onDragOver}
        fitView
        attributionPosition="bottom-left"
        nodeTypes={{
          default: ({ data }) => (
            <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-stone-400">
              <div className="flex">
                <div className="ml-2">
                  <div className="text-lg font-bold">{data.label}</div>
                  {data.description && (
                    <div className="text-gray-500 text-xs">{data.description}</div>
                  )}
                </div>
              </div>
            </div>
          ),
        }}
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

export function BuilderCanvas(props: BuilderCanvasProps) {
  return (
    <ReactFlowProvider>
      <BuilderCanvasInner {...props} />
    </ReactFlowProvider>
  )
}
