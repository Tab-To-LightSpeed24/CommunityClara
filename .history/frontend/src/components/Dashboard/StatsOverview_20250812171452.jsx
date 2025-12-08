// frontend/src/components/Dashboard/StatsOverview.jsx
import React from 'react'
import { apiHelpers } from '../../services/api'

const StatsOverview = ({ stats }) => {
  // Return empty state if no real stats provided
  if (!stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: 'Total Messages', icon: '💬' },
          { title: 'Violations Detected', icon: '🚨' },
          { title: 'Health Score', icon: '🏥' },
          { title: 'False Positives', icon: '❌' }
        ].map((item, index) => (
          <div key={index} className="group">
            <div className="stat-card backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border border-white/20 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-400 dark:text-gray-500 mb-1">{item.title}</p>
                  <p className="text-3xl font-bold text-gray-300 dark:text-gray-600">-</p>
                </div>
                <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                  <span className="text-2xl opacity-50">{item.icon}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Use only real stats data
  const statCards = [
    {
      title: 'Total Messages',
      value: apiHelpers.formatNumber(stats.total_messages),
      icon: '💬',
      color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/30'
    },
    {
      title: 'Violations Detected',
      value: apiHelpers.formatNumber(stats.total_violations),
      icon: '🚨',
      color: 'text-red-600 bg-red-50 dark:bg-red-900/30'
    },
    {
      title: 'Health Score',
      value: apiHelpers.formatPercentage(stats.health_score),
      icon: '🏥',
      color: stats.health_score > 0.8 ? 'text-green-600 bg-green-50 dark:bg-green-900/30' : 
             stats.health_score > 0.6 ? 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/30' : 
             'text-red-600 bg-red-50 dark:bg-red-900/30'
    },
    {
      title: 'False Positives',
      value: stats.false_positives,
      icon: '❌',
      color: 'text-gray-600 bg-gray-50 dark:bg-gray-900/30'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, index) => (
        <div key={index} className="group">
          <div className="stat-card backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border border-white/20 shadow-xl hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 group-hover:scale-110 transition-transform duration-300">{stat.value}</p>
                {stat.trend && (
                  <div className="flex items-center mt-2">
                    <span className={`text-xs font-medium ${stat.trend.startsWith('+') ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {stat.trend.startsWith('+') ? '📈' : '📉'} {stat.trend}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">vs last week</span>
                  </div>
                )}
              </div>
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${stat.color} group-hover:scale-110 transition-all duration-300 shadow-lg`}>
                <span className="text-2xl">{stat.icon}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
      
      {/* Data Status Indicator */}
      {(!stats || stats.total_messages === 0) && (
        <div className="col-span-full mt-4">
          <div className="flex items-center justify-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full text-sm bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800">
              <span className="w-2 h-2 bg-yellow-400 rounded-full mr-2 animate-pulse"></span>
              Showing demo statistics - Real data will appear as your server processes messages
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default StatsOverview