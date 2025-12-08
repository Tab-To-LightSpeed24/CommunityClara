// frontend/src/components/Dashboard/AnalyticsChart.jsx
import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { apiHelpers } from '../../services/api'

const AnalyticsChart = ({ analytics }) => {
  // Return empty state if no real analytics data
  if (!analytics || analytics.length === 0) {
    return (
      <div className="card backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border border-white/20 shadow-2xl">
        <h3 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
          📊 Analytics Trends
        </h3>
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">📊</span>
          </div>
          <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No Analytics Data Available</h4>
          <p className="text-gray-600 dark:text-gray-400">Analytics data will appear here once your server has some activity.</p>
        </div>
      </div>
    )
  }

  // Prepare data for charts using real analytics data only
  const chartData = analytics.map((item) => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    messages: item.messages_processed,
    violations: item.violations_detected,
    health: Math.round(item.community_health_score * 100),
    falsePositives: item.false_positives
  }))

  return (
    <div className="card backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border border-white/20 shadow-2xl hover:shadow-purple-500/10 transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          📊 Analytics Trends
        </h3>
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full shadow-lg shadow-blue-500/50"></div>
            <span className="text-gray-600 dark:text-gray-400">Messages</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full shadow-lg shadow-red-500/50"></div>
            <span className="text-gray-600 dark:text-gray-400">Violations</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full shadow-lg shadow-green-500/50"></div>
            <span className="text-gray-600 dark:text-gray-400">Health Score</span>
          </div>
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="messagesGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                <stop offset="50%" stopColor="#3b82f6" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="violationsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                <stop offset="50%" stopColor="#ef4444" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="healthGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
                <stop offset="50%" stopColor="#22c55e" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" opacity={0.3} />
            <XAxis 
              dataKey="date" 
              stroke="#6b7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="#6b7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                backdropFilter: 'blur(10px)'
              }}
              formatter={(value, name) => {
                if (name === 'health') return [`${value}%`, 'Health Score']
                if (name === 'messages') return [apiHelpers.formatNumber(value), 'Messages']
                if (name === 'violations') return [value, 'Violations']
                return [value, name]
              }}
            />
            
            <Area
              type="monotone"
              dataKey="messages"
              stroke="#3b82f6"
              fillOpacity={1}
              fill="url(#messagesGradient)"
              strokeWidth={3}
            />
            
            <Line
              type="monotone"
              dataKey="violations"
              stroke="#ef4444"
              strokeWidth={3}
              dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#ef4444', strokeWidth: 2 }}
            />
            
            <Line
              type="monotone"
              dataKey="health"
              stroke="#22c55e"
              strokeWidth={3}
              dot={{ fill: '#22c55e', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#22c55e', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Enhanced Summary Stats */}
      <div className="mt-6 pt-6 border-t border-gray-200/50 dark:border-gray-700/50">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center group">
            <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">
              {apiHelpers.formatNumber(chartData.reduce((sum, item) => sum + item.messages, 0))}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">Total Messages</div>
            <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Avg: {Math.round(chartData.reduce((sum, item) => sum + item.messages, 0) / chartData.length)}/day
            </div>
          </div>
          <div className="text-center group">
            <div className="text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">
              {chartData.reduce((sum, item) => sum + item.violations, 0)}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">Total Violations</div>
            <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Rate: {((chartData.reduce((sum, item) => sum + item.violations, 0) / chartData.reduce((sum, item) => sum + item.messages, 0)) * 100).toFixed(1)}%
            </div>
          </div>
          <div className="text-center group">
            <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">
              {chartData.length > 0 ? Math.round(chartData[chartData.length - 1].health) : 0}%
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">Current Health</div>
            <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Trend: {chartData.length > 1 ? 
                (chartData[chartData.length - 1].health > chartData[chartData.length - 2].health ? '📈 +' : '📉 ') +
                Math.abs(chartData[chartData.length - 1].health - chartData[chartData.length - 2].health).toFixed(1) + '%'
                : 'Stable'
              }
            </div>
          </div>
        </div>
      </div>

      {/* Data Status Indicator - Removed demo data indicator */}
    </div>
  )
}

export default AnalyticsChart