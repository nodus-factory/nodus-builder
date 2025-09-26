import React from 'react'
import { Node } from 'reactflow'

interface NodeInspectorProps {
  node: Node | null
}

export function NodeInspector({ node }: NodeInspectorProps) {
  if (!node) {
    return (
      <div className="p-4 h-full flex items-center justify-center text-gray-500">
        <div className="text-center">
          <div className="text-4xl mb-2">🔍</div>
          <p className="text-sm">Select a node to inspect its properties</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 h-full flex flex-col">
      <div className="mb-4">
        <h3 className="text-sm font-medium text-gray-900 mb-2">Node Properties</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">ID</label>
            <input
              type="text"
              value={node.id}
              readOnly
              className="w-full p-2 border border-gray-300 rounded text-sm bg-gray-50"
            />
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Type</label>
            <input
              type="text"
              value={node.type || 'default'}
              readOnly
              className="w-full p-2 border border-gray-300 rounded text-sm bg-gray-50"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Label</label>
            <input
              type="text"
              value={node.data?.label || ''}
              className="w-full p-2 border border-gray-300 rounded text-sm"
              onChange={(e) => {
                // This would update the node data in the parent component
                console.log('Update label:', e.target.value)
              }}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">X</label>
              <input
                type="number"
                value={node.position.x}
                className="w-full p-2 border border-gray-300 rounded text-sm"
                onChange={(e) => {
                  console.log('Update X:', e.target.value)
                }}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Y</label>
              <input
                type="number"
                value={node.position.y}
                className="w-full p-2 border border-gray-300 rounded text-sm"
                onChange={(e) => {
                  console.log('Update Y:', e.target.value)
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Configuration</h4>
        <div className="bg-gray-50 rounded-lg p-3">
          <pre className="text-xs text-gray-700 whitespace-pre-wrap">
            {JSON.stringify(node.data, null, 2)}
          </pre>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 text-sm">
          Update Node
        </button>
        <button className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 text-sm">
          Delete Node
        </button>
      </div>
    </div>
  )
}
