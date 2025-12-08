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
  // Update profile state when user data changes
  React.useEffect(() => {
    if (user) {
      setProfile(prev => ({
        ...prev,
        username: user.username || '',
        display_name: user.display_name || user.username || '',
        email: user.email || '',
        theme: user.theme || 'system',
        timezone: user.timezone || 'UTC',
        language: user.language || 'en'
      }))
    }
  }, [user])
  const handleSignInSuccess = (userData) => {
  console.log('✅ Sign-in successful:', userData)
  // AuthContext will handle the user state update
}

const handleSignInError = (error) => {
  console.error('❌ Sign-in failed:', error)
  // You can show an error message here
}

// Loading state
if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        <span className="ml-3 text-lg text-gray-600 dark:text-gray-400">Loading profile...</span>
      </div>
    )
  }

  // Not authenticated - show sign-in
  if (!isAuthenticated) {
    return (
      <div className="max-w-lg mx-auto mt-12">
        <div className="card backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border border-white/20 shadow-2xl text-center">
          <div className="mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl">👤</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Sign In Required
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Please sign in with Google to access your profile settings
            </p>
          </div>
          
          <GoogleSignIn 
            onSuccess={handleSignInSuccess}
            onError={handleSignInError}
          />
        </div>
      </div>
    )
  }


  const handleSave = async () => {
    try {
      setSaving(true)
      // Update profile through AuthContext
      const profileData = {
        username: profile.username,
        display_name: profile.display_name,
        theme: profile.theme,
        timezone: profile.timezone,
        language: profile.language,
        notification_preferences: JSON.stringify({
          notifications: profile.notifications,
          privacy: profile.privacy
        })
      }

      
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
    
      const result = await updateProfile(profileData)
      
      if (result.success) {
        setIsEditing(false)
        console.log('✅ Profile saved successfully')
        // You can add a toast notification here if you have a notification system
      } else {
        console.error('❌ Failed to save profile:', result.error)
        // You can add an error toast here
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


  const handleLogout = async () => {
    await logout()
    // No need to manually redirect, AuthContext will handle the state
  }


  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="card backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border border-white/20 shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Avatar */}
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
              {user?.avatar_url ? (
                <img 
                  src={user.avatar_url}
                  alt="Profile"
                  className="w-full h-full rounded-full"
                />
              ) : (
                <span className="text-white text-2xl font-bold">
                  {user?.display_name?.charAt(0)?.toUpperCase() || user?.username?.charAt(0)?.toUpperCase() || '?'}
                </span>
              )}
            </div>
            
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {user?.display_name || user?.username}
              </h2>
              <p className="text-gray-600 dark:text-gray-300">{user?.email}</p>
              <div className="flex items-center space-x-2 mt-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {user?.is_verified ? '✅ Verified' : '⚠️ Unverified'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="btn bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700"
            >
              {isEditing ? '❌ Cancel' : '✏️ Edit'}
            </button>
            
            {isEditing && (
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <span className="animate-spin mr-2">⟳</span>
                    Saving...
                  </>
                ) : (
                  '✅ Save Changes'
                )}
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
      </div>
      

      {/* Editable Profile Fields */}
      {isEditing && (
        <div className="card backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border border-white/20 shadow-2xl">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
            <span className="text-xl mr-2">✏️</span>
            Edit Profile Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Username
              </label>
              <input
                type="text"
                value={profile.username}
                onChange={(e) => setProfile(prev => ({...prev, username: e.target.value}))}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Display Name
              </label>
              <input
                type="text"
                value={profile.display_name}
                onChange={(e) => setProfile(prev => ({...prev, display_name: e.target.value}))}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Theme
              </label>
              <select
                value={profile.theme}
                onChange={(e) => setProfile(prev => ({...prev, theme: e.target.value}))}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                <option value="system">System</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Timezone
              </label>
              <select
                value={profile.timezone}
                onChange={(e) => setProfile(prev => ({...prev, timezone: e.target.value}))}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                <option value="UTC">UTC</option>
                <option value="America/New_York">Eastern Time</option>
                <option value="America/Chicago">Central Time</option>
                <option value="America/Denver">Mountain Time</option>
                <option value="America/Los_Angeles">Pacific Time</option>
                <option value="Europe/London">London</option>
                <option value="Europe/Paris">Paris</option>
                <option value="Asia/Tokyo">Tokyo</option>
                <option value="Asia/Kolkata">India</option>
              </select>
            </div>
          </div>
        </div>
      )}


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