// frontend/src/components/Dashboard/ViolationsList.jsx
// Complete fixed version with deduplication and improved display

import React, { useState, useMemo } from 'react'
import { apiEndpoints, apiHelpers } from '../../services/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'

// Deduplication function to remove duplicate violations
const deduplicateViolations = (violations) => {
  if (!Array.isArray(violations)) return []
  
  // Create a Map to track unique violations
  // Use combination of ID, timestamp, and content for uniqueness
  const uniqueMap = new Map()
  
  violations.forEach(violation => {
    // Create a unique key combining multiple fields
    const key = `${violation.id}-${violation.created_at}-${violation.user_id}-${violation.violation_type}`
    
    if (!uniqueMap.has(key)) {
      uniqueMap.set(key, violation)
    } else {
      console.log('🔍 ViolationsList: Duplicate violation filtered:', violation.id)
    }
  })
  
  const deduplicated = Array.from(uniqueMap.values())
  
  if (violations.length !== deduplicated.length) {
    console.log(`🔍 ViolationsList: Deduplicated violations: ${violations.length} → ${deduplicated.length}`)
  }
  
  return deduplicated
}

// Get violation type configuration
const getViolationConfig = (type) => {
  const configs = {
    toxicity: { icon: '🤬', color: 'text-orange-600 dark:text-orange-400', bgColor: 'bg-orange-100 dark:bg-orange-900/30' },
    nsfw: { icon: '🔞', color: 'text-red-600 dark:text-red-400', bgColor: 'bg-red-100 dark:bg-red-900/30' },
    harassment: { icon: '😠', color: 'text-purple-600 dark:text-purple-400', bgColor: 'bg-purple-100 dark:bg-purple-900/30' },
    hate_speech: { icon: '💀', color: 'text-red-800 dark:text-red-300', bgColor: 'bg-red-200 dark:bg-red-800/30' },
    spam: { icon: '📧', color: 'text-yellow-600 dark:text-yellow-400', bgColor: 'bg-yellow-100 dark:bg-yellow-900/30' },
    threats: { icon: '⚔️', color: 'text-red-700 dark:text-red-300', bgColor: 'bg-red-150 dark:bg-red-800/40' },
    self_harm: { icon: '🩹', color: 'text-pink-600 dark:text-pink-400', bgColor: 'bg-pink-100 dark:bg-pink-900/30' }
  }
  
  return configs[type] || { 
    icon: '⚠️', 
    color: 'text-gray-600 dark:text-gray-400', 
    bgColor: 'bg-gray-100 dark:bg-gray-900/30' 
  }
}

// Format date for display
const formatDate = (dateString) => {
  try {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (error) {
    return 'Unknown date'
  }
}

const ViolationsList = ({ violations, serverId, onViolationUpdate }) => {
  const [expandedItems, setExpandedItems] = useState(new Set())
  const [feedbackStates, setFeedbackStates] = useState(new Map())
  const queryClient = useQueryClient()

  // Deduplicate violations
  const uniqueViolations = useMemo(() => {
    const deduplicated = deduplicateViolations(violations)
    
    // Sort by date (newest first)
    return deduplicated.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  }, [violations])

  // Mutation for feedback submission
  const feedbackMutation = useMutation({
    mutationFn: async ({ violationId, isFalsePositive }) => {
      console.log('📝 ViolationsList: Submitting feedback', { violationId, isFalsePositive, serverId })
      return await apiEndpoints.reportViolationFeedback(serverId, violationId, isFalsePositive)
    },
    onMutate: ({ violationId }) => {
      // Optimistic update
      setFeedbackStates(prev => new Map(prev).set(violationId, 'submitting'))
    },
    onSuccess: (data, { violationId, isFalsePositive }) => {
      console.log('✅ ViolationsList: Feedback submitted successfully', data)
      setFeedbackStates(prev => new Map(prev).set(violationId, 'submitted'))
      
      // Refresh dashboard data
      queryClient.invalidateQueries(['dashboard', serverId])
      queryClient.invalidateQueries(['server-violations', serverId])
      
      if (onViolationUpdate) {
        onViolationUpdate()
      }
      
      // Clear feedback state after delay
      setTimeout(() => {
        setFeedbackStates(prev => {
          const newMap = new Map(prev)
          newMap.delete(violationId)
          return newMap
        })
      }, 3000)
    },
    onError: (error, { violationId }) => {
      console.error('❌ ViolationsList: Feedback submission failed', error)
      setFeedbackStates(prev => new Map(prev).set(violationId, 'error'))
      
      // Clear error state after delay
      setTimeout(() => {
        setFeedbackStates(prev => {
          const newMap = new Map(prev)
          newMap.delete(violationId)
          return newMap
        })
      }, 5000)
    }
  })

  const toggleExpanded = (violationId) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(violationId)) {
      newExpanded.delete(violationId)
    } else {
      newExpanded.add(violationId)
    }
    setExpandedItems(newExpanded)
  }

  const handleFeedback = async (violationId, isFalsePositive) => {
    if (feedbackMutation.isLoading) return
    
    try {
      await feedbackMutation.mutateAsync({ violationId, isFalsePositive })
    } catch (error) {
      console.error('❌ ViolationsList: Feedback error:', error)
    }
  }

  if (!uniqueViolations || uniqueViolations.length === 0) {
    return (
      <div className="card backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border border-white/20 shadow-2xl">
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center">
          <span className="text-2xl mr-3">📋</span>
          Recent Violations
        </h3>
        
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">✅</span>
          </div>
          <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">All Clear!</h4>
          <p className="text-gray-600 dark:text-gray-300">
            No recent violations detected. Your community is staying safe!
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="card backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border border-white/20 shadow-2xl">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
          <span className="text-2xl mr-3">📋</span>
          Recent Violations
        </h3>
        
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {uniqueViolations.length} violation{uniqueViolations.length !== 1 ? 's' : ''}
          </span>
          
          <div className="text-xs text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30 px-3 py-1 rounded-full">
            📚 Help AI learn: 
            <span className="ml-1 font-medium">Correct</span>
            <span className="mx-1">•</span>
            <span className="font-medium">False</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {uniqueViolations.map((violation) => {
          const isExpanded = expandedItems.has(violation.id)
          const violationConfig = getViolationConfig(violation.violation_type)
          const feedbackState = feedbackStates.get(violation.id)
          const hasFeedback = violation.false_positive !== null && violation.false_positive !== undefined
          
          return (
            <div 
              key={`${violation.id}-${violation.created_at}`}
              className="border border-gray-200/50 dark:border-gray-700/50 rounded-xl hover:border-purple-300 dark:hover:border-purple-600 transition-all duration-300 overflow-hidden bg-white/50 dark:bg-gray-800/50"
            >
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    {/* Violation Type Icon */}
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${violationConfig.bgColor}`}>
                      <span className="text-lg">{violationConfig.icon}</span>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      {/* Violation Header */}
                      <div className="flex items-center space-x-2 mb-1">
                        <span className={`font-semibold ${violationConfig.color} capitalize`}>
                          {violation.violation_type?.replace('_', ' ') || 'Unknown'}
                        </span>
                        <span className="text-gray-400 dark:text-gray-500">•</span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {violation.action_taken || 'No action'}
                        </span>
                      </div>
                      
                      {/* Confidence and Channel Info */}
                      <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mb-2">
                        <span className="font-medium text-gray-600 dark:text-gray-300">
                          Confidence: {Math.min(100, Math.max(0, (violation.confidence_score * 100))).toFixed(0)}%
                        </span>

                        <span>##channel-{violation.channel_id?.slice(-2) || '??'}</span>
                        <span>@{violation.username || 'Unknown User'}</span>
                      </div>
                      
                      {/* User and Timestamp */}
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        ID: {violation.id} • {formatDate(violation.created_at)}
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex items-center space-x-2 ml-4">
                    {/* Expand/Collapse Button */}
                    <button
                      onClick={() => toggleExpanded(violation.id)}
                      className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
                      title={isExpanded ? "Collapse details" : "Expand details"}
                    >
                      <span className={`text-lg transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                        ▼
                      </span>
                    </button>

                    {/* Feedback Buttons */}
                    {!hasFeedback && feedbackState !== 'submitted' && (
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleFeedback(violation.id, true)}
                          disabled={feedbackMutation.isLoading || feedbackState === 'submitting'}
                          className="px-3 py-1 text-xs font-medium text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/30 rounded hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Mark as false positive - AI was wrong"
                        >
                          {feedbackState === 'submitting' ? '...' : 'False'}
                        </button>
                        <button
                          onClick={() => handleFeedback(violation.id, false)}
                          disabled={feedbackMutation.isLoading || feedbackState === 'submitting'}
                          className="px-3 py-1 text-xs font-medium text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900/30 rounded hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Confirm violation - AI was correct"
                        >
                          {feedbackState === 'submitting' ? '...' : 'Correct'}
                        </button>
                      </div>
                    )}
                    
                    {/* Feedback Status */}
                    {hasFeedback && (
                      <div className="flex items-center space-x-1">
                        <span className={`px-2 py-1 text-xs font-medium rounded ${
                          violation.false_positive 
                            ? 'text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/30'
                            : 'text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900/30'
                        }`}>
                          {violation.false_positive ? 'False' : 'Correct'}
                        </span>
                      </div>
                    )}
                    
                    {/* Feedback State Indicators */}
                    {feedbackState === 'submitted' && (
                      <span className="text-xs text-green-600 dark:text-green-400 font-medium">✓ Saved</span>
                    )}
                    {feedbackState === 'error' && (
                      <span className="text-xs text-red-600 dark:text-red-400 font-medium">✗ Error</span>
                    )}
                  </div>
                </div>
                
                {/* Violating Message Preview */}
                <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border-l-4 border-purple-400">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Violating Message:
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      by @{violation.username || 'Unknown User'}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 italic">
                    {violation.content ? `"${violation.content}"` : '"Content not stored for privacy"'}
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="border-t border-gray-200/50 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/30 p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* AI Analysis */}
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center">
                        <span className="text-lg mr-2">🧠</span>
                        AI Analysis
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Confidence Score:</span>
                          <span className="font-medium text-gray-900 dark:text-gray-100">
                            {Math.round((violation.confidence_score || 0) * 100)}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Violation Type:</span>
                          <span className="font-medium text-gray-900 dark:text-gray-100 capitalize">
                            {violation.violation_type?.replace('_', ' ') || 'Unknown'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Action Taken:</span>
                          <span className="font-medium text-gray-900 dark:text-gray-100 capitalize">
                            {violation.action_taken || 'None'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Additional Details */}
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center">
                        <span className="text-lg mr-2">📋</span>
                        Details
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">User ID:</span>
                          <span className="font-mono text-xs text-gray-900 dark:text-gray-100">
                            {violation.user_id || 'Unknown'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Channel ID:</span>
                          <span className="font-mono text-xs text-gray-900 dark:text-gray-100">
                            {violation.channel_id || 'Unknown'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Timestamp:</span>
                          <span className="text-gray-900 dark:text-gray-100">
                            {formatDate(violation.created_at)}
                          </span>
                        </div>
                        {violation.false_positive !== null && (
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Human Review:</span>
                            <span className={`font-medium ${
                              violation.false_positive 
                                ? 'text-red-600 dark:text-red-400' 
                                : 'text-green-600 dark:text-green-400'
                            }`}>
                              {violation.false_positive ? 'Marked as False Positive' : 'Confirmed Correct'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Load More Button (if there are many violations) */}
      {uniqueViolations.length >= 20 && (
        <div className="mt-6 text-center">
          <button className="btn bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-purple-500/25 transform hover:scale-105 transition-all duration-300">
            Load More Violations
          </button>
        </div>
      )}
      
      {/* Debug Panel */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <h5 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">Debug Info:</h5>
          <div className="text-xs text-yellow-700 dark:text-yellow-300 space-y-1">
            <div>Original violations count: {violations?.length || 0}</div>
            <div>Unique violations count: {uniqueViolations.length}</div>
            <div>Server ID: {serverId}</div>
            <div>Feedback states: {feedbackStates.size} active</div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ViolationsList