import React, { useState, useEffect } from 'react'

interface Minigraf {
  id: string
  version: string
  io: {
    input: Record<string, string>
    output: Record<string, string>
  }
  tags: string[]
  description: string
}

export function MinigrafHub() {
  const [minigrafs, setMinigrafs] = useState<Minigraf[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchMinigrafs()
  }, [])

  const fetchMinigrafs = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/builder/minigrafs')
      const data = await response.json()
      setMinigrafs(data)
    } catch (error) {
      console.error('Failed to fetch minigrafs:', error)
      // Mock data for development
      setMinigrafs([
        {
          id: 'finance.budget_builder',
          version: '1.0.0',
          io: {
            input: { brief: 'object' },
            output: { budget: 'object' }
          },
          tags: ['finance', 'budget', 'planning'],
          description: 'Build comprehensive budgets from business briefs'
        },
        {
          id: 'data.contract_extractor',
          version: '2.1.0',
          io: {
            input: { document: 'string' },
            output: { entities: 'array' }
          },
          tags: ['data', 'extraction', 'nlp'],
          description: 'Extract structured data from contracts and documents'
        },
        {
          id: 'validation.schema_validator',
          version: '1.5.0',
          io: {
            input: { data: 'object', schema: 'object' },
            output: { valid: 'boolean', errors: 'array' }
          },
          tags: ['validation', 'schema', 'data'],
          description: 'Validate data against JSON schemas'
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const filteredMinigrafs = minigrafs.filter(minigraf =>
    minigraf.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    minigraf.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    minigraf.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const handleDragStart = (event: React.DragEvent, minigraf: Minigraf) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify({
      type: 'minigraf',
      minigraf,
      position: { x: 0, y: 0 }
    }))
    event.dataTransfer.effectAllowed = 'move'
  }

  return (
    <div className="flex-1 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <input
          type="text"
          placeholder="Search minigrafs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-lg text-sm"
        />
      </div>

      <div className="flex-1 overflow-auto p-4">
        {loading ? (
          <div className="text-center text-gray-500 py-8">
            <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
            <p className="text-sm">Loading minigrafs...</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredMinigrafs.map((minigraf) => (
              <div
                key={minigraf.id}
                draggable
                onDragStart={(e) => handleDragStart(e, minigraf)}
                className="p-3 border border-gray-200 rounded-lg cursor-grab hover:border-blue-300 hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-900">{minigraf.id}</h4>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    v{minigraf.version}
                  </span>
                </div>
                <p className="text-xs text-gray-600 mb-2">{minigraf.description}</p>
                <div className="flex flex-wrap gap-1">
                  {minigraf.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
