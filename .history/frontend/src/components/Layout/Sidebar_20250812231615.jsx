// frontend/src/components/Layout/Sidebar.jsx
import React from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useNotifications } from '../../contexts/NotificationContext'

const Sidebar = ({ onClose }) => {
  const location = useLocation()
  const { user, refreshServers } = useAuth()
  const { showSuccess } = useNotifications()

  const menuItems = [
    {
      id: 'dashboard',
      name: 'Dashboard',
      path: '/dashboard',
      icon: '📊',
      description: 'Server overview and metrics',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'settings',
      name: 'Settings',
      path: '/settings',
      icon: '⚙️',
      description: 'Configure bot behavior',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      id: 'analytics',
      name: 'Analytics',
      path: '/analytics',
      icon: '📈',
      description: 'Detailed insights and trends',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      id: 'profile',
      name: 'Profile',
      path: '/profile',
      icon: '👤',
      description: 'Manage your account',
      gradient: 'from-orange-500 to-red-500'
    }
  ]

  const quickActions = [
    { name: 'Refresh', icon: '🔄', color: 'text-blue-500', action: 'refresh' },
    { name: 'Export', icon: '📤', color: 'text-green-500', action: 'export' },
    { name: 'Support', icon: '💬', color: 'text-purple-500', action: 'support' },
    { name: 'Docs', icon: '📖', color: 'text-orange-500', action: 'docs' }
  ]

  const handleQuickAction = async (action) => {
    switch (action) {
      case 'refresh':
        await refreshServers()
        showSuccess('Data refreshed successfully')
        break
      case 'export':
        showSuccess('Export feature coming soon!')
        break
      case 'support':
        window.open('https://discord.gg/safespace-ai', '_blank')
        break
      case 'docs':
        window.open('https://docs.safespace-ai.com', '_blank')
        break
      default:
        break
    }
    
    if (onClose) onClose()
  }

  const isActivePath = (path) => {
    return location.pathname === path || (path !== '/' && location.pathname.startsWith(path))
  }

  return (
    <>
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl 
        border-r border-gray-200/50 dark:border-gray-700/50 shadow-2xl transform transition-transform duration-300 ease-in-out
        ${onClose ? 'translate-x-0' : 'translate-x-0'}
      `}>

        {/* Header */}
        <div className="p-6 border-b border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold">🛡️</span>
              </div>
              <div>
                <h2 className="font-bold bg-gradient-to-r from-purple-600 to-cyan-600 bg-clip-text text-transparent">
                  CommunityClara
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">v2.0.0</p>
              </div>
            </div>
            
            {onClose && (
              <button 
                onClick={onClose}
                className="lg:hidden p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* User Info */}
        {user && (
          <div className="p-4 border-b border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-purple-50/50 to-blue-50/50 dark:from-purple-900/20 dark:to-blue-900/20">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center shadow-md">
                {user.avatar ? (
                  <img 
                    src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`}
                    alt="Profile"
                    className="w-full h-full rounded-full"
                  />
                ) : (
                  <span className="text-white font-bold text-sm">
                    {user.username?.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 dark:text-gray-100 truncate">
                  {user.username}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {user.servers?.length || 0} server{(user.servers?.length || 0) !== 1 ? 's' : ''}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Menu */}
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.id}
              to={item.path}
              onClick={onClose}
              className={`w-full group flex items-center space-x-4 px-4 py-3 rounded-xl transition-all duration-300 transform hover:scale-[1.02] ${
                isActivePath(item.path)
                  ? 'bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 shadow-lg shadow-purple-500/10'
                  : 'hover:bg-gray-100/50 dark:hover:bg-gray-800/50'
              }`}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 ${
                isActivePath(item.path)
                  ? `bg-gradient-to-r ${item.gradient} shadow-lg`
                  : 'bg-gray-100 dark:bg-gray-800 group-hover:bg-gray-200 dark:group-hover:bg-gray-700'
              }`}>
                <span className={`text-lg ${
                  isActivePath(item.path) ? 'text-white' : 'text-gray-600 dark:text-gray-300'
                }`}>
                  {item.icon}
                </span>
              </div>
              
              <div className="flex-1 text-left">
                <div className={`font-medium transition-colors duration-300 ${
                  isActivePath(item.path)
                    ? 'text-purple-600 dark:text-purple-400'
                    : 'text-gray-700 dark:text-gray-200 group-hover:text-purple-600 dark:group-hover:text-purple-400'
                }`}>
                  {item.name}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {item.description}
                </div>
              </div>

              {isActivePath(item.path) && (
                <div className="w-1 h-8 bg-gradient-to-b from-purple-500 to-blue-500 rounded-full shadow-lg"></div>
              )}
            </Link>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="p-4 border-t border-gray-200/50 dark:border-gray-700/50">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-2">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={() => handleQuickAction(action.action)}
                className="flex flex-col items-center space-y-1 p-3 rounded-lg bg-gray-50/50 dark:bg-gray-800/50 hover:bg-gray-100/50 dark:hover:bg-gray-700/50 transition-all duration-300 transform hover:scale-105 group"
              >
                <span className={`text-lg ${action.color} group-hover:scale-110 transition-transform duration-300`}>
                  {action.icon}
                </span>
                <span className="text-xs text-gray-600 dark:text-gray-300 font-medium">
                  {action.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Status Footer */}
        <div className="p-4 border-t border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
              <span className="text-sm text-gray-600 dark:text-gray-300">All Systems Operational</span>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>

        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 via-blue-600/5 to-cyan-600/5 pointer-events-none"></div>
      </div>
    </>
  )
}

export default Sidebar