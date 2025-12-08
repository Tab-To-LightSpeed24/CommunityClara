// frontend/src/components/Debug/FeedbackDebugConsole.jsx
import React, { useState, useEffect } from 'react'

const FeedbackDebugConsole = ({ serverId }) => {
  const [logs, setLogs] = useState([])
  const [isVisible, setIsVisible] = useState(false)

  // Capture console logs related to feedback
  useEffect(() => {
    const originalLog = console.log
    const originalError = console.error

    console.log = (...args) => {
      originalLog(...args)
      if (args[0]?.includes?.('Frontend: Attempting to send feedback') || 
          args[0]?.includes?.('Frontend: Feedback sent successfully') ||
          args[0]?.includes?.('Frontend: Failed to submit feedback')) {
        setLogs(prev => [{
          id: Date.now(),
          timestamp: new Date().toLocaleTimeString(),
          type: 'info',
          message: JSON.stringify(args, null, 2)
        }, ...prev.slice(0, 19)]) // Keep last 20 logs
      }
    }

    console.error = (...args) => {
      originalError(...args)
      if (args[0]?.includes?.('Frontend: Failed to submit feedback')) {
        setLogs(prev => [{
          id: Date.now(),
          timestamp: new Date().toLocaleTimeString(),
          type: 'error',
          message: JSON.stringify(args, null, 2)
        }, ...prev.slice(0, 19)])
      }
    }

    return () => {
      console.log = originalLog
      console.error = originalError
    }
  }, [])

  const clearLogs = () => setLogs([])

  const testFeedbackEndpoint = async () => {
    try {
      // First test the debug endpoint
      const debugResponse = await fetch('/api/v1/debug/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          test: true,
          server_id: serverId,
          timestamp: new Date().toISOString()
        })
      })
      
      if (debugResponse.ok) {
        const result = await debugResponse.json()
        console.log('✅ Debug endpoint test:', result)
        
        setLogs(prev => [{
          id: Date.now(),
          timestamp: new Date().toLocaleTimeString(),
          type: 'success',
          message: `✅ Debug endpoint working: ${JSON.stringify(result)}`
        }, ...prev.slice(0, 19)])
      } else {
        throw new Error(`Debug endpoint failed: ${debugResponse.status}`)
      }

      // Test insights endpoint
      const insightsResponse = await fetch(`/api/v1/servers/${serverId}/insights`)
      if (insightsResponse.ok) {
        const insights = await insightsResponse.json()
        setLogs(prev => [{
          id: Date.now(),
          timestamp: new Date().toLocaleTimeString(),
          type: 'success',
          message: `✅ Insights endpoint working: ${Object.keys(insights).length} fields returned`
        }, ...prev.slice(0, 19)])
      } else {
        setLogs(prev => [{
          id: Date.now(),
          timestamp: new Date().toLocaleTimeString(),
          type: 'error',
          message: `❌ Insights endpoint failed: ${insightsResponse.status}`
        }, ...prev.slice(0, 19)])
      }

      // Test with mock violation if available
      const mockViolationId = 1 // You can adjust this
      const feedbackResponse = await fetch(`/api/v1/servers/${serverId}/violations/${mockViolationId}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_false_positive: true })
      })

      if (feedbackResponse.ok) {
        const feedbackResult = await feedbackResponse.json()
        setLogs(prev => [{
          id: Date.now(),
          timestamp: new Date().toLocaleTimeString(),
          type: 'success',
          message: `✅ Feedback endpoint working: ${JSON.stringify(feedbackResult)}`
        }, ...prev.slice(0, 19)])
      } else {
        const errorText = await feedbackResponse.text()
        setLogs(prev => [{
          id: Date.now(),
          timestamp: new Date().toLocaleTimeString(),
          type: 'warning',
          message: `⚠️ Feedback test (violation ${mockViolationId}): ${feedbackResponse.status} - ${errorText}`
        }, ...prev.slice(0, 19)])
      }
      
    } catch (error) {
      console.error('❌ API test failed:', error)
      setLogs(prev => [{
        id: Date.now(),
        timestamp: new Date().toLocaleTimeString(),
        type: 'error',
        message: `❌ API test failed: ${error.message}`
      }, ...prev.slice(0, 19)])
    }
  }

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-purple-600 text-white p-3 rounded-full shadow-lg hover:bg-purple-700 transition-colors z-50"
        title="Open Feedback Debug Console"
      >
        🔧
      </button>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 max-h-96 bg-gray-900 text-green-400 rounded-lg shadow-2xl z-50 font-mono text-xs overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-3 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center space-x-2">
          <span className="text-lg">🔧</span>
          <span className="font-bold">Feedback Debug Console</span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={testFeedbackEndpoint}
            className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
            title="Test feedback endpoint"
          >
            Test API
          </button>
          <button
            onClick={clearLogs}
            className="px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
            title="Clear logs"
          >
            Clear
          </button>
          <button
            onClick={() => setIsVisible(false)}
            className="text-gray-400 hover:text-white"
            title="Close console"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Logs */}
      <div className="p-3 overflow-y-auto max-h-80">
        {logs.length === 0 ? (
          <div className="text-gray-500 text-center py-4">
            No feedback logs yet.<br />
            Click "False" or "Correct" on any violation to see logs here.
          </div>
        ) : (
          <div className="space-y-2">
            {logs.map(log => (
              <div key={log.id} className={`p-2 rounded ${
                log.type === 'error' ? 'bg-red-900/20 text-red-400' :
                log.type === 'success' ? 'bg-green-900/20 text-green-400' :
                'bg-gray-800 text-gray-300'
              }`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-gray-500">{log.timestamp}</span>
                  <span className={`text-xs px-1 rounded ${
                    log.type === 'error' ? 'bg-red-600' :
                    log.type === 'success' ? 'bg-green-600' :
                    'bg-blue-600'
                  } text-white`}>
                    {log.type}
                  </span>
                </div>
                <pre className="whitespace-pre-wrap text-xs overflow-x-auto">
                  {log.message}
                </pre>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="p-2 bg-gray-800 border-t border-gray-700 text-gray-400 text-xs">
        <strong>How to verify ML training:</strong><br />
        1. Click "False" or "Correct" on violations<br />
        2. Watch logs here for API responses<br />
        3. Check Learning Insights section above<br />
        4. Monitor threshold changes over time
      </div>
    </div>
  )
}

export default FeedbackDebugConsole