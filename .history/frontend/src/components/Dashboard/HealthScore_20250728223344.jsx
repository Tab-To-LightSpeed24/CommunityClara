// frontend/src/components/Dashboard/HealthScore.jsx
import React from 'react'
import { apiHelpers } from '../../services/api'

const HealthScore = ({ healthData }) => {
  if (!healthData) return null

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
    <div className="card">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Community Health</h3>
        
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
            <span className="text-2xl font-bold text-gray-900">{scorePercentage}%</span>
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center justify-center space-x-2 mb-4">
          <span className="text-2xl">{getHealthIcon(healthData.status)}</span>
          <span className={`font-medium ${apiHelpers.getHealthStatusColor(healthData.status)}`}>
            {getHealthText(healthData.status)}
          </span>
        </div>

        {/* Trend */}
        {healthData.trend !== 0 && (
          <div className="flex items-center justify-center space-x-1 text-sm">
            <span className={healthData.trend > 0 ? 'text-danger-600' : 'text-success-600'}>
              {healthData.trend > 0 ? '📈' : '📉'}
            </span>
            <span className="text-gray-600">
              {Math.abs(healthData.trend * 100).toFixed(1)}% from last week
            </span>
          </div>
        )}
      </div>

      {/* Recommendations */}
      {healthData.recommendations && healthData.recommendations.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-2">Recommendations</h4>
          <div className="space-y-2">
            {healthData.recommendations.slice(0, 3).map((recommendation, index) => (
              <div key={index} className="flex items-start space-x-2 text-sm">
                <span className="text-primary-500">•</span>
                <span className="text-gray-600">{recommendation}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default HealthScore