// frontend/src/components/Dashboard/ViolationsList.jsx
import React, { useState } from 'react'
import { apiEndpoints, apiHelpers } from '../../services/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'

const ViolationsList = ({ violations, serverId }) => {
  const [expandedItems, setExpandedItems] = useState(new Set())
  const queryClient = useQueryClient()

  // Mutation for feedback submission
  const feedbackMutation = useMutation({
    mutationFn: ({ violationId, isFalsePositive }) => 
      apiEndpoints.reportViolationFeedback(serverId, violationId, isFalsePositive),
    onSuccess: () => {
      // Refresh the violations list
      queryClient.invalidateQueries(['server-violations', serverId])
      queryClient.invalidateQueries(['dashboard', serverId])
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

  // REPLACE the handleFeedback function:
  const handleFeedback = async (violationId, isFalsePositive) => {
    try {
      console.log('🔧 Frontend: Attempting to send feedback:', {
        serverId,
        violationId,
        isFalsePositive
      })
      
      const response = await feedbackMutation.mutateAsync({ violationId, isFalsePositive })
      
      console.log('✅ Frontend: Feedback sent successfully:', response)
      
    } catch (error) {
      console.error('❌ Frontend: Failed to submit feedback:', {
        error: error.message,
        response: error.response?.data,
        status: error.response?.status
      })
    }
  }

  if (!violations || violations.length === 0) {
    return (
      <div className="card backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border border-white/20 shadow-2xl">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Recent Violations</h3>
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-success-100 dark:bg-success-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">✅</span>
          </div>
          <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">All Clear!</h4>
          <p className="text-gray-600 dark:text-gray-300">No recent violations detected in your server.</p>
        </div>
      </div>
    )
  }

  const getViolationIcon = (type) => {
    switch (type) {
      case 'nsfw': return '🔞'
      case 'toxicity': return '🤬'
      case 'harassment': return '😡'
      case 'spam': return '📧'
      case 'hate_speech': return '💢'
      case 'threats': return '⚠️'
      default: return '⚠️'
    }
  }

  const getViolationBadgeColor = (type) => {
    switch (type) {
      case 'nsfw': return 'badge-danger'
      case 'toxicity': return 'badge-warning'
      case 'harassment': return 'badge-danger'
      case 'spam': return 'badge-primary'
      case 'hate_speech': return 'badge-danger'
      case 'threats': return 'badge-danger'
      default: return 'badge-primary'
    }
  }

  const getActionBadgeColor = (action) => {
    switch (action) {
      case 'delete': return 'badge-danger'
      case 'warn': return 'badge-warning'
      case 'timeout': return 'badge-primary'
      case 'kick': return 'badge-danger'
      case 'ban': return 'badge-danger'
      default: return 'badge-primary'
    }
  }

  // Mock detailed data (in real implementation, this would come from API)
    const getViolationDetails = (violation) => {
      return {
        messagePreview: violation.message_content || "Content not stored for privacy",
        username: violation.username || `User${violation.user_id?.slice(-2) || 'XX'}`,
        userId: violation.user_id || 'Unknown',
        channelName: violation.channel_name || "#unknown",
        timestamp: violation.created_at,
        aiReasoning: getAIReasoning(violation.violation_type),
        relatedPolicies: getRelatedPolicies(violation.violation_type),
        realConfidence: violation.confidence_score,
        actionTaken: violation.action_taken
      }
    }


  const getAIReasoning = (type) => {
    switch (type) {
      case 'toxicity':
        return "Message contained aggressive language and personal attacks directed at other users."
      case 'nsfw':
        return "Content detected as inappropriate for general audience with suggestive themes."
      case 'spam':
        return "Repetitive content pattern detected with excessive promotional links."
      case 'harassment':
        return "Targeted negative behavior towards specific user identified."
      default:
        return "Content flagged based on community guidelines analysis."
    }
  }

  const getRelatedPolicies = (type) => {
    switch (type) {
      case 'toxicity':
        return ["Be respectful to all members", "No personal attacks", "Keep discussions constructive"]
      case 'nsfw':
        return ["Keep content family-friendly", "Use appropriate channels for mature topics"]
      case 'spam':
        return ["No excessive self-promotion", "Quality over quantity in messages"]
      case 'harassment':
        return ["Zero tolerance for bullying", "Respect all community members"]
      default:
        return ["Follow community guidelines", "Maintain respectful discourse"]
    }
  }

  return (
    <div className="card backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border border-white/20 shadow-2xl">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Recent Violations</h3>
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {violations.length} violation{violations.length !== 1 ? 's' : ''}
          </span>
          <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
            <span>📚 Help AI learn:</span>
            <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded">Correct</span>
            <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded">False</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {violations.map((violation) => {
          const isExpanded = expandedItems.has(violation.id)
          const details = getViolationDetails(violation)
          
          return (
            <div key={violation.id} className="border border-gray-200/50 dark:border-gray-700/50 rounded-xl overflow-hidden hover:border-purple-300 dark:hover:border-purple-600 transition-all duration-300">
              {/* Main Violation Row */}
              <div className="p-4 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                  <div className="flex-shrink-0">
                    <span className="text-2xl">{getViolationIcon(violation.violation_type)}</span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`badge ${getViolationBadgeColor(violation.violation_type)}`}>
                        {violation.violation_type.replace('_', ' ')}
                      </span>
                      <span className={`badge ${getActionBadgeColor(violation.action_taken)}`}>
                        {violation.action_taken.replace('_', ' ')}
                      </span>
                      {violation.false_positive === true && (
                        <span className="badge badge-success">False Positive</span>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mb-2">
                      <span className="font-medium">Confidence: {apiHelpers.formatPercentage(violation.confidence_score)}</span>
                      <span>#{details.channelName}</span>
                      <span className="font-bold text-purple-600">@{details.username}</span> {/* REAL USERNAME */}
                      <span>ID: {details.userId}</span>
                      <span>{apiHelpers.formatDate(violation.created_at)}</span>
                    </div>

                    {/* REAL MESSAGE CONTENT */}
                    <div className="text-sm bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-2">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-red-600 dark:text-red-400 font-medium">Violating Message:</span>
                        <span className="text-xs text-red-500 dark:text-red-400">by @{details.username}</span>
                      </div>
                      <div className="font-mono text-red-800 dark:text-red-300 bg-white dark:bg-gray-800 p-2 rounded border">
                        "{details.messagePreview}"
                      </div>
                    </div>
                  </div>
                </div>

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-2 ml-4">
                    {/* Expand/Collapse Button */}
                    <button
                      onClick={() => toggleExpanded(violation.id)}
                      className="p-2 text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg transition-all duration-200"
                      title={isExpanded ? "Collapse details" : "Expand details"}
                    >
                      <span className={`text-lg transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                        ▼
                      </span>
                    </button>

                    {/* Feedback Buttons */}
                    {violation.false_positive === null && (
                      <>
                        <button
                          onClick={() => handleFeedback(violation.id, true)}
                          disabled={feedbackMutation.isLoading}
                          className="px-3 py-1 text-xs font-medium text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/30 rounded hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors duration-200 disabled:opacity-50"
                          title="Mark as false positive - AI was wrong"
                        >
                          False
                        </button>
                        <button
                          onClick={() => handleFeedback(violation.id, false)}
                          disabled={feedbackMutation.isLoading}
                          className="px-3 py-1 text-xs font-medium text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900/30 rounded hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors duration-200 disabled:opacity-50"
                          title="Confirm violation - AI was correct"
                        >
                          Correct
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="border-t border-gray-200/50 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/30 p-4 animate-fade-in">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* AI Analysis */}
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center">
                        <span className="text-lg mr-2">🧠</span>
                        AI Analysis
                      </h4>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 leading-relaxed">
                        {details.aiReasoning}
                      </p>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        <span className="font-medium">Model Confidence:</span> {apiHelpers.formatPercentage(violation.confidence_score)}
                      </div>
                    </div>

                    {/* Violated Policies */}
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center">
                        <span className="text-lg mr-2">📋</span>
                        Related Policies
                      </h4>
                      <ul className="space-y-1">
                        {details.relatedPolicies.map((policy, index) => (
                          <li key={index} className="text-sm text-gray-700 dark:text-gray-300 flex items-start">
                            <span className="text-purple-500 dark:text-purple-400 mr-2">•</span>
                            {policy}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Additional Details */}
                  <div className="mt-4 pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-gray-500 dark:text-gray-400">
                      <div>
                        <span className="font-medium">User ID:</span><br />
                        <span className="font-mono">{details.userId}</span>
                      </div>
                      <div>
                        <span className="font-medium">Channel:</span><br />
                        <span>{details.channelName}</span>
                      </div>
                      <div>
                        <span className="font-medium">Action Taken:</span><br />
                        <span className="capitalize">{violation.action_taken}</span>
                      </div>
                      <div>
                        <span className="font-medium">Timestamp:</span><br />
                        <span>{new Date(details.timestamp).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {violations.length >= 20 && (
        <div className="mt-6 text-center">
          <button className="btn bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-purple-500/25 transform hover:scale-105 transition-all duration-300">
            Load More Violations
          </button>
        </div>
      )}
    </div>
  )
}

export default ViolationsList