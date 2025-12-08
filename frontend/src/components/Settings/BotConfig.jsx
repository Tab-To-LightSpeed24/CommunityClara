// frontend/src/components/Settings/BotConfig.jsx
import React, { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiEndpoints, apiHelpers } from '../../services/api'
import LoadingSpinner from '../Layout/LoadingSpinner'

const BotConfig = ({ serverId }) => {
  const [config, setConfig] = useState({
    toxicity_threshold: 0.7,
    spam_threshold: 0.7,
    harassment_threshold: 0.7,
    auto_delete: true,
    auto_timeout: false,
    timeout_duration: 300,
    warning_enabled: true,
    escalation_enabled: true
  })

  const [message, setMessage] = useState('')
  const queryClient = useQueryClient()

  // Fetch current server configuration
  const { data: serverData, isLoading, error } = useQuery({
    queryKey: ['server-config', serverId],
    queryFn: () => apiEndpoints.getServerStats(serverId),
    enabled: !!serverId,
    select: (response) => response.data,
    retry: 2
  })

  // Update configuration mutation
  const updateConfigMutation = useMutation({
    mutationFn: (newConfig) => apiEndpoints.updateServerConfig(serverId, newConfig),
    onSuccess: () => {
      setMessage('✅ Bot configuration saved successfully!')
      queryClient.invalidateQueries(['server-config', serverId])
      queryClient.invalidateQueries(['dashboard', serverId])
      setTimeout(() => setMessage(''), 3000)
    },
    onError: (error) => {
      const errorMessage = apiHelpers.formatError(error)
      setMessage(`❌ Failed to save configuration: ${errorMessage}`)
      setTimeout(() => setMessage(''), 5000)
    }
  })

  // Load configuration when server data is available
  useEffect(() => {
    if (serverData) {
      console.log('📊 Loading bot config from server data:', serverData)
      
      const loadedConfig = {
        toxicity_threshold: serverData.toxicity_threshold || 0.7,
        spam_threshold: serverData.spam_threshold || 0.7,
        harassment_threshold: serverData.harassment_threshold || 0.7,
        auto_delete: serverData.auto_delete !== undefined ? serverData.auto_delete : true,
        auto_timeout: serverData.auto_timeout !== undefined ? serverData.auto_timeout : false,
        timeout_duration: serverData.timeout_duration || 300,
        warning_enabled: serverData.warning_enabled !== undefined ? serverData.warning_enabled : true,
        escalation_enabled: serverData.escalation_enabled !== undefined ? serverData.escalation_enabled : true
      }
      
      console.log('🔧 Setting loaded config:', loadedConfig)
      setConfig(loadedConfig)
    }
  }, [serverData])

  const handleConfigChange = (key, value) => {
    setConfig(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleSave = () => {
    if (!serverId) {
      setMessage('❌ Please select a server first.')
      setTimeout(() => setMessage(''), 3000)
      return
    }

    updateConfigMutation.mutate(config)
  }

  const resetToDefaults = () => {
    const defaultConfig = {
      toxicity_threshold: 0.7,
      spam_threshold: 0.7,
      harassment_threshold: 0.7,
      auto_delete: true,
      auto_timeout: false,
      timeout_duration: 300,
      warning_enabled: true,
      escalation_enabled: true
    }
    
    setConfig(defaultConfig)
    setMessage('🔄 Configuration reset to defaults')
    setTimeout(() => setMessage(''), 3000)
  }

  const getThresholdLabel = (value) => {
    if (value <= 0.3) return { text: 'Very Sensitive', color: 'text-red-600', bg: 'bg-red-100' }
    if (value <= 0.5) return { text: 'Sensitive', color: 'text-orange-600', bg: 'bg-orange-100' }
    if (value <= 0.7) return { text: 'Moderate', color: 'text-yellow-600', bg: 'bg-yellow-100' }
    if (value <= 0.9) return { text: 'Lenient', color: 'text-blue-600', bg: 'bg-blue-100' }
    return { text: 'Very Lenient', color: 'text-gray-600', bg: 'bg-gray-100' }
  }

  if (!serverId) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">🤖</span>
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Select a Server</h3>
        <p className="text-gray-600 dark:text-gray-400">Choose a server to configure bot moderation settings.</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
        <span className="ml-3 text-lg text-gray-600 dark:text-gray-400">Loading bot configuration...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">❌</span>
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Error Loading Configuration</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">{apiHelpers.formatError(error)}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="btn btn-primary"
        >
          Retry
        </button>
      </div>
    )
  }

  const thresholdSettings = [
    {
      key: 'toxicity_threshold',
      label: 'Toxicity Detection',
      icon: '🤬',
      description: 'Sensitivity for detecting toxic language and personal attacks',
      color: 'from-red-500 to-pink-500'
    },
    {
      key: 'spam_threshold',
      label: 'Spam Detection',
      icon: '📧',
      description: 'Sensitivity for detecting repetitive and promotional content',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      key: 'harassment_threshold',
      label: 'Harassment Detection',
      icon: '😡',
      description: 'Sensitivity for detecting targeted harassment and bullying',
      color: 'from-orange-500 to-red-500'
    }
  ]

  const actionSettings = [
    {
      key: 'auto_delete',
      label: 'Auto Delete Violations',
      icon: '🗑️',
      description: 'Automatically delete messages that violate community guidelines'
    },
    {
      key: 'auto_timeout',
      label: 'Auto Timeout Users',
      icon: '⏰',
      description: 'Automatically timeout users who violate guidelines'
    },
    {
      key: 'warning_enabled',
      label: 'Send Warnings',
      icon: '⚠️',
      description: 'Send warning messages to users before taking action'
    },
    {
      key: 'escalation_enabled',
      label: 'Progressive Escalation',
      icon: '📈',
      description: 'Increase punishment severity for repeat offenders'
    }
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Bot Configuration</h2>
          <p className="text-gray-600 dark:text-gray-400">Configure AI moderation thresholds and automated actions</p>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={resetToDefaults}
            disabled={updateConfigMutation.isLoading}
            className="btn bg-gray-600 text-white hover:bg-gray-700 disabled:opacity-50"
          >
            🔄 Reset
          </button>
          <button
            onClick={handleSave}
            disabled={updateConfigMutation.isLoading}
            className="btn bg-gradient-to-r from-green-600 to-blue-600 text-white hover:from-green-700 hover:to-blue-700 disabled:opacity-50"
          >
            {updateConfigMutation.isLoading ? (
              <>
                <span className="animate-spin mr-2">⟳</span>
                Saving...
              </>
            ) : (
              <>
                <span className="mr-2">🤖</span>
                Save Configuration
              </>
            )}
          </button>
        </div>
      </div>

      {/* Status Message */}
      {message && (
        <div className={`p-4 rounded-lg ${
          message.includes('✅') ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
          message.includes('❌') ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' :
          'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
        }`}>
          {message}
        </div>
      )}

      {/* Detection Thresholds */}
      <div className="card backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border border-white/20 shadow-xl">
        <div className="p-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-t-lg">
          <h3 className="text-lg font-bold text-white">🎯 Detection Thresholds</h3>
          <p className="text-blue-100 text-sm">Lower values = more sensitive detection</p>
        </div>

        <div className="p-6 space-y-6">
          {thresholdSettings.map((setting) => {
            const thresholdLabel = getThresholdLabel(config[setting.key])
            
            return (
              <div key={setting.key} className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="flex items-center space-x-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <span className="text-2xl">{setting.icon}</span>
                    <span>{setting.label}</span>
                  </label>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${thresholdLabel.bg} ${thresholdLabel.color}`}>
                    {thresholdLabel.text}
                  </div>
                </div>

                <div className="space-y-2">
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.1"
                    value={config[setting.key]}
                    onChange={(e) => handleConfigChange(setting.key, parseFloat(e.target.value))}
                    className={`w-full h-2 rounded-lg appearance-none cursor-pointer bg-gradient-to-r ${setting.color}`}
                  />
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>Very Sensitive (0.1)</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {(config[setting.key] * 100).toFixed(0)}%
                    </span>
                    <span>Very Lenient (1.0)</span>
                  </div>
                </div>

                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {setting.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Automated Actions */}
      <div className="card backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border border-white/20 shadow-xl">
        <div className="p-4 bg-gradient-to-r from-green-600 to-teal-600 rounded-t-lg">
          <h3 className="text-lg font-bold text-white">⚡ Automated Actions</h3>
          <p className="text-green-100 text-sm">Configure how the bot responds to violations</p>
        </div>

        <div className="p-6 space-y-6">
          {actionSettings.map((setting) => (
            <div key={setting.key} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{setting.icon}</span>
                <div>
                  <div className="font-medium text-gray-900 dark:text-gray-100">{setting.label}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{setting.description}</div>
                </div>
              </div>
              <button
                onClick={() => handleConfigChange(setting.key, !config[setting.key])}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  config[setting.key] ? 'bg-green-600' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    config[setting.key] ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}

          {/* Timeout Duration (only show if auto_timeout is enabled) */}
          {config.auto_timeout && (
            <div className="space-y-3 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <label className="flex items-center space-x-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                <span className="text-2xl">⏱️</span>
                <span>Timeout Duration</span>
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="range"
                  min="60"
                  max="3600"
                  step="60"
                  value={config.timeout_duration}
                  onChange={(e) => handleConfigChange('timeout_duration', parseInt(e.target.value))}
                  className="flex-1 h-2 rounded-lg appearance-none cursor-pointer bg-gradient-to-r from-orange-400 to-red-500"
                />
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100 min-w-[80px]">
                  {Math.floor(config.timeout_duration / 60)} min{Math.floor(config.timeout_duration / 60) !== 1 ? 's' : ''}
                </div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>1 minute</span>
                <span>60 minutes</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Current Configuration Summary */}
      <div className="card backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border border-white/20 shadow-xl">
        <div className="p-4 bg-gradient-to-r from-gray-700 to-gray-800 rounded-t-lg">
          <h3 className="text-lg font-bold text-white">📋 Configuration Summary</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Detection Sensitivity */}
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                <span className="mr-2">🎯</span>
                Detection Sensitivity
              </h4>
              <div className="space-y-2 text-sm">
                {thresholdSettings.map((setting) => {
                  const label = getThresholdLabel(config[setting.key])
                  return (
                    <div key={setting.key} className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">{setting.label}:</span>
                      <span className={`font-medium ${label.color}`}>
                        {(config[setting.key] * 100).toFixed(0)}%
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Automated Actions */}
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                <span className="mr-2">⚡</span>
                Automated Actions
              </h4>
              <div className="space-y-2 text-sm">
                {actionSettings.map((setting) => (
                  <div key={setting.key} className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">{setting.label}:</span>
                    <span className={`font-medium ${config[setting.key] ? 'text-green-600' : 'text-red-600'}`}>
                      {config[setting.key] ? '✅ On' : '❌ Off'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Additional Settings */}
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                <span className="mr-2">⚙️</span>
                Additional Settings
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Timeout Duration:</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {Math.floor(config.timeout_duration / 60)} min{Math.floor(config.timeout_duration / 60) !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Overall Sensitivity:</span>
                  <span className="font-medium text-blue-600">
                    {(() => {
                      const avg = (config.toxicity_threshold + config.spam_threshold + config.harassment_threshold) / 4
                      return getThresholdLabel(avg).text
                    })()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Help Section */}
      <div className="card backdrop-blur-sm bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
        <div className="p-6">
          <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center">
            <span className="mr-2">💡</span>
            Configuration Tips
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800 dark:text-blue-200">
            <div>
              <strong>🎯 Threshold Guidelines:</strong>
              <ul className="mt-1 space-y-1 text-xs">
                <li>• 10-30%: Very strict, catches everything</li>
                <li>• 40-60%: Balanced, good for most servers</li>
                <li>• 70-90%: Lenient, only obvious violations</li>
              </ul>
            </div>
            <div>
              <strong>⚡ Action Recommendations:</strong>
              <ul className="mt-1 space-y-1 text-xs">
                <li>• Enable warnings for new users</li>
                <li>• Use auto-delete for spam/NSFW</li>
                <li>• Progressive escalation prevents repeats</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BotConfig