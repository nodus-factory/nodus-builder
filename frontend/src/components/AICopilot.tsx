import React, { useState } from 'react'
import { Node, Edge } from 'reactflow'

interface AICopilotProps {
  nodes: Node[]
  edges: Edge[]
}

export function AICopilot({ nodes, edges }: AICopilotProps) {
  const [prompt, setPrompt] = useState('')
  const [suggestion, setSuggestion] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const handleSuggest = async () => {
    if (!prompt.trim()) return

    setLoading(true)
    try {
      // Mock API call - replace with actual API
      const response = await fetch('/api/builder/llm_suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          graph: { nodes, edges },
          instruction: prompt,
        }),
      })
      
      const data = await response.json()
      setSuggestion(data)
    } catch (error) {
      console.error('Failed to get suggestion:', error)
      // Mock response for development
      setSuggestion({
        rationale: "Added a new LLM node based on your request",
        patch: [
          {
            op: "add",
            path: "/nodes/-",
            value: {
              id: `node_${Date.now()}`,
              type: "llm.structured",
              position: { x: 300, y: 200 },
              data: { label: "New LLM Node" }
            }
          }
        ]
      })
    } finally {
      setLoading(false)
    }
  }

  const handleApplySuggestion = () => {
    if (suggestion?.patch) {
      // Apply the JSON patch to the graph
      console.log('Applying patch:', suggestion.patch)
      // This would update the graph state in the parent component
    }
  }

  return (
    <div className="p-4 h-full flex flex-col">
      <div className="mb-4">
        <h3 className="text-sm font-medium text-gray-900 mb-2">AI Assistant</h3>
        <textarea
          className="w-full p-3 border border-gray-300 rounded-lg resize-none text-sm"
          placeholder="Describe the changes you want to make to the graph..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={3}
        />
        <button
          onClick={handleSuggest}
          disabled={loading || !prompt.trim()}
          className="mt-2 w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          {loading ? 'Generating...' : 'Generate Suggestion'}
        </button>
      </div>

      {suggestion && (
        <div className="flex-1 flex flex-col">
          <div className="mb-3">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Suggestion</h4>
            <p className="text-sm text-gray-600 mb-2">{suggestion.rationale}</p>
          </div>

          <div className="flex-1 flex flex-col">
            <h4 className="text-sm font-medium text-gray-900 mb-2">JSON Patch</h4>
            <div className="flex-1 bg-gray-50 rounded-lg p-3 overflow-auto">
              <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                {JSON.stringify(suggestion.patch, null, 2)}
              </pre>
            </div>
          </div>

          <button
            onClick={handleApplySuggestion}
            className="mt-3 w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 text-sm"
          >
            Apply Suggestion
          </button>
        </div>
      )}

      {!suggestion && (
        <div className="flex-1 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <div className="text-4xl mb-2">🤖</div>
            <p className="text-sm">Describe what you want to build</p>
          </div>
        </div>
      )}
    </div>
  )
}
