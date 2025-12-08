// Complete updated frontend/src/components/Notifications/NotificationCenter.jsx
import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiEndpoints } from '../../services/api'

const NotificationCenter = () => {
  const [filter, setFilter] = useState('all')
  const queryClient = useQueryClient()

  // Fetch notifications with polling
  const { data: notificationData, isLoading, error } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => apiEndpoints.getUserNotifications(),
    select: (response) => response.data,
    refetchInterval: 30000,
    refetchIntervalInBackground: true
  })

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: () => apiEndpoints.markAllNotificationsRead(),
    onSuccess: (response) => {
      console.log('✅ Mark all as read successful:', response.data)
      
      // Immediately update the notifications data
      queryClient.setQueryData(['notifications'], (old) => {
        if (!old) return old
        return {
          ...old,
          notifications: old.notifications.map(notif => ({ ...notif, read: true })),
          unread_count: 0
        }
      })
      
      // Also update the navbar count
      queryClient.invalidateQueries(['notifications-count'])
      
      // Force refresh to ensure consistency
      setTimeout(() => {
        queryClient.invalidateQueries(['notifications'])
      }, 500)
    },
    onError: (error) => {
      console.error('❌ Mark all as read failed:', error)
    }
  })

  const notifications = notificationData?.notifications || []
  const unreadCount = notificationData?.unread_count || 0

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'all') return true
    if (filter === 'unread') return !notif.read
    return notif.type === filter
  })

  const markAllAsRead = () => {
    console.log('🔄 Triggering mark all as read...')
    markAllAsReadMutation.mutate()
  }

  // Format timestamp to local time
  const formatLocalTime = (timestamp) => {
    try {
      const date = new Date(timestamp)
      return date.toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    } catch (error) {
      return 'Invalid date'
    }
  }

  // Get relative time (e.g., "5 minutes ago")
  const getTimeAgo = (timestamp) => {
    try {
      const now = new Date()
      const date = new Date(timestamp)
      const diff = now - date
      const minutes = Math.floor(diff / (1000 * 60))
      const hours = Math.floor(diff / (1000 * 60 * 60))
      const days = Math.floor(diff / (1000 * 60 * 60 * 24))

      if (minutes < 1) return 'Just now'
      if (minutes < 60) return `${minutes}m ago`
      if (hours < 24) return `${hours}h ago`
      if (days < 7) return `${days}d ago`
      return formatLocalTime(timestamp)
    } catch (error) {
      return 'Unknown time'
    }
  }

  // Get severity color
  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'text-red-600 dark:text-red-400'
      case 'medium': return 'text-orange-600 dark:text-orange-400'
      case 'low': return 'text-blue-600 dark:text-blue-400'
      default: return 'text-gray-600 dark:text-gray-400'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        <span className="ml-3 text-gray-600 dark:text-gray-400">Loading notifications...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">❌</span>
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Error Loading Notifications</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">Unable to fetch notifications</p>
        <button 
          onClick={() => queryClient.invalidateQueries(['notifications'])}
          className="btn btn-primary"
        >
          Retry
        </button>
      </div>
    )
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
            {unreadCount > 0 && (
              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                {unreadCount} unread
              </span>
            )}
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => queryClient.invalidateQueries(['notifications'])}
            className="btn bg-blue-600 text-white hover:bg-blue-700"
            disabled={isLoading}
          >
            🔄 Refresh
          </button>
          <button
            onClick={markAllAsRead}
            className="btn bg-gray-600 text-white hover:bg-gray-700"
            disabled={markAllAsReadMutation.isLoading || unreadCount === 0}
          >
            {markAllAsReadMutation.isLoading ? (
              <>
                <span className="animate-spin mr-2">⟳</span>
                Marking All Read...
              </>
            ) : (
              <>
                <span className="mr-2">✓</span>
                Mark All Read
              </>
            )}
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
        {[
          { key: 'all', label: `All (${notifications.length})`, icon: '📋' },
          { key: 'unread', label: `Unread (${unreadCount})`, icon: '🔴' },
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
            <p className="text-gray-600 dark:text-gray-400">
              {filter === 'unread' ? "You're all caught up!" : "No notifications to show"}
            </p>
          </div>
        ) : (
          filteredNotifications.map(notification => (
            <div
              key={notification.id}
              className={`card border transition-all duration-200 hover:shadow-lg ${
                notification.read 
                  ? 'bg-white/60 dark:bg-gray-900/60 border-gray-200 dark:border-gray-700 opacity-60' 
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
                  <div className="flex items-center space-x-2">
                    <h4 className={`font-medium ${
                      notification.read 
                        ? 'text-gray-500 dark:text-gray-400' 
                        : 'text-blue-900 dark:text-blue-100'
                    }`}>
                      {notification.title}
                    </h4>
                    {notification.severity && (
                      <span className={`text-xs font-medium ${getSeverityColor(notification.severity)}`}>
                        {notification.severity.toUpperCase()}
                      </span>
                    )}
                    {!notification.read && (
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {notification.message}
                  </p>
                  <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                    {notification.server && (
                      <span>🏢 {notification.server}</span>
                    )}
                    <span 
                      title={formatLocalTime(notification.timestamp)}
                      className="cursor-help"
                    >
                      🕒 {getTimeAgo(notification.timestamp)}
                    </span>
                  </div>
                </div>
                {/* NO INDIVIDUAL ACTION BUTTONS - REMOVED */}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Auto-refresh indicator */}
      <div className="text-center text-xs text-gray-500 dark:text-gray-400">
        <span>🔄 Auto-refreshing every 30 seconds</span>
        {markAllAsReadMutation.isLoading && (
          <span className="ml-4 text-blue-600 dark:text-blue-400">
            <span className="animate-spin mr-1">⟳</span>
            Updating notifications...
          </span>
        )}
      </div>
    </div>
  )
}

export default NotificationCenter