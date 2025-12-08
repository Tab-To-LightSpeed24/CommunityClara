// frontend/src/components/Layout/Navbar.jsx
import React, { useState, useEffect } from 'react'
import { apiEndpoints } from '../../services/api'

const Navbar = ({ currentPage, setCurrentPage }) => {
  const [isHealthy, setIsHealthy] = useState(true)
  const [notifications, setNotifications] = useState([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [serversData, setServersData] = useState(null)

  // Check API health periodically
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await apiEndpoints.health()
        setIsHealthy(response.data.status === 'healthy')
      } catch (error) {
        console.warn('Backend not available:', error.message)
        setIsHealthy(false)
      }
    }

    checkHealth()
    const interval = setInterval(checkHealth, 30000)
    return () => clearInterval(interval)
  }, [])

  // Fetch servers data for notifications
  useEffect(() => {
    const fetchServers = async () => {
      try {
        const response = await apiEndpoints.getServers()
        setServersData(response.data)
      } catch (error) {
        console.error('Failed to fetch servers for notifications:', error)
      }
    }

    fetchServers()
  }, [])

  // Fetch real notifications from violations
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        if (!serversData?.servers?.length) return

        console.log('🔔 Fetching real notifications from violations...')

        const serverPromises = serversData.servers.map(async (server) => {
          try {
            const response = await apiEndpoints.getServerViolations(server.id, 3) // Get last 3 violations
            return response.data.map(violation => ({
              id: `${server.id}-${violation.id}`,
              type: getNotificationType(violation.violation_type),
              message: `${violation.violation_type.replace('_', ' ').toUpperCase()} detected in ${server.name}`,
              time: getTimeAgo(violation.created_at),
              serverId: server.id,
              serverName: server.name,
              username: violation.username || 'Unknown User',
              confidence: Math.round(violation.confidence_score * 100)
            }))
          } catch (error) {
            console.error(`Failed to fetch violations for ${server.name}:`, error)
            return []
          }
        })

        const allNotifications = await Promise.all(serverPromises)
        const flatNotifications = allNotifications.flat()
          .sort((a, b) => new Date(b.time) - new Date(a.time)) // Sort by newest first
          .slice(0, 5) // Show last 5
        
        setNotifications(flatNotifications)
        console.log('✅ Loaded real notifications:', flatNotifications)
        
      } catch (error) {
        console.error('Failed to fetch notifications:', error)
        // Fallback to empty array
        setNotifications([])
      }
    }

    fetchNotifications()
    
    // Refresh notifications every 30 seconds for real-time updates
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [serversData])

  // Helper function to determine notification type
  const getNotificationType = (violationType) => {
    switch (violationType) {
      case 'toxicity': return 'warning'
      case 'nsfw': return 'warning'
      case 'hate_speech': return 'warning'
      case 'threats': return 'warning'
      case 'harassment': return 'warning'
      default: return 'info'
    }
  }

  // Helper function to get time ago
  const getTimeAgo = (dateString) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInMinutes = Math.floor((now - date) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}h ago`
    
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}d ago`
  }

  // Get notification icon
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'warning': return '⚠️'
      case 'success': return '✅'
      case 'info': return 'ℹ️'
      default: return '🔔'
    }
  }

  // Get notification color
  const getNotificationColor = (type) => {
    switch (type) {
      case 'warning': return 'text-yellow-600 dark:text-yellow-400'
      case 'success': return 'text-green-600 dark:text-green-400'
      case 'info': return 'text-blue-600 dark:text-blue-400'
      default: return 'text-gray-600 dark:text-gray-400'
    }
  }

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode
    setDarkMode(newDarkMode)
    localStorage.setItem('darkMode', newDarkMode.toString())
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border-b border-white/20 dark:border-gray-700/30 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setCurrentPage('home')}
              className="relative group cursor-pointer"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-purple-500/25 transition-all duration-300 transform group-hover:scale-110">
                <span className="text-white font-bold text-lg">🛡️</span>
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
              </div>
            </button>
            
            <div>
              <button 
                onClick={() => setCurrentPage('home')}
                className="text-xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent hover:from-purple-700 hover:via-blue-700 hover:to-cyan-700 transition-all duration-200"
              >
                CommunityClara
              </button>
              <p className="text-sm text-gray-500 dark:text-gray-400">Your Community's Gentle Guardian</p>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <button 
              onClick={() => setCurrentPage('dashboard')}
              className={`font-medium transition-colors duration-200 relative group ${
                currentPage === 'dashboard' 
                  ? 'text-purple-600 dark:text-purple-400' 
                  : 'text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400'
              }`}
            >
              Dashboard
              <span className={`absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-purple-600 to-blue-600 transition-all duration-300 ${
                currentPage === 'dashboard' ? 'w-full' : 'w-0 group-hover:w-full'
              }`}></span>
            </button>
            
            <button 
              onClick={() => setCurrentPage('settings')}
              className={`font-medium transition-colors duration-200 relative group ${
                currentPage === 'settings' 
                  ? 'text-purple-600 dark:text-purple-400' 
                  : 'text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400'
              }`}
            >
              Settings
              <span className={`absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-purple-600 to-blue-600 transition-all duration-300 ${
                currentPage === 'settings' ? 'w-full' : 'w-0 group-hover:w-full'
              }`}></span>
            </button>
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {/* API Health Status */}
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full shadow-lg ${isHealthy ? 'bg-green-400 animate-pulse shadow-green-400/50' : 'bg-red-400 animate-pulse shadow-red-400/50'}`}></div>
              <span className="text-sm text-gray-600 dark:text-gray-300 hidden sm:block">
                {isHealthy ? 'Connected' : 'Offline'}
              </span>
            </div>

            {/* Real-Time Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-200 group"
              >
                <span className="text-xl">🔔</span>
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full flex items-center justify-center shadow-lg animate-bounce">
                    {notifications.length}
                  </span>
                )}
                <div className="absolute -inset-2 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>

              {/* Real-Time Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-96 backdrop-blur-xl bg-white/90 dark:bg-gray-900/90 border border-white/20 dark:border-gray-700/30 rounded-xl shadow-2xl z-50 animate-fade-in">
                  <div className="p-4 border-b border-gray-200/50 dark:border-gray-700/50">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                      🔴 Live Violations ({notifications.length})
                    </h3>
                  </div>
                  
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((notification) => (
                        <div key={notification.id} className="p-4 border-b border-gray-100/50 dark:border-gray-700/30 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors duration-200 cursor-pointer"
                             onClick={() => setCurrentPage('dashboard')}>
                          <div className="flex items-start space-x-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              notification.type === 'warning' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                              notification.type === 'success' ? 'bg-green-100 dark:bg-green-900/30' : 
                              'bg-blue-100 dark:bg-blue-900/30'
                            }`}>
                              <span className="text-lg">{getNotificationIcon(notification.type)}</span>
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <p className={`text-sm font-medium ${getNotificationColor(notification.type)}`}>
                                  {notification.serverName}
                                </p>
                                <span className="text-xs text-gray-400 dark:text-gray-500">
                                  {notification.time}
                                </span>
                              </div>
                              
                              <p className="text-sm text-gray-900 dark:text-gray-100 mb-1">
                                {notification.message}
                              </p>
                              
                              <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                                <span>User: {notification.username}</span>
                                <span>•</span>
                                <span>Confidence: {notification.confidence}%</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center">
                        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                          <span className="text-2xl">✅</span>
                        </div>
                        <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">All Clear!</h4>
                        <p className="text-gray-600 dark:text-gray-300">No recent violations detected.</p>
                      </div>
                    )}
                  </div>
                  
                  {notifications.length > 0 && (
                    <div className="p-4">
                      <button 
                        onClick={() => {
                          setCurrentPage('dashboard')
                          setShowNotifications(false)
                        }}
                        className="w-full text-center text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium"
                      >
                        View All Violations
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-200 group relative"
            >
              <span className="text-xl">{darkMode ? '☀️' : '🌙'}</span>
              <div className="absolute -inset-2 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>

            {/* Profile Menu */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center space-x-3 p-2 rounded-xl hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-all duration-200 group"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg hover:shadow-purple-500/25 transition-all duration-300 transform group-hover:scale-110 cursor-pointer">
                  <span className="text-white text-sm font-bold">👤</span>
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200 hidden sm:block">
                  Profile
                </span>
              </button>

              {/* Profile Dropdown */}
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-64 backdrop-blur-xl bg-white/90 dark:bg-gray-900/90 border border-white/20 dark:border-gray-700/30 rounded-xl shadow-2xl z-50 animate-fade-in">
                  <div className="p-4 border-b border-gray-200/50 dark:border-gray-700/50">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">👤</span>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-gray-100">TestUser#1234</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">test@example.com</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="py-2">
                    <button
                      onClick={() => {
                        setCurrentPage('profile')
                        setShowProfileMenu(false)
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors duration-200 flex items-center space-x-3"
                    >
                      <span className="text-lg">👤</span>
                      <span className="text-gray-700 dark:text-gray-200">View Profile</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        setCurrentPage('settings')
                        setShowProfileMenu(false)
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors duration-200 flex items-center space-x-3"
                    >
                      <span className="text-lg">⚙️</span>
                      <span className="text-gray-700 dark:text-gray-200">Settings</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        setCurrentPage('dashboard')
                        setShowProfileMenu(false)
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors duration-200 flex items-center space-x-3"
                    >
                      <span className="text-lg">📊</span>
                      <span className="text-gray-700 dark:text-gray-200">Dashboard</span>
                    </button>
                    
                    <hr className="my-2 border-gray-200/50 dark:border-gray-700/50" />
                    
                    <button
                      onClick={() => {
                        // Add logout functionality
                        console.log('Logging out...')
                        setShowProfileMenu(false)
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-red-50/50 dark:hover:bg-red-900/20 transition-colors duration-200 flex items-center space-x-3 text-red-600 dark:text-red-400"
                    >
                      <span className="text-lg">🚪</span>
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button 
              onClick={() => {/* Mobile menu toggle if needed */}}
              className="md:hidden p-2 text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-200"
            >
              <span className="text-xl">☰</span>
            </button>
          </div>
        </div>
      </div>

      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 via-blue-600/5 to-cyan-600/5 opacity-50 pointer-events-none"></div>
    </nav>
  )
}

export default Navbar