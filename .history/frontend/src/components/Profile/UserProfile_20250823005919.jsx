import React, { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import GoogleSignIn from '../Auth/GoogleSignIn'
import { apiEndpoints } from '../../services/api'

const UserProfile = () => {
  const { user, logout, updateProfile, isAuthenticated, isLoading } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState({
    username: user?.username || '',
    display_name: user?.display_name || user?.username || '',
    email: user?.email || '',
    theme: user?.theme || 'system',
    timezone: user?.timezone || 'UTC',
    language: user?.language || 'en',
    notifications: {
      violations: true,
      dailyReports: true,
      systemUpdates: false
    },
    privacy: {
      showOnlineStatus: true,
      allowDirectMessages: true
    }
  })


  const handleSave = async () => {
    try {
      setSaving(true)
      
      // Save notification preferences
      const notificationResponse = await fetch('/api/v1/user/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notifications: profile.notifications,
          privacy: profile.privacy
        })
      })
      
      if (!notificationResponse.ok) {
        throw new Error('Failed to save preferences')
      }
      
      setIsEditing(false)
      
      // Show success notification
      if (typeof showSuccess === 'function') {
        showSuccess('Profile settings saved successfully!')
      }
      
    } catch (error) {
      console.error('Error saving profile:', error)
      if (typeof showError === 'function') {
        showError('Failed to save profile settings')
      }
    } finally {
      setSaving(false)
    }
  }


  const handleLogout = () => {
    logout()
    window.location.href = '/'
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="card backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border border-white/20 shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Avatar */}
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
              {user?.avatar ? (
                <img 
                  src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`}
                  alt="Profile"
                  className="w-full h-full rounded-full"
                />
              ) : (
                <span className="text-white text-2xl font-bold">
                  {user?.username?.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {user?.username}#{user?.discriminator}
              </h2>
              <p className="text-gray-600 dark:text-gray-300">{user?.email}</p>
              <div className="flex items-center space-x-2 mt-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-500 dark:text-gray-400">Online</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="btn bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700"
            >
              {isEditing ? '💾 Save' : '✏️ Edit'}
            </button>
            
            {isEditing && (
              <button
                onClick={handleSave}
                className="btn bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700"
              >
                ✅ Save Changes
              </button>
            )}
            
            <button
              onClick={handleLogout}
              className="btn bg-gradient-to-r from-red-600 to-pink-600 text-white hover:from-red-700 hover:to-pink-700"
            >
              🚪 Logout
            </button>
          </div>
        </div>

        {/* Connected Servers */}
        <div className="mt-6 pt-6 border-t border-gray-200/50 dark:border-gray-700/50">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
            <span className="text-xl mr-2">🏠</span>
            Connected Servers ({user?.servers?.length || 0})
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {user?.servers?.map((server) => (
              <div key={server.id} className="p-4 rounded-xl bg-gray-50/50 dark:bg-gray-800/30 border border-gray-200/50 dark:border-gray-700/50 hover:bg-gray-100/50 dark:hover:bg-gray-700/30 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        {server.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        {server.name}
                      </div>
                      <div className="text-xs text-purple-600 dark:text-purple-400">
                        {server.owner ? '👑 Owner' : '👤 Member'}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        ID: {server.id}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center space-x-2 mb-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">Active</span>
                    </div>
                    {server.health_score && (
                      <div className="text-xs text-gray-600 dark:text-gray-300">
                        Health: {Math.round(server.health_score * 100)}%
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Notification Settings */}
        <div className="card backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border border-white/20 shadow-2xl">
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            🔔 Notifications
          </h3>
          
          <div className="space-y-4">
            {Object.entries(profile.notifications).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900 dark:text-gray-100 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Get notified about {key.toLowerCase()}
                  </div>
                </div>
                <button
                  onClick={() => setProfile(prev => ({
                    ...prev,
                    notifications: { ...prev.notifications, [key]: !value }
                  }))}
                  disabled={!isEditing}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                    value 
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600' 
                      : 'bg-gray-300 dark:bg-gray-600'
                  } ${!isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform bg-white rounded-full shadow-lg transition-transform duration-300 ${
                      value ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Privacy Settings */}
        <div className="card backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border border-white/20 shadow-2xl">
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            🔒 Privacy
          </h3>
          
          <div className="space-y-4">
            {Object.entries(profile.privacy).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900 dark:text-gray-100 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Control your {key.toLowerCase()} preferences
                  </div>
                </div>
                <button
                  onClick={() => setProfile(prev => ({
                    ...prev,
                    privacy: { ...prev.privacy, [key]: !value }
                  }))}
                  disabled={!isEditing}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                    value 
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600' 
                      : 'bg-gray-300 dark:bg-gray-600'
                  } ${!isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform bg-white rounded-full shadow-lg transition-transform duration-300 ${
                      value ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserProfile