// frontend/src/components/Settings/ServerSettings.jsx
import React, { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiEndpoints, apiHelpers } from '../../services/api'
import LoadingSpinner from '../Layout/LoadingSpinner'
import { useAuth } from '../../contexts/AuthContext'

const ServerSettings = ({ serverId }) => {
  const [settings, setSettings] = useState({
    server_name: '',
    welcome_message: '',
    moderation_channels: [],
    exempt_roles: [],
    custom_keywords: '',
    violation_log_channel: '',
    escalation_threshold: 3,
    learning_enabled: true,
    privacy_mode: true,
    nsfw_allowed: false,
    nsfw_auto_delete: true,
    nsfw_auto_timeout: false,
    nsfw_auto_kick: false,
    nsfw_auto_ban: false
  })


  const [message, setMessage] = useState('')
  const queryClient = useQueryClient()
  const { refreshServerNames } = useAuth()
  // Fetch server settings with fallback to server stats
  const { data: serverSettings, isLoading, error } = useQuery({
    queryKey: ['server-settings', serverId],
    queryFn: async () => {
      try {
        // Try to get dedicated settings first
        const response = await apiEndpoints.getServerSettings(serverId)
        return response.data
      } catch (error) {
        if (error.response?.status === 404) {
          // Fallback to server stats if settings endpoint doesn't exist
          console.log('⚠️ Settings endpoint not found, falling back to server stats')
          const statsResponse = await apiEndpoints.getServerStats(serverId)
          return {
            server_name: statsResponse.data.server_name || '',
            welcome_message: statsResponse.data.welcome_message || '',
            moderation_channels: [],
            exempt_roles: [],
            custom_keywords: '',
            violation_log_channel: '',
            escalation_threshold: 3,
            learning_enabled: true,
            privacy_mode: true,
            nsfw_allowed: false,
            nsfw_auto_delete: true,
            nsfw_auto_timeout: false,
            nsfw_auto_kick: false,
            nsfw_auto_ban: false
          }
        }
        throw error
      }
    },
    enabled: !!serverId,
    retry: 1
  })

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: (newSettings) => apiEndpoints.updateServerSettings(serverId, newSettings),
    onSuccess: () => {
      setMessage('✅ Server settings saved successfully!')
      queryClient.invalidateQueries(['server-settings', serverId])
      queryClient.invalidateQueries(['dashboard', serverId])
      setTimeout(() => setMessage(''), 3000)
    },
    onError: (error) => {
      const errorMessage = apiHelpers.formatError(error)
      setMessage(`❌ Failed to save settings: ${errorMessage}`)
      setTimeout(() => setMessage(''), 5000)
    }
  })

  // Load settings when data is available
  useEffect(() => {
    if (serverSettings) {
      console.log('📊 Loading server settings:', serverSettings)
      setSettings(prev => ({
        ...prev,
        ...serverSettings
      }))
    }
  }, [serverSettings])

  const handleInputChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleArrayChange = (key, value) => {
    // Convert comma-separated string to array
    const arrayValue = value.split(',').map(item => item.trim()).filter(item => item)
    setSettings(prev => ({
      ...prev,
      [key]: arrayValue
    }))
  }

  const handleSave = async () => {
    if (!serverId) {
      setMessage('❌ Please select a server first.')
      setTimeout(() => setMessage(''), 3000)
      return
    }

    try {
      // Check if server name changed
      const serverNameChanged = settings.server_name &&
        serverSettings?.server_name !== settings.server_name

      // Save general settings first
      await updateSettingsMutation.mutateAsync(settings)

      // If server name changed, update it separately and refresh auth context
      if (serverNameChanged) {
        try {
          await apiEndpoints.updateServerName(serverId, settings.server_name)

          // Refresh server names in auth context
          if (refreshServerNames) {
            await refreshServerNames()
          }

          setMessage('✅ Server settings and name updated successfully!')
        } catch (nameError) {
          console.error('Failed to update server name:', nameError)
          setMessage('⚠️ Settings saved but server name update failed')
        }
      } else {
        setMessage('✅ Server settings saved successfully!')
      }

      // Clear message after 3 seconds
      setTimeout(() => setMessage(''), 3000)

      // Invalidate queries to refresh data
      queryClient.invalidateQueries(['server-settings', serverId])
      queryClient.invalidateQueries(['dashboard', serverId])
      queryClient.invalidateQueries(['servers'])

    } catch (error) {
      const errorMessage = apiHelpers.formatError(error)
      setMessage(`❌ Failed to save settings: ${errorMessage}`)
      setTimeout(() => setMessage(''), 5000)
    }
  }

  const resetToDefaults = () => {
    const defaultSettings = {
      server_name: serverSettings?.server_name || '',
      welcome_message: '',
      moderation_channels: [],
      exempt_roles: [],
      custom_keywords: '',
      violation_log_channel: '',
      escalation_threshold: 3,
      learning_enabled: true,
      privacy_mode: true
    }

    setSettings(defaultSettings)
    setMessage('🔄 Settings reset to defaults')
    setTimeout(() => setMessage(''), 3000)
  }

  if (!serverId) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">⚙️</span>
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Select a Server</h3>
        <p className="text-gray-600 dark:text-gray-400">Choose a server from the dropdown to configure its settings.</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
        <span className="ml-3 text-lg text-gray-600 dark:text-gray-400">Loading server settings...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">❌</span>
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Error Loading Settings</h3>
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
          description: 'Message sent to new members (use {{user}} and {{server}} placeholders)',
          icon: '👋'
        }
      ]
    },
    {
      title: '🔞 NSFW Content Settings',
      gradient: 'from-pink-600 to-rose-600',
      settings: [
        {
          key: 'nsfw_allowed',
          label: 'Allow NSFW Content',
          type: 'toggle',
          description: 'If enabled, NSFW images will NOT count as violations',
          icon: '🔞'
        },
        // Only show these if NSFW is NOT allowed (Denied)
        ...(!settings.nsfw_allowed ? [
          {
            key: 'nsfw_auto_delete',
            label: 'Auto Delete Image',
            type: 'toggle',
            description: 'Instantly remove detected NSFW images',
            icon: '🗑️'
          },
          {
            key: 'nsfw_auto_timeout',
            label: 'Auto Timeout User',
            type: 'toggle',
            description: 'Timeout user for posting NSFW content',
            icon: '⏰'
          },
          {
            key: 'nsfw_auto_kick',
            label: 'Auto Kick User',
            type: 'toggle',
            description: 'Kick user immediately for NSFW content (Soft Ban)',
            icon: '👢'
          },
          {
            key: 'nsfw_auto_ban',
            label: 'Auto Ban User',
            type: 'toggle',
            description: 'Ban user immediately for NSFW content (Strict)',
            icon: '🚫'
          }
        ] : []),
      ]
    },
    {
      title: '🛡️ Moderation Configuration',
      gradient: 'from-purple-500 to-pink-500',
      settings: [
        {
          key: 'moderation_channels',
          label: 'Moderation Channels',
          type: 'text',
          placeholder: 'general, announcements, chat',
          description: 'Channels to monitor (comma-separated)',
          icon: '📢',
          isArray: true
        },
        {
          key: 'exempt_roles',
          label: 'Exempt Roles',
          type: 'text',
          placeholder: 'Admin, Moderator, VIP',
          description: 'Roles that bypass moderation (comma-separated)',
          icon: '👑',
          isArray: true
        },
        {
          key: 'violation_log_channel',
          label: 'Violation Log Channel',
          type: 'text',
          placeholder: 'mod-logs',
          description: 'Channel for violation notifications',
          icon: '📋'
        }
      ]
    },
    {
      title: '🎯 Advanced Settings',
      gradient: 'from-green-500 to-teal-500',
      settings: [
        {
          key: 'custom_keywords',
          label: 'Custom Keywords',
          type: 'textarea',
          placeholder: 'word1, phrase2, custom term',
          description: 'Additional words/phrases to monitor (comma-separated)',
          icon: '🔍'
        },
        {
          key: 'escalation_threshold',
          label: 'Escalation Threshold',
          type: 'number',
          placeholder: '3',
          description: 'Number of violations before escalation',
          icon: '📈',
          min: 1,
          max: 10
        }
      ]
    },
    {
      title: '🔒 Privacy & Learning',
      gradient: 'from-orange-500 to-red-500',
      settings: [
        {
          key: 'learning_enabled',
          label: 'Community Learning',
          type: 'toggle',
          description: 'Allow AI to learn from your feedback',
          icon: '🧠'
        },
        {
          key: 'privacy_mode',
          label: 'Privacy Mode',
          type: 'toggle',
          description: 'Enhanced privacy protection for user data',
          icon: '🔐'
        }
      ]
    }
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Server Settings</h2>
          <p className="text-gray-600 dark:text-gray-400">Configure your server's moderation and privacy settings</p>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={resetToDefaults}
            disabled={updateSettingsMutation.isLoading}
            className="btn bg-gray-600 text-white hover:bg-gray-700 disabled:opacity-50"
          >
            🔄 Reset
          </button>
          <button
            onClick={handleSave}
            disabled={updateSettingsMutation.isLoading}
            className="btn bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 disabled:opacity-50"
          >
            {updateSettingsMutation.isLoading ? (
              <>
                <span className="animate-spin mr-2">⟳</span>
                Saving...
              </>
            ) : (
              <>
                <span className="mr-2">💾</span>
                Save Settings
              </>
            )}
          </button>
        </div>
      </div>

      {/* Status Message */}
      {message && (
        <div className={`p-4 rounded-lg ${message.includes('✅') ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
          message.includes('❌') ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' :
            'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
          }`}>
          {message}
        </div>
      )}

      {/* Settings Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {settingSections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="card backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border border-white/20 shadow-xl">
            {/* Section Header */}
            <div className={`p-4 bg-gradient-to-r ${section.gradient} rounded-t-lg`}>
              <h3 className="text-lg font-bold text-white">{section.title}</h3>
            </div>

            {/* Section Content */}
            <div className="p-6 space-y-6">
              {section.settings.map((setting) => (
                <div key={setting.key} className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <span className="text-lg">{setting.icon}</span>
                    <span>{setting.label}</span>
                  </label>

                  {setting.type === 'text' && (
                    <input
                      type="text"
                      value={setting.isArray ? (settings[setting.key] || []).join(', ') : (settings[setting.key] || '')}
                      onChange={(e) => setting.isArray ?
                        handleArrayChange(setting.key, e.target.value) :
                        handleInputChange(setting.key, e.target.value)
                      }
                      placeholder={setting.placeholder}
                      className="input w-full"
                    />
                  )}

                  {setting.type === 'textarea' && (
                    <textarea
                      value={settings[setting.key] || ''}
                      onChange={(e) => handleInputChange(setting.key, e.target.value)}
                      placeholder={setting.placeholder}
                      rows={3}
                      className="input w-full resize-none"
                    />
                  )}

                  {setting.type === 'number' && (
                    <input
                      type="number"
                      value={settings[setting.key] || ''}
                      onChange={(e) => handleInputChange(setting.key, parseInt(e.target.value) || 0)}
                      placeholder={setting.placeholder}
                      min={setting.min}
                      max={setting.max}
                      className="input w-full"
                    />
                  )}

                  {setting.type === 'toggle' && (
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {settings[setting.key] ? 'Enabled' : 'Disabled'}
                      </span>
                      <button
                        onClick={() => handleInputChange(setting.key, !settings[setting.key])}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings[setting.key] ? 'bg-green-600' : 'bg-gray-300 dark:bg-gray-600'
                          }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings[setting.key] ? 'translate-x-6' : 'translate-x-1'
                            }`}
                        />
                      </button>
                    </div>
                  )}

                  {setting.description && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {setting.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Current Configuration Summary */}
      <div className="card backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border border-white/20 shadow-xl">
        <div className="p-4 bg-gradient-to-r from-gray-700 to-gray-800 rounded-t-lg">
          <h3 className="text-lg font-bold text-white">📋 Current Configuration</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-600 dark:text-gray-400">Server Name:</span>
              <div className="text-gray-900 dark:text-gray-100">{settings.server_name || 'Not set'}</div>
            </div>
            <div>
              <span className="font-medium text-gray-600 dark:text-gray-400">Moderation Channels:</span>
              <div className="text-gray-900 dark:text-gray-100">
                {(settings.moderation_channels || []).length > 0 ?
                  settings.moderation_channels.join(', ') : 'All channels'
                }
              </div>
            </div>
            <div>
              <span className="font-medium text-gray-600 dark:text-gray-400">Escalation Threshold:</span>
              <div className="text-gray-900 dark:text-gray-100">{settings.escalation_threshold || 3} violations</div>
            </div>
            <div>
              <span className="font-medium text-gray-600 dark:text-gray-400">Learning:</span>
              <div className={`${settings.learning_enabled ? 'text-green-600' : 'text-red-600'}`}>
                {settings.learning_enabled ? '✅ Enabled' : '❌ Disabled'}
              </div>
            </div>
            <div>
              <span className="font-medium text-gray-600 dark:text-gray-400">Privacy Mode:</span>
              <div className={`${settings.privacy_mode ? 'text-green-600' : 'text-red-600'}`}>
                {settings.privacy_mode ? '🔐 Enabled' : '🔓 Disabled'}
              </div>
            </div>
            <div>
              <span className="font-medium text-gray-600 dark:text-gray-400">Custom Keywords:</span>
              <div className="text-gray-900 dark:text-gray-100">
                {settings.custom_keywords ? `${settings.custom_keywords.split(',').length} keywords` : 'None'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ServerSettings