import React, { useState } from 'react'
import { Node, Edge } from 'reactflow'

interface LLMCompanionProps {
  nodes: Node[]
  edges: Edge[]
}

export function LLMCompanion({ nodes, edges }: LLMCompanionProps) {
  const [prompt, setPrompt] = useState('')
  const [suggestion, setSuggestion] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const handleSuggest = async () => {
    if (!prompt.trim()) return

    setLoading(true)
    try {
      // Connect to Builder backend API for LLM Companion
      const response = await fetch('http://localhost:8001/builder/describe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brief: prompt,
          graph_spec: { nodes, edges },
          catalog: {
            nodes: [
              { id: 'llm.structured', type: 'llm', description: 'Structured LLM output' },
              { id: 'http.request', type: 'integration', description: 'HTTP API calls' },
              { id: 'transform.map', type: 'data', description: 'Data transformation' },
              { id: 'notify.email', type: 'notification', description: 'Email notifications' }
            ]
          },
          preferences: {
            model: "gpt-4o-mini",
            limits: { nodes_max: 5 }
          }
        }),
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      setSuggestion(data)
    } catch (error) {
      console.error('Failed to get LLM Companion suggestion:', error)
      // Fallback mock response for development
      setSuggestion({
        rationale: "Added intelligent graph modifications based on your request",
        patch: [
          {
            op: "add",
            path: "/nodes/-",
            value: {
              id: `node_${Date.now()}`,
              type: "llm.structured",
              position: { x: 300, y: 200 + nodes.length * 100 },
              data: {
                label: "LLM Node",
                description: "Large Language Model for text processing"
              }
            }
          }
        ],
        risks: ["Cost LLM"],
        diagnostics: []
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
        <h3 className="text-sm font-medium text-gray-900 mb-2">🤖 LLM Companion</h3>
        <textarea
          className="w-full p-3 border border-gray-300 rounded-lg resize-none text-sm"
          placeholder="Describe the workflow you want to build (e.g., 'add cron at 8h, filter by status, summarize and send email')..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={3}
        />
        <button
          onClick={handleSuggest}
          disabled={loading || !prompt.trim()}
          className="mt-2 w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          {loading ? 'Analyzing...' : 'Generate Graph'}
        </button>
      </div>

      {suggestion && (
        <div className="flex-1 flex flex-col">
          <div className="mb-3">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Rationale</h4>
            <p className="text-sm text-gray-600 mb-2">{suggestion.rationale}</p>
            {suggestion.risks && suggestion.risks.length > 0 && (
              <div className="mb-2">
                <h5 className="text-xs font-medium text-orange-600 mb-1">Risks:</h5>
                <ul className="text-xs text-orange-600">
                  {suggestion.risks.map((risk: string, index: number) => (
                    <li key={index}>• {risk}</li>
                  ))}
                </ul>
              </div>
            )}
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
            Apply JSON Patch
          </button>
        </div>
      )}

      {!suggestion && (
        <div className="flex-1 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <div className="text-4xl mb-2">🤖</div>
            <p className="text-sm">Describe your workflow in natural language</p>
          </div>
        </div>
      )}
    </div>
  )
}
