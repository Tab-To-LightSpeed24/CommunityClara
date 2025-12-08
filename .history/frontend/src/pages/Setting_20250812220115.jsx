// frontend/src/pages/Settings.jsx
import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { apiEndpoints } from '../services/api'
import ServerSettings from '../components/Settings/ServerSettings'
import BotConfig from '../components/Settings/BotConfig'
import ServerSelector from '../components/Dashboard/ServerSelector'
import LoadingSpinner from '../components/Layout/LoadingSpinner'
import ErrorMessage from '../components/Layout/ErrorMessage'

const Settings = () => {
  const [selectedServerId, setSelectedServerId] = useState(null)
  const [activeTab, setActiveTab] = useState('server')

  // Fetch servers list
  const { data: serversData, isLoading: serversLoading, error: serversError } = useQuery({
    queryKey: ['servers'],
    queryFn: () => apiEndpoints.getServers(),
    select: (response) => response.data
  })

  // Auto-select first server if none selected
  React.useEffect(() => {
    if (serversData?.servers?.length > 0 && !selectedServerId) {
      setSelectedServerId(serversData.servers[0].id)
    }
  }, [serversData, selectedServerId])

  const tabs = [
    {
      id: 'server',
      label: 'Server Settings',
      icon: '🏠',
      description: 'General server configuration and moderation settings',
      component: ServerSettings
    },
    {
      id: 'bot',
      label: 'Bot Configuration',
      icon: '🤖',
      description: 'AI moderation thresholds and automated actions',
      component: BotConfig
    },
    {
      id: 'privacy',
      label: 'Privacy & Security',
      icon: '🔒',
      description: 'Data handling and privacy settings',
      component: () => (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🔒</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Privacy Settings</h3>
          <p className="text-gray-600 dark:text-gray-400">Coming soon - Advanced privacy and security configuration.</p>
        </div>
      )
    },
    {
      id: 'integrations',
      label: 'Integrations',
      icon: '🔗',
      description: 'Third-party services and webhook configuration',
      component: () => (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🔗</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Integrations</h3>
          <p className="text-gray-600 dark:text-gray-400">Coming soon - Connect with webhooks, APIs, and other services.</p>
        </div>
      )
    }
  ]

  if (serversLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
        <span className="ml-3 text-lg text-gray-600 dark:text-gray-400">Loading servers...</span>
      </div>
    )
  }

  if (serversError) {
    return (
      <ErrorMessage 
        title="Unable to load servers"
        message={serversError.message}
      />
    )
  }

  if (!serversData?.servers?.length) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">🤖</span>
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No Servers Found</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Add the CommunityClara AI bot to your Discord servers to get started.
        </p>
        <a 
          href="https://discord.com/api/oauth2/authorize?client_id=YOUR_BOT_ID&permissions=8&scope=bot"
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary"
        >
          Add Bot to Server
        </a>
      </div>
    )
  }

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || ServerSettings

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Settings</h1>
            <p className="text-gray-600 dark:text-gray-400">Configure your Discord server moderation and AI settings</p>
          </div>
          
          <ServerSelector
            servers={serversData.servers}
            selectedServerId={selectedServerId}
            onServerChange={setSelectedServerId}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="card backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border border-white/20 shadow-xl sticky top-4">
              <div className="p-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-t-lg">
                <h3 className="text-lg font-bold text-white">⚙️ Configuration</h3>
              </div>
              
              <nav className="p-4">
                <div className="space-y-2">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
                        activeTab === tab.id
                          ? 'bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/50 dark:to-blue-900/50 text-purple-700 dark:text-purple-300 border-l-4 border-purple-500'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-xl">{tab.icon}</span>
                        <div>
                          <div className="font-medium">{tab.label}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {tab.description}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </nav>

              {/* Quick Actions */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">⚡ Quick Actions</h4>
                <div className="space-y-2">
                  <button className="w-full text-left p-2 text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded transition-colors">
                    📊 View Dashboard
                  </button>
                  <button className="w-full text-left p-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors">
                    📋 Export Settings
                  </button>
                  <button className="w-full text-left p-2 text-sm text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors">
                    🔄 Reset All
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <ActiveComponent serverId={selectedServerId} />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <div className="card backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border border-white/20 shadow-xl">
            <div className="p-6">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                💡 Need Help?
              </h4>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Check out our documentation or contact support for assistance with configuration.
              </p>
              <div className="flex justify-center space-x-4">
                <a 
                  href="https://docs.safespace-ai.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn bg-blue-600 text-white hover:bg-blue-700"
                >
                  📖 Documentation
                </a>
                <a 
                  href="https://discord.gg/safespace-ai" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn bg-purple-600 text-white hover:bg-purple-700"
                >
                  💬 Support Server
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings