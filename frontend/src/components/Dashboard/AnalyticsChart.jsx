// frontend/src/components/Dashboard/AnalyticsChart.jsx
// Fixed to better handle data and show debug information

import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { apiHelpers } from '../../services/api'

const AnalyticsChart = ({ analytics, serverId }) => {
  // Debug logging
  React.useEffect(() => {
    console.log('📈 AnalyticsChart received data:', {
      analytics,
      serverId,
      isArray: Array.isArray(analytics),
      length: analytics?.length,
      firstItem: analytics?.[0]
    })
  }, [analytics, serverId])

  // Check if analytics data exists and is valid
  if (!analytics) {
    return (
      <div className="card backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border border-white/20 shadow-2xl">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">📊 Analytics Trends</h3>
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">📊</span>
          </div>
          <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Analytics Loading...</h4>
          <p className="text-gray-600 dark:text-gray-300">Fetching analytics data for server {serverId}</p>
        </div>
      </div>
    )
  }

  if (!Array.isArray(analytics) || analytics.length === 0) {
    return (
      <div className="card backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border border-white/20 shadow-2xl">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">📊 Analytics Trends</h3>
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">📊</span>
          </div>
          <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Generating Analytics Data</h4>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Analytics data is being generated from your violation history. This may take a moment.
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="btn bg-blue-600 text-white hover:bg-blue-700"
          >
            🔄 Refresh Data
          </button>
        </div>
      </div>
    )
  }

  // Process and validate analytics data
  const chartData = analytics
    .filter(item => item && typeof item === 'object') // Filter out invalid items
    .map((item, index) => {
      // Handle different date formats
      let dateStr = 'Unknown'
      if (item.date) {
        try {
          const date = new Date(item.date)
          dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        } catch (e) {
          dateStr = `Day ${index + 1}`
        }
      } else {
        dateStr = `Day ${index + 1}`
      }

      return {
        date: dateStr,
        messages: Number(item.messages_processed || item.messages || 0),
        violations: Number(item.violations_detected || item.violations || 0),
        health: Math.round((item.community_health_score || item.health_score || 0) * 100),
        falsePositives: Number(item.false_positives || 0)
      }
    })
    .reverse() // Show chronologically (oldest to newest)

  console.log('📈 Processed chart data:', chartData)

  return (
    <div className="card backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border border-white/20 shadow-2xl">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">📊 Analytics Trends</h3>
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-gray-600 dark:text-gray-400">Messages</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-gray-600 dark:text-gray-400">Violations</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-gray-600 dark:text-gray-400">Health %</span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="messagesGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="violationsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="date" 
              className="text-xs text-gray-600 dark:text-gray-400"
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              className="text-xs text-gray-600 dark:text-gray-400"
              tick={{ fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
              }}
              labelFormatter={(label) => `Date: ${label}`}
              formatter={(value, name) => {
                if (name === 'health') return [value + '%', 'Health Score']
                if (name === 'violations') return [value, 'Violations']
                if (name === 'messages') return [value, 'Messages']
                return [value, name]
              }}
            />
            
            <Area
              type="monotone"
              dataKey="messages"
              stroke="#3b82f6"
              fillOpacity={1}
              fill="url(#messagesGradient)"
              strokeWidth={2}
            />
            
            <Line
              type="monotone"
              dataKey="violations"
              stroke="#ef4444"
              strokeWidth={2}
              dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#ef4444', strokeWidth: 2 }}
            />
            
            <Line
              type="monotone"
              dataKey="health"
              stroke="#22c55e"
              strokeWidth={2}
              dot={{ fill: '#22c55e', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#22c55e', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Stats */}
      <div className="mt-6 pt-6 border-t border-gray-200/50 dark:border-gray-700/50">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {apiHelpers.formatNumber(chartData.reduce((sum, item) => sum + item.messages, 0))}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Messages</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {chartData.reduce((sum, item) => sum + item.violations, 0)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Violations</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {chartData.length > 0 ? Math.round(chartData[chartData.length - 1].health) : 0}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Current Health</div>
          </div>
        </div>
      </div>

      {/* Debug panel in development */}
      {process.env.NODE_ENV === 'development' && chartData.length > 0 && (
        <details className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded">
          <summary className="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300">
            Debug: Chart Data ({chartData.length} points)
          </summary>
          <pre className="mt-2 text-xs text-gray-600 dark:text-gray-400 overflow-auto">
            {JSON.stringify(chartData, null, 2)}
          </pre>
        </details>
      )}
    </div>
  )
}

export default AnalyticsChart