// frontend/src/components/Dashboard/StatsOverview.jsx
import React from 'react'
import { apiHelpers } from '../../services/api'

const StatsOverview = ({ stats }) => {
  if (!stats) return null

  const statCards = [
    {
      title: 'Total Messages',
      value: apiHelpers.formatNumber(stats.total_messages),
      icon: '💬',
      color: 'text-primary-600 bg-primary-50'
    },
    {
      title: 'Violations Detected',
      value: apiHelpers.formatNumber(stats.total_violations),
      icon: '🚨',
      color: 'text-danger-600 bg-danger-50'
    },
    {
      title: 'Health Score',
      value: apiHelpers.formatPercentage(stats.health_score),
      icon: '🏥',
      color: stats.health_score > 0.8 ? 'text-success-600 bg-success-50' : 
             stats.health_score > 0.6 ? 'text-warning-600 bg-warning-50' : 
             'text-danger-600 bg-danger-50'
    },
    {
      title: 'False Positives',
      value: stats.false_positives,
      icon: '❌',
      color: 'text-gray-600 bg-gray-50'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, index) => (
        <div key={index} className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stat.value}</p>
            </div>
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${stat.color}`}>
              <span className="text-xl">{stat.icon}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default StatsOverview