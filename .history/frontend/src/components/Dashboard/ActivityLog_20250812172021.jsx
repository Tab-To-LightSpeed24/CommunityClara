// frontend/src/components/Dashboard/ActivityLog.jsx
import React, { useState, useEffect } from 'react'
import { apiHelpers } from '../../services/api'

const ActivityLog = ({ serverId }) => {
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Only show real activity data - no mock generation
    setActivities([])
    setLoading(false)
  }, [serverId])

  if (loading) {
    return (
      <div className="card backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border border-white/20 shadow-2xl">
        <div className="animate-pulse">
          <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-100 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="card backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border border-white/20 shadow-2xl hover:shadow-purple-500/10 transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          🔴 Live Activity Feed
        </h3>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
          <span className="text-sm text-gray-500 dark:text-gray-400">No Activity</span>
        </div>
      </div>

      {/* Empty State */}
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">📊</span>
        </div>
        <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No Activity Data</h4>
        <p className="text-gray-600 dark:text-gray-400">Live activity will appear here as your server processes messages.</p>
      </div>
    </div>
  )
}

export default ActivityLog