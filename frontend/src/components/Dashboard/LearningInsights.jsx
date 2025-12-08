// frontend/src/components/Dashboard/LearningInsights.jsx
import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { apiEndpoints, apiHelpers } from '../../services/api'
import LoadingSpinner from '../Layout/LoadingSpinner'

const LearningInsights = ({ serverId }) => {
  const { data: insights, isLoading, error } = useQuery({
    queryKey: ['learning-insights', serverId],
    queryFn: () => apiEndpoints.getLearningInsights(serverId),
    enabled: !!serverId,
    refetchInterval: 60000, // Refresh every minute
    select: (response) => response.data
  })

  if (isLoading) {
    return (
      <div className="card backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border border-white/20 shadow-2xl">
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner />
          <span className="ml-3 text-gray-600 dark:text-gray-400">Loading ML insights...</span>
        </div>
      </div>
    )
  }

  if (error || !insights) {
    return (
      <div className="card backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border border-white/20 shadow-2xl">
        <h3 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-6">
          🧠 ML Training Insights
        </h3>
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🤖</span>
          </div>
          <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No Learning Data</h4>
          <p className="text-gray-600 dark:text-gray-400">ML insights will appear as the system learns from your feedback.</p>
        </div>
      </div>
    )
  }

  const getLearningStatus = (rate) => {
    if (rate < 0.1) return { icon: '🟢', text: 'Excellent', color: 'text-green-600' }
    if (rate < 0.3) return { icon: '🟡', text: 'Good', color: 'text-yellow-600' }
    return { icon: '🔴', text: 'Needs Improvement', color: 'text-red-600' }
  }

  const learningStatus = getLearningStatus(insights.false_positive_rate)

  return (
    <div className="card backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border border-white/20 shadow-2xl hover:shadow-purple-500/10 transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          🧠 ML Training Insights
        </h3>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-500 dark:text-gray-400">Learning Active</span>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {insights.total_violations}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Total Violations</div>
        </div>

        <div className="text-center p-3 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {(insights.average_confidence * 100).toFixed(1)}%
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Avg Confidence</div>
        </div>

        <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {(insights.false_positive_rate * 100).toFixed(1)}%
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">False Positive Rate</div>
        </div>

        <div className="text-center p-3 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-lg">
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {(insights.health_score * 100).toFixed(0)}%
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Health Score</div>
        </div>
      </div>

      {/* Learning Status */}
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-gray-900 dark:text-gray-100">Learning Performance</h4>
          <div className="flex items-center space-x-2">
            <span className="text-lg">{learningStatus.icon}</span>
            <span className={`font-medium ${learningStatus.color}`}>{learningStatus.text}</span>
          </div>
        </div>
        
        <div className="text-sm text-gray-600 dark:text-gray-300 mb-3">
          The AI model has processed <strong>{insights.total_violations}</strong> violations with an average confidence of <strong>{(insights.average_confidence * 100).toFixed(1)}%</strong>.
          False positive rate is <strong>{(insights.false_positive_rate * 100).toFixed(1)}%</strong>.
        </div>

        {/* Progress bar for learning accuracy */}
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${(1 - insights.false_positive_rate) * 100}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
          <span>Learning Accuracy</span>
          <span>{((1 - insights.false_positive_rate) * 100).toFixed(1)}%</span>
        </div>
      </div>

      {/* Current Thresholds */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-4">
        <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center">
          <span className="mr-2">⚙️</span>
          Current AI Thresholds
        </h4>
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(insights.current_thresholds).map(([type, threshold]) => (
            <div key={type} className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-300 capitalize">{type.replace('_', ' ')}</span>
              <span className="font-mono text-sm font-medium text-blue-600 dark:text-blue-400">
                {(threshold * 100).toFixed(0)}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Violation Types Breakdown */}
      {Object.keys(insights.violation_types).length > 0 && (
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 mb-4">
          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center">
            <span className="mr-2">📊</span>
            Violation Types Detected
          </h4>
          <div className="space-y-2">
            {Object.entries(insights.violation_types)
              .sort(([,a], [,b]) => b - a)
              .map(([type, count]) => (
                <div key={type} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-300 capitalize flex items-center">
                    <span className="mr-2">
                      {type === 'toxicity' ? '🤬' : 
                       type === 'spam' ? '📧' : 
                       type === 'nsfw' ? '🔞' : '⚠️'}
                    </span>
                    {type.replace('_', ' ')}
                  </span>
                  <span className="font-medium text-purple-600 dark:text-purple-400">{count}</span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Learning Recommendations */}
      {insights.recommendations && insights.recommendations.length > 0 && (
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center">
            <span className="mr-2">💡</span>
            ML Recommendations
          </h4>
          <div className="space-y-2">
            {insights.recommendations.slice(0, 3).map((rec, index) => (
              <div key={index} className="flex items-start space-x-2 text-sm">
                <span className="text-green-500 dark:text-green-400 mt-0.5">•</span>
                <span className="text-gray-700 dark:text-gray-300">
                  {typeof rec === 'string' ? rec : rec.message || rec.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Last Updated */}
      <div className="mt-4 text-center text-xs text-gray-500 dark:text-gray-400">
        Last updated: {new Date().toLocaleTimeString()}
      </div>
    </div>
  )
}

export default LearningInsights