// frontend/src/components/Layout/Sidebar.jsx
import React, { useState } from 'react'

const Sidebar = ({ isOpen, onClose, currentPage, setCurrentPage }) => {

  const menuItems = [
    {
      id: 'dashboard',
      name: 'Dashboard',
      icon: '📊',
      description: 'Overview & Analytics',
      gradient: 'from-blue-500 to-purple-500'
    },
    {
      id: 'servers',
      name: 'Servers',
      icon: '🏠',
      description: 'Manage Discord Servers',
      gradient: 'from-green-500 to-blue-500'
    },
    {
      id: 'moderation',
      name: 'Moderation',
      icon: '🛡️',
      description: 'Content & User Management',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      id: 'analytics',
      name: 'Analytics',
      icon: '📈',
      description: 'Insights & Reports',
      gradient: 'from-cyan-500 to-blue-500'
    },
    {
      id: 'violations',
      name: 'Violations',
      icon: '⚠️',
      description: 'Review & Feedback',
      gradient: 'from-red-500 to-orange-500'
    },
    {
      id: 'ai-config',
      name: 'AI Configuration',
      icon: '🤖',
      description: 'Model Settings',
      gradient: 'from-indigo-500 to-purple-500'
    },
    {
      id: 'community',
      name: 'Community Health',
      icon: '🏥',
      description: 'Wellness Metrics',
      gradient: 'from-emerald-500 to-green-500'
    },
    {
      id: 'settings',
      name: 'Settings',
      icon: '⚙️',
      description: 'System Configuration',
      gradient: 'from-gray-500 to-slate-500'
    }
  ]

  const quickActions = [
    { name: 'Add Server', icon: '➕', color: 'text-green-500' },
    { name: 'Export Data', icon: '📥', color: 'text-blue-500' },
    { name: 'View Logs', icon: '📋', color: 'text-purple-500' },
    { name: 'Support', icon: '💬', color: 'text-pink-500' }
  ]

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full w-80 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-r border-white/20 dark:border-gray-700/30 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>

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
                <p className="text-xs text-gray-500 dark:text-gray-400">v1.0.0</p>
              </div>
            </div>
            
            <button 
              onClick={onClose}
              className="lg:hidden p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-200"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setCurrentPage(item.id);
                onClose();
              }}
              className={`w-full group flex items-center space-x-4 px-4 py-3 rounded-xl transition-all duration-300 transform hover:scale-[1.02] ${
                currentPage === item.id
                  ? 'bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 shadow-lg shadow-purple-500/10'
                  : 'hover:bg-gray-100/50 dark:hover:bg-gray-800/50'
              }`}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 ${
                currentPage === item.id
                  ? `bg-gradient-to-r ${item.gradient} shadow-lg`
                  : 'bg-gray-100 dark:bg-gray-800 group-hover:bg-gray-200 dark:group-hover:bg-gray-700'
              }`}>
                <span className={`text-lg ${
                  currentPage === item.id ? 'text-white' : 'text-gray-600 dark:text-gray-300'
                }`}>
                  {item.icon}
                </span>
              </div>
              
              <div className="flex-1 text-left">
                <div className={`font-medium transition-colors duration-300 ${
                  currentPage === item.id
                    ? 'text-purple-600 dark:text-purple-400'
                    : 'text-gray-700 dark:text-gray-200 group-hover:text-purple-600 dark:group-hover:text-purple-400'
                }`}>
                  {item.name}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {item.description}
                </div>
              </div>

              {currentPage === item.id && (
                <div className="w-1 h-8 bg-gradient-to-b from-purple-500 to-blue-500 rounded-full shadow-lg"></div>
              )}
            </button>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="p-4 border-t border-gray-200/50 dark:border-gray-700/50">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-2">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={() => {
                  // Add specific actions here if needed
                  onClose();
                }}
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