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
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
          <span className="text-sm text-gray-500 dark:text-gray-400">Live</span>
        </div>
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-purple-300 scrollbar-track-transparent">
        {activities.map((activity, index) => (
          <div 
            key={activity.id}
            className="group flex items-start space-x-3 p-3 rounded-xl hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-pink-50/50 dark:hover:from-purple-900/20 dark:hover:to-pink-900/20 transition-all duration-300 transform hover:scale-[1.02]"
            style={{
              animationDelay: `${index * 100}ms`,
              animation: 'slideUp 0.5s ease-out forwards'
            }}
          >
            <div className={`flex-shrink-0 w-10 h-10 rounded-full ${activity.bg} flex items-center justify-center ring-2 ring-white dark:ring-gray-800 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
              <span className="text-lg">{activity.icon}</span>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <p className={`text-sm font-medium ${activity.color} group-hover:text-purple-600 transition-colors duration-300`}>
                  {activity.user}
                </p>
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  {apiHelpers.formatDate(activity.timestamp)}
                </span>
              </div>
              
              <p className="text-sm text-gray-600 dark:text-gray-300 group-hover:text-gray-800 dark:group-hover:text-gray-100 transition-colors duration-300">
                {activity.message}
              </p>
              
              <div className="mt-2 flex items-center space-x-2">
                <div className="h-1 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full w-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 text-center">
        <button className="btn bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-purple-500/25 transform hover:scale-105 transition-all duration-300">
          View Full Activity Log
        </button>
      </div>
    </div>
  )
}

export default ActivityLog