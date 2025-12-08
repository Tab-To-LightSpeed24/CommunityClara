// frontend/src/components/Dashboard/HealthScore.jsx
import React from 'react'
import { apiHelpers } from '../../services/api'

const HealthScore = ({ healthData }) => {
  // Return empty state if no health data
  if (!healthData) {
    return (
      <div className="card backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border border-white/20 shadow-2xl">
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🏥</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No Health Data</h3>
          <p className="text-gray-600 dark:text-gray-400">Community health metrics will appear here once your server has activity.</p>
        </div>
      </div>
    )
  }

  const getHealthIcon = (status) => {
    switch (status) {
      case 'excellent': return '🟢'
      case 'good': return '🔵'
      case 'fair': return '🟡'
      case 'poor': return '🔴'
      default: return '⚪'
    }
  }

  const getHealthText = (status) => {
    switch (status) {
      case 'excellent': return 'Excellent'
      case 'good': return 'Good'
      case 'fair': return 'Fair'
      case 'poor': return 'Poor'
      default: return 'Unknown'
    }
  }

  const scorePercentage = Math.round(healthData.health_score * 100)

  return (
    <div className="card backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border border-white/20 shadow-2xl">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Community Health</h3>
        
        {/* Circular Progress */}
        <div className="relative w-24 h-24 mx-auto mb-4">
          <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="#f3f4f6"
              strokeWidth="8"
              fill="none"
            />
            {/* Progress circle */}
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke={healthData.status === 'excellent' ? '#22c55e' :
                     healthData.status === 'good' ? '#3b82f6' :
                     healthData.status === 'fair' ? '#f59e0b' : '#ef4444'}
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${scorePercentage * 2.51} 251`}
              className="transition-all duration-500"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">{scorePercentage}%</span>
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center justify-center space-x-2 mb-4">
          <span className="text-2xl">{getHealthIcon(healthData.status)}</span>
          <span className={`font-medium ${apiHelpers.getHealthStatusColor ? apiHelpers.getHealthStatusColor(healthData.status) : 'text-gray-600'}`}>
            {getHealthText(healthData.status)}
          </span>
        </div>

        {/* Trend */}
        {healthData.trend !== 0 && (
          <div className="flex items-center justify-center space-x-1 text-sm">
            <span className={healthData.trend > 0 ? 'text-green-600' : 'text-red-600'}>
              {healthData.trend > 0 ? '📈' : '📉'}
            </span>
            <span className="text-gray-600 dark:text-gray-400">
              {Math.abs(healthData.trend * 100).toFixed(1)}% from last week
            </span>
          </div>
        )}
      </div>

      {/* Recommendations - Only show if they exist and are real */}
      {healthData.recommendations && healthData.recommendations.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Recommendations</h4>
          <div className="space-y-2">
            {healthData.recommendations.slice(0, 3).map((recommendation, index) => (
              <div key={index} className="flex items-start space-x-2 text-sm">
                <span className="text-purple-500">•</span>
                <span className="text-gray-600 dark:text-gray-300">{recommendation}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default HealthScore