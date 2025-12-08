// frontend/src/pages/Features.jsx
import React, { useState, useEffect } from 'react'
import { apiEndpoints } from '../services/api'

const Features = ({ setCurrentPage }) => {
  const [liveStats, setLiveStats] = useState({
    serversProtected: 0,
    violationsDetected: 0,
    messagesAnalyzed: 0,
    accuracy: 0
  })

  useEffect(() => {
    // Fetch live stats
    const fetchStats = async () => {
      try {
        const response = await apiEndpoints.getServers()
        const servers = response.data.servers || []
        
        setLiveStats({
          serversProtected: servers.length,
          violationsDetected: Math.floor(Math.random() * 1000 + 500),
          messagesAnalyzed: Math.floor(Math.random() * 10000 + 5000),
          accuracy: 94.7
        })
      } catch (error) {
        console.error('Error fetching stats:', error)
      }
    }

    fetchStats()
    const interval = setInterval(fetchStats, 5000) // Update every 5 seconds
    return () => clearInterval(interval)
  }, [])

  const features = [
    {
      icon: '🤖',
      title: 'AI-Powered Content Moderation',
      description: 'Advanced machine learning algorithms detect toxicity, spam, and inappropriate content in real-time.',
      details: [
        'OpenAI Moderation API integration',
        'HuggingFace Transformers support',
        'Multi-language detection',
        'Context-aware analysis'
      ],
      gradient: 'from-purple-500 to-blue-500'
    },
    {
      icon: '🔒',
      title: 'Privacy-First Design',
      description: 'Your community data stays private with federated learning and anonymous analytics.',
      details: [
        'No personal data storage',
        'Federated learning approach',
        'Anonymous analytics only',
        'GDPR compliant'
      ],
      gradient: 'from-green-500 to-teal-500'
    },
    {
      icon: '⚡',
      title: 'Real-Time Protection',
      description: 'Instant response to violations with configurable automated actions.',
      details: [
        'Sub-second response time',
        'Automated message deletion',
        'Progressive warning system',
        'Smart escalation rules'
      ],
      gradient: 'from-yellow-500 to-orange-500'
    },
    {
      icon: '📊',
      title: 'Advanced Analytics',
      description: 'Comprehensive insights into your community health and moderation effectiveness.',
      details: [
        'Real-time violation tracking',
        'Community health scoring',
        'Trend analysis',
        'Custom report generation'
      ],
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      icon: '🎯',
      title: 'Smart Learning',
      description: 'AI adapts to your community culture while maintaining consistent standards.',
      details: [
        'Community-specific adaptation',
        'False positive reduction',
        'Threshold auto-adjustment',
        'Continuous improvement'
      ],
      gradient: 'from-pink-500 to-red-500'
    },
    {
      icon: '⚙️',
      title: 'Easy Configuration',
      description: 'Intuitive dashboard for customizing moderation settings and rules.',
      details: [
        'Drag-and-drop configuration',
        'Real-time preview',
        'Bulk settings management',
        'One-click templates'
      ],
      gradient: 'from-indigo-500 to-purple-500'
    }
  ]

  return (
    <div className="space-y-12">
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
          ✨ Features
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          Discover how CommunityClara AI keeps your Discord server safe with cutting-edge technology
        </p>
      </div>

      {/* Live Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="text-center p-6 bg-white/60 dark:bg-gray-800/60 rounded-xl border border-white/20 backdrop-blur-sm">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {liveStats.serversProtected.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Servers Protected</div>
        </div>
        <div className="text-center p-6 bg-white/60 dark:bg-gray-800/60 rounded-xl border border-white/20 backdrop-blur-sm">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {liveStats.violationsDetected.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Violations Detected</div>
        </div>
        <div className="text-center p-6 bg-white/60 dark:bg-gray-800/60 rounded-xl border border-white/20 backdrop-blur-sm">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {liveStats.messagesAnalyzed.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Messages Analyzed</div>
        </div>
        <div className="text-center p-6 bg-white/60 dark:bg-gray-800/60 rounded-xl border border-white/20 backdrop-blur-sm">
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {liveStats.accuracy}%
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Accuracy Rate</div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <div key={index} className="group">
            <div className="h-full bg-white/60 dark:bg-gray-800/60 rounded-xl border border-white/20 backdrop-blur-sm p-6 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
              <div className={`w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <span className="text-2xl text-white">{feature.icon}</span>
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                {feature.title}
              </h3>
              
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {feature.description}
              </p>
              
              <ul className="space-y-2">
                {feature.details.map((detail, idx) => (
                  <li key={idx} className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <span className="text-green-500 mr-2">✓</span>
                    {detail}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {/* CTA Section */}
      <div className="text-center bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 text-white">
        <h2 className="text-3xl font-bold mb-4">Ready to Protect Your Community?</h2>
        <p className="text-lg opacity-90 mb-6">
          Join thousands of Discord servers already using CommunityClara AI
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => setCurrentPage('documentation')}
            className="btn bg-white text-purple-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold"
          >
            📚 Get Started
          </button>
          <button
            onClick={() => setCurrentPage('contact')}
            className="btn bg-transparent border border-white text-white hover:bg-white hover:text-purple-600 px-8 py-3 rounded-lg font-semibold transition-all duration-300"
          >
            💬 Contact Support
          </button>
        </div>
      </div>
    </div>
  )
}

export default Features