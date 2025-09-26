import React, { useState, useCallback } from 'react'
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MiniMap,
  NodeTypes,
} from 'reactflow'
import 'reactflow/dist/style.css'

import { BuilderCanvas } from './components/BuilderCanvas'
import { LLMCompanion } from './components/AICopilot'
import { MinigrafHub } from './components/MinigrafHub'
import { NodeInspector } from './components/NodeInspector'

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'input',
    position: { x: 250, y: 25 },
    data: { label: 'Input Node' },
  },
  {
    id: '2',
    position: { x: 100, y: 125 },
    data: { label: 'Default Node' },
  },
  {
    id: '3',
    type: 'output',
    position: { x: 400, y: 125 },
    data: { label: 'Output Node' },
  },
]

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2' },
  { id: 'e2-3', source: '2', target: '3' },
]

function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const [activeTab, setActiveTab] = useState<'copilot' | 'inspector'>('copilot')
  const [validationResult, setValidationResult] = useState<any>(null)
  const [dryRunResult, setDryRunResult] = useState<any>(null)

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )

  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    setSelectedNode(node)
    setActiveTab('inspector')
  }, [])

  const handleSave = useCallback(() => {
    const graphData = { nodes, edges }
    console.log('Saving graph:', graphData)
    // TODO: Implement actual save functionality
    alert('Graph saved! (This is a mock save)')
  }, [nodes, edges])

  const handleValidate = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:8001/builder/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nodes, edges }),
      })
      const result = await response.json()
      setValidationResult(result)
      
      if (result.valid) {
        alert('✅ Graph is valid!')
      } else {
        alert(`❌ Graph has errors: ${result.errors.map((e: any) => e.message).join(', ')}`)
      }
    } catch (error) {
      console.error('Validation failed:', error)
      alert('❌ Validation failed - check console for details')
    }
  }, [nodes, edges])

  const handleDryRun = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:8001/builder/dry-run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          graph: { nodes, edges },
          fixtures: { mock: 'test data' }
        }),
      })
      const result = await response.json()
      setDryRunResult(result)
      
      if (result.success) {
        alert('✅ Dry run completed successfully!')
        console.log('Dry run timeline:', result.timeline)
      } else {
        alert(`❌ Dry run failed: ${result.result.message}`)
      }
    } catch (error) {
      console.error('Dry run failed:', error)
      alert('❌ Dry run failed - check console for details')
    }
  }, [nodes, edges])

  const handleToGraphSpec = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:8001/builder/to-graphspec', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nodes, edges }),
      })
      const result = await response.json()
      
      if (result.status === 'converted') {
        console.log('GraphSpec generated:', result.graphspec)
        alert('✅ GraphSpec generated successfully! Check console for details.')
        // You could also show this in a modal or side panel
      } else {
        alert(`❌ GraphSpec conversion failed: ${result.message}`)
      }
    } catch (error) {
      console.error('GraphSpec conversion failed:', error)
      alert('❌ GraphSpec conversion failed - check console for details')
    }
  }, [nodes, edges])

  return (
    <div className="h-screen bg-gray-50 flex">
      {/* Left Panel: Minigraf Hub */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Minigraf Hub</h2>
          <p className="text-sm text-gray-600">Drag & drop components</p>
        </div>
        <MinigrafHub />
      </div>

      {/* Center Panel: Builder Canvas */}
      <div className="flex-1 flex flex-col">
        <div className="h-12 bg-white border-b border-gray-200 flex items-center px-4">
          <h1 className="text-lg font-semibold text-gray-900">🎨 NodusOS Builder</h1>
              <div className="ml-auto flex space-x-2">
                <button 
                  onClick={handleSave}
                  className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
                >
                  Save
                </button>
                <button 
                  onClick={handleValidate}
                  className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-md hover:bg-green-200"
                >
                  Validate
                </button>
                <button 
                  onClick={handleDryRun}
                  className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200"
                >
                  Dry Run
                </button>
                <button 
                  onClick={handleToGraphSpec}
                  className="px-3 py-1 text-sm bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200"
                >
                  To GraphSpec
                </button>
              </div>
        </div>
        
        <div className="flex-1">
          <BuilderCanvas
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
          />
        </div>
      </div>

      {/* Right Panel: AI Copilot & Inspector */}
      <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
        <div className="h-12 border-b border-gray-200 flex">
          <button
            className={`flex-1 px-4 py-3 text-sm font-medium ${
              activeTab === 'copilot'
                ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-700'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            onClick={() => setActiveTab('copilot')}
          >
                🤖 LLM Companion
          </button>
          <button
            className={`flex-1 px-4 py-3 text-sm font-medium ${
              activeTab === 'inspector'
                ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-700'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            onClick={() => setActiveTab('inspector')}
          >
            🔍 Inspector
          </button>
        </div>
        
            <div className="flex-1 overflow-hidden">
              {activeTab === 'copilot' ? (
                <LLMCompanion nodes={nodes} edges={edges} />
              ) : (
                <NodeInspector node={selectedNode} />
              )}
            </div>
      </div>
    </div>
  )
}

export default App