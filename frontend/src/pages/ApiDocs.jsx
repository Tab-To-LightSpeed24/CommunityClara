// frontend/src/pages/ApiDocs.jsx
import React, { useState } from 'react'

const ApiDocs = ({ setCurrentPage }) => {
  const [selectedEndpoint, setSelectedEndpoint] = useState('servers')
  const [apiKey, setApiKey] = useState('your-api-key-here')

  const endpoints = {
    servers: {
      title: 'Server Management',
      description: 'Manage your Discord servers and their settings',
      methods: [
        {
          method: 'GET',
          path: '/api/v1/servers',
          description: 'Get list of all servers',
          response: `{
  "servers": [
    {
      "id": "936677346449170493",
      "name": "My Discord Server",
      "health_score": 0.85,
      "total_messages": 1250
    }
  ],
  "total_count": 1
}`
        },
        {
          method: 'GET',
          path: '/api/v1/servers/{server_id}/stats',
          description: 'Get detailed server statistics',
          response: `{
  "server_id": "936677346449170493",
  "server_name": "My Discord Server",
  "total_violations": 15,
  "health_score": 0.85,
  "toxicity_threshold": 0.7
}`
        }
      ]
    },
    auth: {
      title: 'Authentication',
      description: 'Manage user authentication and sessions',
      methods: [
        {
          method: 'POST',
          path: '/api/v1/auth/google',
          description: 'Authenticate with Google OAuth',
          body: `{
  "token": "google_oauth_token_here"
}`,
          response: `{
  "success": true,
  "user": {
    "id": "google_123456789",
    "email": "user@example.com",
    "username": "johndoe"
  },
  "token": "jwt_token_here"
}`
        }
      ]
    },
    moderation: {
      title: 'Content Moderation',
      description: 'Analyze content and manage violations',
      methods: [
        {
          method: 'POST',
          path: '/api/v1/analyze',
          description: 'Analyze content for violations',
          body: `{
  "content": "Text to analyze",
  "content_type": "text"
}`,
          response: `{
  "flagged": true,
  "confidence": 0.95,
  "violation_type": "toxicity",
  "categories": {
    "toxicity": 0.95,
    "spam": 0.1
  }
}`
        }
      ]
    }
  }

  const generateCurl = (method, path, body = null) => {
    let curl = `curl -X ${method} "http://localhost:8000${path}" \\
  -H "Authorization: Bearer ${apiKey}" \\
  -H "Content-Type: application/json"`

    if (body) {
      curl += ` \\
  -d '${body}'`
    }

    return curl
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    // You could add a toast notification here
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <nav className="mb-6">
          <button
            onClick={() => setCurrentPage('home')}
            className="text-purple-600 dark:text-purple-400 hover:underline"
          >
            ← Back to Home
          </button>
        </nav>

        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
          🔌 API Documentation
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          Integrate CommunityClara AI into your applications with our REST API
        </p>
      </div>

      {/* API Info Section */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <div className="flex items-center mb-3">
          <span className="text-blue-600 dark:text-blue-400 mr-2 text-xl">ℹ️</span>
          <h3 className="font-semibold text-blue-800 dark:text-blue-200 text-lg">Developer Note</h3>
        </div>
        <p className="text-blue-700 dark:text-blue-300">
          CommunityClara uses JWT-based authentication for the dashboard. External API access via API Keys is planned for a future release.
          Use the endpoints below to understand how the frontend communicates with the AI backend.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sticky top-8">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Endpoints</h3>
            <nav className="space-y-2">
              {Object.entries(endpoints).map(([key, endpoint]) => (
                <button
                  key={key}
                  onClick={() => setSelectedEndpoint(key)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${selectedEndpoint === key
                      ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                >
                  {endpoint.title}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {Object.entries(endpoints).map(([key, endpoint]) => (
            <div key={key} className={selectedEndpoint === key ? 'block' : 'hidden'}>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  {endpoint.title}
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  {endpoint.description}
                </p>
              </div>

              <div className="space-y-6">
                {endpoint.methods.map((method, index) => (
                  <div key={index} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                    {/* Method Header */}
                    <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-center space-x-3">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${method.method === 'GET'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                          }`}>
                          {method.method}
                        </span>
                        <code className="text-gray-900 dark:text-gray-100 font-mono">
                          {method.path}
                        </code>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 mt-2">
                        {method.description}
                      </p>
                    </div>

                    {/* Code Examples */}
                    <div className="p-6 space-y-4">
                      {/* cURL Example */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100">cURL</h4>
                          <button
                            onClick={() => copyToClipboard(generateCurl(method.method, method.path, method.body))}
                            className="text-xs text-purple-600 dark:text-purple-400 hover:underline"
                          >
                            Copy
                          </button>
                        </div>
                        <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
                          <code>{generateCurl(method.method, method.path, method.body)}</code>
                        </pre>
                      </div>

                      {/* Request Body */}
                      {method.body && (
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Request Body</h4>
                          <pre className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg overflow-x-auto text-sm">
                            <code>{method.body}</code>
                          </pre>
                        </div>
                      )}

                      {/* Response */}
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Response</h4>
                        <pre className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg overflow-x-auto text-sm">
                          <code>{method.response}</code>
                        </pre>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="text-center bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-8 text-white">
        <h2 className="text-2xl font-bold mb-4">Need Help with Integration?</h2>
        <p className="text-lg opacity-90 mb-6">
          Our support team is here to help you get started with the API
        </p>
        <button
          onClick={() => setCurrentPage('contact')}
          className="btn bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold"
        >
          Contact Support
        </button>
      </div>
    </div>
  )
}

export default ApiDocs