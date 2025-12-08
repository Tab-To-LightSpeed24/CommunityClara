// frontend/src/components/Layout/Navbar.jsx
import React, { useState, useRef, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useQuery } from '@tanstack/react-query'
import { apiEndpoints } from '../../services/api'
import { motion, AnimatePresence } from 'framer-motion'

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
  ]

  const handleNavigation = (page) => {
    setCurrentPage(page)
    setShowProfileMenu(false)
  }
  const { data: notificationData } = useQuery({
    queryKey: ['notifications'], // Same key as NotificationCenter
    queryFn: () => apiEndpoints.getUserNotifications(),
    select: (response) => response.data,
    refetchInterval: 30000,
    enabled: isAuthenticated
  })


  const unreadCount = notificationData?.unread_count || 0

  return (
    <div className="fixed top-4 left-0 right-0 z-50 flex justify-center px-4">
      <nav className="w-full max-w-6xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-md rounded-2xl border border-white/20 dark:border-gray-700/50 shadow-2xl transition-all duration-300">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Brand */}
            <div className="flex items-center flex-shrink-0">
              <button
                onClick={() => handleNavigation('home')}
                className="flex items-center space-x-3 group outline-none"
              >
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform duration-300">
                    <span className="text-white font-bold text-lg">🛡️</span>
                  </div>
                  <div className="absolute inset-0 bg-white/20 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <div className="hidden sm:block text-left">
                  <h1 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-cyan-600 bg-clip-text text-transparent">
                    CommunityClara
                  </h1>
                </div>
              </button>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1 bg-gray-100/50 dark:bg-gray-800/50 p-1.5 rounded-xl border border-gray-200/50 dark:border-gray-700/30">
              {navigation.map((item) => {
                if (item.protected && !isAuthenticated) return null
                const isActive = currentPage === item.page

                return (
                  <button
                    key={item.page}
                    onClick={() => handleNavigation(item.page)}
                    className={`relative px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 outline-none flex items-center space-x-2 ${isActive ? 'text-purple-700 dark:text-purple-300' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                      }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="nav-pill"
                        className="absolute inset-0 bg-white dark:bg-gray-700 rounded-lg shadow-sm"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10">{item.icon}</span>
                    <span className="relative z-10">{item.name}</span>
                  </button>
                )
              })}
            </div>

            {/* Right side actions */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Dark mode toggle */}
              <button
                onClick={toggleDarkMode}
                className="p-2 text-gray-500 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400 transition-colors rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <div className="relative w-6 h-6 flex items-center justify-center overflow-hidden">
                  <motion.div
                    initial={false}
                    animate={{ rotate: isDarkMode ? 180 : 0, scale: isDarkMode ? 0 : 1 }}
                    transition={{ duration: 0.3 }}
                    className="absolute"
                  >
                    ☀️
                  </motion.div>
                  <motion.div
                    initial={false}
                    animate={{ rotate: isDarkMode ? 0 : -180, scale: isDarkMode ? 1 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="absolute"
                  >
                    🌙
                  </motion.div>
                </div>
              </button>

              {/* Notification Bell */}
              {isAuthenticated && (
                <div className="relative">
                  <button
                    onClick={() => setCurrentPage('notifications')}
                    className="p-2 text-gray-500 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400 transition-colors rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 relative"
                  >
                    <span className="text-xl">🔔</span>
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white dark:ring-gray-900 animate-pulse" />
                    )}
                  </button>
                </div>
              )}

              {/* User menu */}
              {isAuthenticated ? (
                <div className="relative" ref={profileMenuRef}>
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center space-x-2 pl-2 pr-1 py-1 rounded-full border border-gray-200 dark:border-gray-700 hover:border-purple-500/50 dark:hover:border-purple-500/50 transition-colors bg-white/50 dark:bg-gray-800/50"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 p-0.5">
                      <div className="w-full h-full rounded-full bg-white dark:bg-gray-900 flex items-center justify-center overflow-hidden">
                        {user?.avatar ? (
                          <img
                            src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`}
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-xs font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                            {user?.username?.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>

                  <AnimatePresence>
                    {showProfileMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden ring-1 ring-black/5"
                      >
                        <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50">
                          <p className="font-semibold text-gray-900 dark:text-gray-100">{user?.username}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                        </div>
                        <div className="p-2">
                          <button
                            onClick={() => handleNavigation('profile')}
                            className="w-full px-3 py-2 text-sm text-left rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors flex items-center space-x-2"
                          >
                            <span>👤</span>
                            <span>Profile</span>
                          </button>
                          <div className="h-px bg-gray-100 dark:bg-gray-700 my-1" />
                          <button
                            onClick={handleLogout}
                            className="w-full px-3 py-2 text-sm text-left rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center space-x-2"
                          >
                            <span>🚪</span>
                            <span>Sign out</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <button
                  onClick={() => handleNavigation('login')}
                  className="px-5 py-2 rounded-xl bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 font-semibold text-sm hover:shadow-lg hover:scale-105 transition-all duration-200"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isAuthenticated && (
            <div className="md:hidden border-t border-gray-100 dark:border-gray-700/50">
              <div className="flex justify-around p-2">
                {navigation.map((item) => {
                  if (item.protected && !isAuthenticated) return null
                  const isActive = currentPage === item.page
                  return (
                    <button
                      key={item.page}
                      onClick={() => handleNavigation(item.page)}
                      className={`flex flex-col items-center p-2 rounded-xl transition-colors ${isActive ? 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20' : 'text-gray-500 dark:text-gray-400'
                        }`}
                    >
                      <span className="text-lg">{item.icon}</span>
                      <span className="text-[10px] font-medium mt-0.5">{item.name}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </AnimatePresence>
      </nav>
    </div>
  )
}

export default Navbar