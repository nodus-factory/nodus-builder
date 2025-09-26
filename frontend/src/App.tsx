import React from 'react'

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🎨 NodusOS Builder GUI
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Visual graph editor with AI-assisted development
          </p>
          
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Canvas Area */}
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold text-gray-800">Graph Canvas</h2>
                <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <div className="text-6xl mb-4">🎨</div>
                  <p className="text-gray-600">
                    Visual graph editor will be integrated here
                  </p>
                </div>
              </div>
              
              {/* AI Copilot */}
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold text-gray-800">🤖 AI Copilot</h2>
                <div className="bg-gray-50 rounded-lg p-6">
                  <textarea
                    className="w-full p-3 border rounded-lg resize-none"
                    placeholder="Describe the changes you want to make..."
                    rows={3}
                  />
                  <button className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700">
                    Generate Suggestion
                  </button>
                </div>
              </div>
            </div>
            
            <div className="mt-8 text-center">
              <p className="text-gray-500">
                Builder GUI is ready for development! 🚀
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App