// frontend/src/components/Layout/Navbar.jsx
import React, { useState, useRef, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useQuery } from '@tanstack/react-query'
import { apiEndpoints } from '../../services/api'

const Navbar = ({ currentPage, setCurrentPage }) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const profileMenuRef = useRef(null)
  const { user, isAuthenticated, logout } = useAuth()

  // Initialize dark mode state
  useEffect(() => {
    const isDark = localStorage.getItem('theme') === 'dark'
    setIsDarkMode(isDark)
  }, [])

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const toggleDarkMode = () => {
    const newTheme = isDarkMode ? 'light' : 'dark'
    setIsDarkMode(!isDarkMode)
    localStorage.setItem('theme', newTheme)
    
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    
    console.log(`Switched to ${newTheme} mode`)
  }

  const handleLogout = async () => {
    await logout()
    setShowProfileMenu(false)
    setCurrentPage('home')
  }

  const navigation = [
    { name: 'Home', page: 'home', icon: '🏠' },
    { name: 'Dashboard', page: 'dashboard', icon: '📊', protected: true },
    { name: 'Settings', page: 'settings', icon: '⚙️', protected: true },
    { name: 'Profile', page: 'profile', icon: '👤', protected: true },
  ]

  const handleNavigation = (page) => {
    setCurrentPage(page)
    setShowProfileMenu(false)
  }

  return (
    <nav className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-40 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            {/* Logo */}
            <button 
              onClick={() => handleNavigation('home')} 
              className="flex items-center space-x-3 group"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200">
                <span className="text-white font-bold text-lg">🛡️</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-cyan-600 bg-clip-text text-transparent">
                  CommunityClara
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 -mt-1">
                  AI Moderation Platform
                </p>
              </div>
            </button>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navigation.map((item) => {
              // Hide protected routes if not authenticated
              if (item.protected && !isAuthenticated) return null

              return (
                <button
                  key={item.page}
                  onClick={() => handleNavigation(item.page)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                    currentPage === item.page
                      ? 'bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/50 dark:to-blue-900/50 text-purple-700 dark:text-purple-300 shadow-md'
                      : 'text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-gray-100/50 dark:hover:bg-gray-800/50'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.name}</span>
                </button>
              )
            })}
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-3">
            {/* Dark mode toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-200 rounded-lg hover:bg-gray-100/50 dark:hover:bg-gray-800/50"
              title={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
            >
              <span className="text-lg">{isDarkMode ? '☀️' : '🌙'}</span>
            </button>
            {/* Notification Bell */}
            {isAuthenticated && (
              <div className="relative">
                <button
                  onClick={() => setCurrentPage('notifications')}
                  className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-200 rounded-lg hover:bg-gray-100/50 dark:hover:bg-gray-800/50"
                  title="Notifications"
                >
                  <span className="text-lg">🔔</span>
                  {/* Notification Badge */}
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                    3
                  </span>
                </button>
              </div>
            )}

            {/* User menu */}
            {isAuthenticated ? (
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-colors duration-200"
                >
                  {/* User Avatar */}
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center shadow-md">
                    {user?.avatar ? (
                      <img 
                        src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`}
                        alt="Profile"
                        className="w-full h-full rounded-full"
                      />
                    ) : (
                      <span className="text-white text-sm font-bold">
                        {user?.username?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    )}
                  </div>
                  
                  {/* Username (hidden on small screens) */}
                  <div className="hidden sm:block text-left">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {user?.username || 'User'}
                    </div>
                  </div>
                  
                  {/* Dropdown arrow */}
                  <span className={`text-gray-400 transition-transform duration-200 ${showProfileMenu ? 'rotate-180' : ''}`}>
                    ▼
                  </span>
                </button>

                {/* Dropdown Menu */}
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-xl shadow-2xl py-2 z-50">
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-gray-200/50 dark:border-gray-700/50">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                          {user?.avatar ? (
                            <img 
                              src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`}
                              alt="Profile"
                              className="w-full h-full rounded-full"
                            />
                          ) : (
                            <span className="text-white font-bold">
                              {user?.username?.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-gray-100">
                            {user?.username}#{user?.discriminator || '0000'}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {user?.email || 'No email'}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Menu Items */}
                    <div className="py-2">
                      <button
                        onClick={() => handleNavigation('profile')}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors duration-200 flex items-center space-x-3"
                      >
                        <span className="text-lg">👤</span>
                        <span className="text-gray-700 dark:text-gray-200">View Profile</span>
                      </button>
                      
                      <button
                        onClick={() => handleNavigation('settings')}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors duration-200 flex items-center space-x-3"
                      >
                        <span className="text-lg">⚙️</span>
                        <span className="text-gray-700 dark:text-gray-200">Settings</span>
                      </button>
                      
                      <button
                        onClick={() => handleNavigation('dashboard')}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors duration-200 flex items-center space-x-3"
                      >
                        <span className="text-lg">📊</span>
                        <span className="text-gray-700 dark:text-gray-200">Dashboard</span>
                      </button>
                      
                      <hr className="my-2 border-gray-200/50 dark:border-gray-700/50" />
                      
                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-3 text-left hover:bg-red-50/50 dark:hover:bg-red-900/20 transition-colors duration-200 flex items-center space-x-3 text-red-600 dark:text-red-400"
                      >
                        <span className="text-lg">🚪</span>
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => handleNavigation('login')}
                className="btn bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-purple-500/25 transform hover:scale-105 transition-all duration-200"
              >
                <span className="mr-2">🔐</span>
                Login
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isAuthenticated && (
        <div className="md:hidden border-t border-gray-200/50 dark:border-gray-700/50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm">
          <div className="px-4 py-2 space-y-1">
            {navigation.map((item) => {
              if (item.protected && !isAuthenticated) return null

              return (
                <button
                  key={item.page}
                  onClick={() => handleNavigation(item.page)}
                  className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                    currentPage === item.page
                      ? 'bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/50 dark:to-blue-900/50 text-purple-700 dark:text-purple-300'
                      : 'text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-gray-100/50 dark:hover:bg-gray-800/50'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.name}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 via-blue-600/5 to-cyan-600/5 opacity-50 pointer-events-none"></div>
    </nav>
  )
}

export default Navbar