// frontend/src/components/Settings/BotConfig.jsx
import React, { useState, useEffect } from 'react'
import { apiEndpoints } from '../../services/api'

const BotConfig = ({ serverId }) => {
  const [config, setConfig] = useState({
    toxicity_threshold: 0.7,
    nsfw_threshold: 0.7,
    auto_delete: true,
    auto_timeout: false,
    timeout_duration: 300
  })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)

  // Load current server configuration when serverId changes
  useEffect(() => {
    const loadCurrentConfig = async () => {
      if (!serverId) {
        setLoading(false)
        return
      }
      
      setLoading(true)
      
      try {
        console.log('📡 Loading current config for server:', serverId)
        const response = await apiEndpoints.getServerStats(serverId)
        const serverData = response.data
        
        console.log('📊 Loaded server data:', serverData)
        
        const currentConfig = {
          toxicity_threshold: serverData.toxicity_threshold || 0.7,
          nsfw_threshold: serverData.nsfw_threshold || 0.7,
          auto_delete: serverData.auto_delete !== undefined ? serverData.auto_delete : true,
          auto_timeout: serverData.auto_timeout !== undefined ? serverData.auto_timeout : false,
          timeout_duration: serverData.timeout_duration || 300
        }
        
        console.log('🔧 Setting config from server:', currentConfig)
        setConfig(currentConfig)
        
      } catch (error) {
        console.error('❌ Failed to load server config:', error)
        setMessage('⚠️ Failed to load current configuration. Using defaults.')
        setTimeout(() => setMessage(''), 3000)
      } finally {
        setLoading(false)
      }
    }
    
    loadCurrentConfig()
  }, [serverId])

  // Debug logging for config changes
  useEffect(() => {
    console.log('🔧 BotConfig Debug - Current config state:', config)
    console.log('🔧 BotConfig Debug - ServerId:', serverId)
  }, [config, serverId])

  // Dynamic configuration sections (recalculated when config changes)
  const configSections = [
    {
      title: '🛡️ Content Moderation',
      gradient: 'from-red-500 to-pink-500',
      settings: [
        {
          key: 'toxicity_threshold',
          label: 'Toxicity Detection Sensitivity',
          type: 'range',
          min: 0.1,
          max: 1.0,
          step: 0.1,
          description: 'Lower values = more sensitive detection',
          icon: '🤬'
        },
        {
          key: 'nsfw_threshold',
          label: 'NSFW Content Sensitivity',
          type: 'range',
          min: 0.1,
          max: 1.0,
          step: 0.1,
          description: 'Threshold for inappropriate content detection',
          icon: '🔞'
        }
      ]
    },
    {
      title: '⚡ Auto Actions',
      gradient: 'from-blue-500 to-purple-500',
      settings: [
        {
          key: 'auto_delete',
          label: 'Auto Delete Violations',
          type: 'toggle',
          description: 'Automatically remove flagged messages',
          icon: '🗑️'
        },
        {
          key: 'auto_timeout',
          label: 'Auto Timeout Users',
          type: 'toggle',
          description: 'Temporarily restrict users who violate rules',
          icon: '⏰'
        },
        {
          key: 'timeout_duration',
          label: 'Timeout Duration (seconds)',
          type: 'number',
          min: 60,
          max: 86400,
          description: 'How long users are restricted (60s - 24h)',
          icon: '⏱️',
          disabled: !config.auto_timeout  // This now updates properly when config changes
        }
      ]
    }
  ]

  const handleConfigChange = (key, value) => {
    console.log('🔄 Config change:', { key, value, oldValue: config[key] })
    setConfig(prev => {
      const newConfig = { ...prev, [key]: value }
      console.log('🔄 New config state:', newConfig)
      return newConfig
    })
  }

  const handleSave = async () => {
    if (!serverId) {
      setMessage('❌ No server selected. Please select a server first.')
      setTimeout(() => setMessage(''), 3000)
      return
    }

    setSaving(true)
    setMessage('')

    try {
      console.log('🔧 Saving bot config:', { serverId, config })
      
      const response = await apiEndpoints.updateServerConfig(serverId, config)
      
      console.log('✅ Config save response:', response)
      
      setMessage('✅ Configuration saved successfully!')
      setTimeout(() => setMessage(''), 3000)
      
    } catch (error) {
      console.error('❌ Config save error:', error)
      
      const errorMessage = error.response?.data?.detail || error.message || 'Unknown error'
      setMessage(`❌ Failed to save configuration: ${errorMessage}`)
      setTimeout(() => setMessage(''), 5000)
      
    } finally {
      setSaving(false)
    }
  }

  const resetToDefaults = () => {
    const defaultConfig = {
      toxicity_threshold: 0.7,
      nsfw_threshold: 0.7,
      auto_delete: true,
      auto_timeout: false,
      timeout_duration: 300
    }
    
    console.log('🔄 Resetting to defaults:', defaultConfig)
    setConfig(defaultConfig)
    setMessage('🔄 Reset to default values')
    setTimeout(() => setMessage(''), 3000)
  }

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="card backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border border-white/20 shadow-2xl">
          <div className="animate-pulse">
            <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded mb-4"></div>
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Debug Section (remove in production) */}
      <div className="card backdrop-blur-sm bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 shadow-xl">
        <h3 className="text-lg font-bold text-yellow-800 dark:text-yellow-300 mb-4">🐛 Debug Info</h3>
        <div className="text-sm space-y-2">
          <div><strong>ServerId:</strong> {serverId || 'NOT SET'}</div>
          <div><strong>Config State:</strong></div>
          <pre className="bg-yellow-100 dark:bg-yellow-900/30 p-2 rounded text-xs overflow-x-auto">
            {JSON.stringify(config, null, 2)}
          </pre>
          <div><strong>Auto Delete:</strong> {String(config.auto_delete)} ({typeof config.auto_delete})</div>
          <div><strong>Auto Timeout:</strong> {String(config.auto_timeout)} ({typeof config.auto_timeout})</div>
          <div><strong>Timeout Duration:</strong> {config.timeout_duration} ({typeof config.timeout_duration})</div>
          <div><strong>Timeout Field Disabled:</strong> {String(!config.auto_timeout)}</div>
        </div>
      </div>

      {/* Header */}
      <div className="card backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border border-white/20 shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              🤖 Bot Configuration
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Customize AI moderation settings for optimal community protection
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={resetToDefaults}
              className="btn bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-300"
            >
              🔄 Reset
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !serverId}
              className="btn bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-purple-500/25 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? '💾 Saving...' : '💾 Save Changes'}
            </button>
          </div>
        </div>

        {message && (
          <div className={`mt-4 p-3 rounded-lg ${
            message.includes('✅') ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
            message.includes('❌') ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300' :
            'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
          } animate-fade-in`}>
            {message}
          </div>
        )}
      </div>

      {/* Configuration Sections */}
      {configSections.map((section, sectionIndex) => (
        <div key={sectionIndex} className="card backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border border-white/20 shadow-2xl hover:shadow-purple-500/10 transition-all duration-300">
          <div className="flex items-center space-x-3 mb-6">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${section.gradient} flex items-center justify-center shadow-lg`}>
              <span className="text-white text-xl">{section.title.split(' ')[0]}</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {section.title}
            </h3>
          </div>

          <div className="space-y-6">
            {section.settings.map((setting, settingIndex) => (
              <div key={settingIndex} className={`p-4 rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/30 hover:bg-gray-100/50 dark:hover:bg-gray-700/30 transition-all duration-300 ${setting.disabled ? 'opacity-50' : ''}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{setting.icon}</span>
                    <div>
                      <label className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {setting.label}
                      </label>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {setting.description}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  {setting.type === 'range' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Low Sensitivity
                        </span>
                        <span className="text-lg font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                          {(config[setting.key] * 100).toFixed(0)}%
                        </span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          High Sensitivity
                        </span>
                      </div>
                      <div className="relative">
                        <input
                          type="range"
                          min={setting.min}
                          max={setting.max}
                          step={setting.step}
                          value={config[setting.key]}
                          onChange={(e) => handleConfigChange(setting.key, parseFloat(e.target.value))}
                          disabled={setting.disabled}
                          className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                          style={{
                            background: `linear-gradient(to right, #8B5CF6 0%, #3B82F6 ${config[setting.key] * 100}%, #e5e7eb ${config[setting.key] * 100}%, #e5e7eb 100%)`
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {setting.type === 'toggle' && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          config[setting.key] 
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' 
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                        }`}>
                          {config[setting.key] ? 'Enabled' : 'Disabled'}
                        </span>
                        
                        {/* Debug info for toggles */}
                        <span className="text-xs text-gray-400">
                          (Debug: {setting.key}={String(config[setting.key])})
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          console.log(`🔘 Toggle clicked: ${setting.key} from ${config[setting.key]} to ${!config[setting.key]}`)
                          handleConfigChange(setting.key, !config[setting.key])
                        }}
                        disabled={setting.disabled}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                          config[setting.key] 
                            ? 'bg-gradient-to-r from-purple-600 to-blue-600' 
                            : 'bg-gray-300 dark:bg-gray-600'
                        } ${setting.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform bg-white rounded-full shadow-lg transition-transform duration-300 ${
                            config[setting.key] ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  )}

                  {setting.type === 'number' && (
                    <div className="flex items-center space-x-4">
                      <input
                        type="number"
                        min={setting.min}
                        max={setting.max}
                        value={config[setting.key]}
                        onChange={(e) => handleConfigChange(setting.key, parseInt(e.target.value))}
                        disabled={setting.disabled}
                        className={`input w-32 text-center font-bold bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-200 dark:border-purple-700 focus:border-purple-500 focus:ring-purple-500 ${
                          setting.disabled ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      />
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        seconds ({Math.floor(config[setting.key] / 60)} minutes)
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* AI Model Status */}
      <div className="card backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border border-white/20 shadow-2xl">
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          🧠 AI Model Status
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-700">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
              <div>
                <div className="font-semibold text-green-800 dark:text-green-300">Hugging Face AI</div>
                <div className="text-sm text-green-600 dark:text-green-400">Connected & Operational</div>
              </div>
            </div>
          </div>
          
          <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-700">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse shadow-lg shadow-blue-400/50"></div>
              <div>
                <div className="font-semibold text-blue-800 dark:text-blue-300">Community Learning</div>
                <div className="text-sm text-blue-600 dark:text-blue-400">Adapting to Server Culture</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BotConfig