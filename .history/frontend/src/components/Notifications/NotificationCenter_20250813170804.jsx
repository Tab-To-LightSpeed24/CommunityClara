// frontend/src/components/Notifications/NotificationCenter.jsx
import React, { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { apiEndpoints } from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'

const NotificationCenter = () => {
  const [filter, setFilter] = useState('all')
  const { user } = useAuth()

  // Mock notifications data - replace with real API call
  const mockNotifications = [
    {
      id: 1,
      type: 'violation',
      title: 'Violation Detected',
      message: 'Toxicity detected in #testing channel',
      server: 'Empty Room',
      timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
      read: false,
      icon: '🚨'
    },
    {
      id: 2,
      type: 'daily_report',
      title: 'Daily Report Ready',
      message: 'Your daily moderation report is ready',
      server: 'Empty Room',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      read: false,
      icon: '📊'
    },
    {
      id: 3,
      type: 'system_update',
      title: 'System Update',
      message: 'CommunityClara has been updated to v4.1',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      read: true,
      icon: '🔄'
    }
  ]

  const [notifications, setNotifications] = useState(mockNotifications)

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'all') return true
    if (filter === 'unread') return !notif.read
    return notif.type === filter
  })

  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    )
  }

  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id))
  }

  const getTimeAgo = (timestamp) => {
    const now = new Date()
    const diff = now - timestamp
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
            🔔 Notifications
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Stay updated with your server activity and system updates
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={markAllAsRead}
            className="btn bg-gray-600 text-white hover:bg-gray-700"
          >
            Mark All Read
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
        {[
          { key: 'all', label: 'All', icon: '📋' },
          { key: 'unread', label: 'Unread', icon: '🔴' },
          { key: 'violation', label: 'Violations', icon: '🚨' },
          { key: 'daily_report', label: 'Reports', icon: '📊' },
          { key: 'system_update', label: 'Updates', icon: '🔄' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filter === tab.key
                ? 'bg-white dark:bg-gray-700 text-purple-600 dark:text-purple-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🔔</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No Notifications</h3>
            <p className="text-gray-600 dark:text-gray-400">You're all caught up!</p>
          </div>
        ) : (
          filteredNotifications.map(notification => (
            <div
              key={notification.id}
              className={`card border transition-all duration-200 ${
                notification.read 
                  ? 'bg-white/60 dark:bg-gray-900/60 border-gray-200 dark:border-gray-700' 
                  : 'bg-blue-50/80 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 shadow-md'
              }`}
            >
              <div className="flex items-start space-x-4">
                {/* Icon */}
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  notification.read 
                    ? 'bg-gray-100 dark:bg-gray-800' 
                    : 'bg-blue-100 dark:bg-blue-900/50'
                }`}>
                  <span className="text-xl">{notification.icon}</span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className={`font-medium ${
                        notification.read 
                          ? 'text-gray-900 dark:text-gray-100' 
                          : 'text-blue-900 dark:text-blue-100'
                      }`}>
                        {notification.title}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {notification.message}
                      </p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                        {notification.server && (
                          <span>📍 {notification.server}</span>
                        )}
                        <span>🕒 {getTimeAgo(notification.timestamp)}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2 ml-4">
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                        >
                          Mark Read
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="text-xs text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default NotificationCenter