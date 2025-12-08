// frontend/src/components/Settings/ServerSettings.jsx
import React, { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { apiEndpoints } from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'

const ServerSettings = ({ serverId }) => {
  const [settings, setSettings] = useState({
    server_name: '',
    moderation_channels: [],
    exempt_roles: [],
    custom_keywords: '',
    welcome_message: '',
    violation_log_channel: '',
    escalation_threshold: 3,
    learning_enabled: true,
    privacy_mode: true
  })

  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const { refreshServerNames } = useAuth()

  // Replace the useEffect that loads server data:
  useEffect(() => {
    // Replace the loadServerData function in useEffect
    const loadServerData = async () => {
      if (!serverId) {
        setLoading(false)
        return
      }
      
      setLoading(true)
      
      try {
        console.log('📡 Loading server settings for:', serverId)
        const response = await apiEndpoints.getServerSettings(serverId)
        const serverSettings = response.data
        
        console.log('📊 Loaded server settings:', serverSettings)
        
        setSettings(prev => ({
          ...prev,
          ...serverSettings
        }))
        
      } catch (error) {
        console.error('❌ Failed to load server settings:', error)
        setMessage('⚠️ Failed to load current settings. Using defaults.')
        setTimeout(() => setMessage(''), 3000)
      } finally {
        setLoading(false)
      }
    }
    
    loadServerData()
  }, [serverId])

  // Debug logging
  useEffect(() => {
    console.log('🏠 ServerSettings Debug - Current settings:', settings)
    console.log('🏠 ServerSettings Debug - ServerId:', serverId)
  }, [settings, serverId])

  const settingSections = [
    {
      title: '🏠 Server Information',
      gradient: 'from-blue-500 to-cyan-500',
      settings: [
        {
          key: 'server_name',
          label: 'Server Display Name',
          type: 'text',
          placeholder: 'Enter server name...',
          description: 'How your server appears in the dashboard',
          icon: '🏷️'
        },
        {
          key: 'welcome_message',
          label: 'Welcome Message Template',
          type: 'textarea',
          placeholder: 'Welcome {{user}} to {{server}}! Please read our rules.',
          description: 'Message sent to new members (supports {{user}} and {{server}} variables)',
          icon: '👋'
        }
      ]
    },
    {
      title: '🛡️ Moderation Setup',
      gradient: 'from-purple-500 to-pink-500',
      settings: [
        {
          key: 'moderation_channels',
          label: 'Monitored Channels',
          type: 'multiselect',
          options: ['#general', '#testing', '#memes', '#gaming', '#off-topic', '#serious'],
          description: 'Channels where AI moderation is active',
          icon: '📺'
        },
        {
          key: 'violation_log_channel',
          label: 'Violation Log Channel',
          type: 'select',
          options: ['#mod-log', '#admin-alerts', '#safespace-logs', '#testing', 'Create New Channel'],
          description: 'Where moderation actions are logged',
          icon: '📋'
        },
        {
          key: 'escalation_threshold',
          label: 'Escalation Threshold',
          type: 'number',
          min: 1,
          max: 10,
          description: 'Number of violations before escalating to human moderators',
          icon: '📈'
        }
      ]
    },
    {
      title: '👥 User Management',
      gradient: 'from-green-500 to-emerald-500',
      settings: [
        {
          key: 'exempt_roles',
          label: 'Exempt Roles',
          type: 'multiselect',
          options: ['@Admin', '@Moderator', '@VIP', '@Trusted', '@Booster', '@Owner'],
          description: 'Roles that bypass AI moderation',
          icon: '🛡️'
        },
        {
          key: 'custom_keywords',
          label: 'Custom Filter Keywords',
          type: 'textarea',
          placeholder: 'Enter keywords separated by commas...',
          description: 'Additional words to monitor (comma-separated)',
          icon: '🔍'
        }
      ]
    },
    {
      title: '🧠 AI Learning',
      gradient: 'from-indigo-500 to-purple-500',
      settings: [
        {
          key: 'learning_enabled',
          label: 'Community Learning',
          type: 'toggle',
          description: 'Allow AI to adapt to your server culture over time',
          icon: '🧠'
        },
        {
          key: 'privacy_mode',
          label: 'Privacy Mode',
          type: 'toggle',
          description: 'Enable maximum privacy protection (recommended)',
          icon: '🔒'
        }
      ]
    }
  ]

  const handleSettingChange = (key, value) => {
    console.log('🔄 Setting change:', { key, value, oldValue: settings[key] })
    setSettings(prev => {
      const newSettings = { ...prev, [key]: value }
      console.log('🔄 New settings state:', newSettings)
      return newSettings
    })
  }

  // Replace the handleSave function
  const handleSave = async () => {
    if (!serverId) {
      setMessage('❌ No server selected. Please select a server first.')
      setTimeout(() => setMessage(''), 3000)
      return
    }

    setSaving(true)
    setMessage('')

    try {
      console.log('🏠 Saving server settings:', { serverId, settings })
      
      // Update server name if it changed
      const currentServerData = await apiEndpoints.getServerStats(serverId)
      const currentName = currentServerData.data.server_name
      
      if (settings.server_name && settings.server_name !== currentName) {
        console.log('🏷️ Updating server name from', currentName, 'to', settings.server_name)
        await apiEndpoints.updateServerName(serverId, settings.server_name)
        
        // Refresh server names in the context
        if (refreshServerNames) {
          await refreshServerNames()
        }
      }
      
      // Update other server settings
      await apiEndpoints.updateServerSettings(serverId, settings)
      
      setMessage('✅ Server settings saved successfully!')
      setTimeout(() => setMessage(''), 3000)
      
    } catch (error) {
      console.error('❌ Server settings save error:', error)
      
      const errorMessage = error.response?.data?.detail || error.message || 'Unknown error'
      setMessage(`❌ Failed to save settings: ${errorMessage}`)
      setTimeout(() => setMessage(''), 5000)
      
    } finally {
      setSaving(false)
    }
  }

  const resetToDefaults = async () => {
    try {
      // Load fresh data from server
      const response = await apiEndpoints.getServerStats(serverId)
      const serverData = response.data
      
      const defaultSettings = {
        server_name: serverData.server_name || '',
        moderation_channels: [],
        exempt_roles: [],
        custom_keywords: '',
        welcome_message: '',
        violation_log_channel: '',
        escalation_threshold: 3,
        learning_enabled: true,
        privacy_mode: true
      }
      
      console.log('🔄 Resetting to defaults:', defaultSettings)
      setSettings(defaultSettings)
      setMessage('🔄 Settings reset to defaults')
      setTimeout(() => setMessage(''), 3000)
      
    } catch (error) {
      console.error('❌ Failed to reset settings:', error)
      setMessage('❌ Failed to reset settings')
      setTimeout(() => setMessage(''), 3000)
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="card backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border border-white/20 shadow-2xl">
          <div className="animate-pulse">
            <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded mb-4"></div>
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
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
      {/* Debug Section */}
      <div className="card backdrop-blur-sm bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 shadow-xl">
        <h3 className="text-lg font-bold text-blue-800 dark:text-blue-300 mb-4">🐛 Debug Info</h3>
        <div className="text-sm space-y-2">
          <div><strong>ServerId:</strong> {serverId || 'NOT SET'}</div>
          <div><strong>Current Server Name:</strong> "{settings.server_name}"</div>
          <div><strong>Settings State:</strong></div>
          <pre className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded text-xs overflow-x-auto">
            {JSON.stringify(settings, null, 2)}
          </pre>
        </div>
      </div>

      {/* Header */}
      <div className="card backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border border-white/20 shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              🏠 Server Settings
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Configure your server-specific moderation preferences and behavior
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
              className="btn bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-blue-500/25 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? '💾 Saving...' : '💾 Save Settings'}
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

      {/* Settings Sections */}
      {settingSections.map((section, sectionIndex) => (
        <div key={sectionIndex} className="card backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border border-white/20 shadow-2xl hover:shadow-blue-500/10 transition-all duration-300">
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
              <div key={settingIndex} className="p-4 rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/30 hover:bg-gray-100/50 dark:hover:bg-gray-700/30 transition-all duration-300">
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
                  {setting.type === 'text' && (
                    <input
                      type="text"
                      value={settings[setting.key]}
                      onChange={(e) => handleSettingChange(setting.key, e.target.value)}
                      placeholder={setting.placeholder}
                      className="input w-full bg-white/50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500"
                    />
                  )}

                  {setting.type === 'textarea' && (
                    <textarea
                      value={settings[setting.key]}
                      onChange={(e) => handleSettingChange(setting.key, e.target.value)}
                      placeholder={setting.placeholder}
                      rows={3}
                      className="input w-full bg-white/50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500"
                    />
                  )}

                  {setting.type === 'select' && (
                    <select
                      value={settings[setting.key]}
                      onChange={(e) => handleSettingChange(setting.key, e.target.value)}
                      className="input w-full bg-white/50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="">Select an option...</option>
                      {setting.options?.map((option, index) => (
                        <option key={index} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  )}

                  {setting.type === 'multiselect' && (
                    <div className="space-y-2">
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        Selected: {settings[setting.key].length} items
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {setting.options?.map((option, index) => (
                          <label key={index} className="flex items-center space-x-2 p-2 rounded-lg bg-white/50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-700 transition-colors duration-200 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={settings[setting.key].includes(option)}
                              onChange={(e) => {
                                const currentValues = settings[setting.key]
                                const newValues = e.target.checked
                                  ? [...currentValues, option]
                                  : currentValues.filter(v => v !== option)
                                handleSettingChange(setting.key, newValues)
                              }}
                              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              {option}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {setting.type === 'number' && (
                    <div className="flex items-center space-x-4">
                      <input
                        type="number"
                        min={setting.min}
                        max={setting.max}
                        value={settings[setting.key]}
                        onChange={(e) => handleSettingChange(setting.key, parseInt(e.target.value))}
                        className="input w-32 text-center font-bold bg-white/50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500"
                      />
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        violations before escalation
                      </div>
                    </div>
                  )}

                  {setting.type === 'toggle' && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          settings[setting.key] 
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' 
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                        }`}>
                          {settings[setting.key] ? 'Enabled' : 'Disabled'}
                        </span>
                        
                        {/* Debug info for toggles */}
                        <span className="text-xs text-gray-400">
                          (Debug: {setting.key}={String(settings[setting.key])})
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          console.log(`🔘 Toggle clicked: ${setting.key} from ${settings[setting.key]} to ${!settings[setting.key]}`)
                          handleSettingChange(setting.key, !settings[setting.key])
                        }}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                          settings[setting.key] 
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600' 
                            : 'bg-gray-300 dark:bg-gray-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform bg-white rounded-full shadow-lg transition-transform duration-300 ${
                            settings[setting.key] ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Server Status Information */}
      <div className="card backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border border-white/20 shadow-2xl">
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          📊 Server Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200 dark:border-blue-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white text-lg">🏠</span>
              </div>
              <div>
                <div className="font-semibold text-blue-800 dark:text-blue-300">Server ID</div>
                <div className="text-sm text-blue-600 dark:text-blue-400 font-mono">
                  {serverId || 'Not selected'}
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white text-lg">👥</span>
              </div>
              <div>
                <div className="font-semibold text-green-800 dark:text-green-300">Bot Status</div>
                <div className="text-sm text-green-600 dark:text-green-400">
                  {serverId ? 'Connected' : 'Not Connected'}
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white text-lg">🛡️</span>
              </div>
              <div>
                <div className="font-semibold text-purple-800 dark:text-purple-300">Protection Level</div>
                <div className="text-sm text-purple-600 dark:text-purple-400">
                  {settings.privacy_mode ? 'High' : 'Standard'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Configuration Guide */}
      <div className="card backdrop-blur-sm bg-gradient-to-r from-indigo-50/50 to-purple-50/50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-200 dark:border-indigo-700 shadow-xl">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
            <span className="text-white text-xl">💡</span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
              Configuration Tips
            </h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <li className="flex items-center space-x-2">
                <span className="text-green-500">✓</span>
                <span>Server name changes are saved to database and persist on refresh</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-green-500">✓</span>
                <span>Enable Privacy Mode for maximum data protection</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-green-500">✓</span>
                <span>Set escalation threshold based on your community size</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-green-500">✓</span>
                <span>Exempt trusted roles to reduce false positives</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-green-500">✓</span>
                <span>Use custom keywords for server-specific content</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ServerSettings