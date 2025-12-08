// frontend/src/components/Dashboard/TrendChart.jsx
import React from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadialBarChart, RadialBar, PieChart, Pie, Cell } from 'recharts'
import { apiHelpers } from '../../services/api'

const TrendChart = ({ data, type = 'area' }) => {
  // Enhanced gradient definitions
  const gradients = {
    messages: { id: 'messagesGlow', colors: ['#8B5CF6', '#A855F7', '#C084FC'] },
    violations: { id: 'violationsGlow', colors: ['#EF4444', '#F87171', '#FCA5A5'] },
    health: { id: 'healthGlow', colors: ['#10B981', '#34D399', '#6EE7B7'] },
    engagement: { id: 'engagementGlow', colors: ['#3B82F6', '#60A5FA', '#93C5FD'] }
  }

  // Return empty state if no real data provided
  if (!data || data.length === 0) {
    return (
      <div className="card backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border border-white/20 shadow-2xl">
        <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
          📈 Activity Trends
        </h3>
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">📈</span>
          </div>
          <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No Trend Data Available</h4>
          <p className="text-gray-600 dark:text-gray-400">Trend data will appear here once your server has activity.</p>
        </div>
      </div>
    )
  }

  // Use only real data
  const chartData = data


  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="backdrop-blur-sm bg-white/90 dark:bg-gray-900/90 border border-white/20 rounded-xl p-4 shadow-2xl">
          <p className="font-semibold text-gray-800 dark:text-gray-200 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center space-x-2 mb-1">
              <div 
                className="w-3 h-3 rounded-full shadow-lg"
                style={{ backgroundColor: entry.color, boxShadow: `0 0 10px ${entry.color}50` }}
              ></div>
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {entry.name}: <span className="font-bold">{entry.value}</span>
              </span>
            </div>
          ))}
        </div>
      )
    }
    return null
  }

  if (type === 'radial') {
    const radialData = [
      { name: 'Health Score', value: chartData[chartData.length - 1]?.health || 85, fill: '#10B981' },
      { name: 'Engagement', value: chartData[chartData.length - 1]?.engagement || 75, fill: '#3B82F6' },
      { name: 'Safety Index', value: 90, fill: '#8B5CF6' }
    ]

    return (
      <div className="card backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border border-white/20 shadow-2xl hover:shadow-purple-500/10 transition-all duration-300">
        <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
          📊 Performance Metrics
        </h3>
        
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="80%" data={radialData}>
              <RadialBar 
                dataKey="value" 
                cornerRadius={10} 
                fill="url(#radialGradient)"
                className="drop-shadow-lg"
              />
              <Tooltip content={<CustomTooltip />} />
              <defs>
                <linearGradient id="radialGradient" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#8B5CF6" />
                  <stop offset="50%" stopColor="#3B82F6" />
                  <stop offset="100%" stopColor="#10B981" />
                </linearGradient>
              </defs>
            </RadialBarChart>
          </ResponsiveContainer>
        </div>
      </div>
    )
  }

  if (type === 'pie') {
    const pieData = [
      { name: 'Clean Messages', value: 85, color: '#10B981' },
      { name: 'Flagged Content', value: 10, color: '#F59E0B' },
      { name: 'Violations', value: 5, color: '#EF4444' }
    ]

    return (
      <div className="card backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border border-white/20 shadow-2xl hover:shadow-green-500/10 transition-all duration-300">
        <h3 className="text-xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-6">
          🥧 Content Distribution
        </h3>
        
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                className="drop-shadow-lg"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="flex justify-center space-x-6 mt-4">
          {pieData.map((entry, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full shadow-lg"
                style={{ backgroundColor: entry.color, boxShadow: `0 0 8px ${entry.color}50` }}
              ></div>
              <span className="text-sm text-gray-600 dark:text-gray-300">{entry.name}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="card backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border border-white/20 shadow-2xl hover:shadow-blue-500/10 transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          📈 Activity Trends
        </h3>
        <div className="flex items-center space-x-4">
          {Object.entries(gradients).map(([key, gradient]) => (
            <div key={key} className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full shadow-lg animate-pulse"
                style={{ 
                  backgroundColor: gradient.colors[0],
                  boxShadow: `0 0 10px ${gradient.colors[0]}50`
                }}
              ></div>
              <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">{key}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              {Object.entries(gradients).map(([key, gradient]) => (
                <linearGradient key={gradient.id} id={gradient.id} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={gradient.colors[0]} stopOpacity={0.8}/>
                  <stop offset="50%" stopColor={gradient.colors[1]} stopOpacity={0.4}/>
                  <stop offset="95%" stopColor={gradient.colors[2]} stopOpacity={0.1}/>
                </linearGradient>
              ))}
              
              {/* Glow effects */}
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge> 
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
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
            <Tooltip content={<CustomTooltip />} />
            
            <Area
              type="monotone"
              dataKey="messages"
              stroke="#8B5CF6"
              strokeWidth={3}
              fill="url(#messagesGlow)"
              filter="url(#glow)"
              dot={{ r: 4, strokeWidth: 2, fill: '#8B5CF6' }}
              activeDot={{ r: 6, strokeWidth: 2, fill: '#8B5CF6', filter: 'url(#glow)' }}
            />
            
            <Area
              type="monotone"
              dataKey="health"
              stroke="#10B981"
              strokeWidth={3}
              fill="url(#healthGlow)"
              filter="url(#glow)"
              dot={{ r: 4, strokeWidth: 2, fill: '#10B981' }}
              activeDot={{ r: 6, strokeWidth: 2, fill: '#10B981', filter: 'url(#glow)' }}
            />
            
            <Area
              type="monotone"
              dataKey="violations"
              stroke="#EF4444"
              strokeWidth={3}
              fill="url(#violationsGlow)"
              filter="url(#glow)"
              dot={{ r: 4, strokeWidth: 2, fill: '#EF4444' }}
              activeDot={{ r: 6, strokeWidth: 2, fill: '#EF4444', filter: 'url(#glow)' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Animated statistics */}
      <div className="mt-6 pt-6 border-t border-gray-200/50 dark:border-gray-700/50">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center group">
            <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">
              {apiHelpers.formatNumber(chartData.reduce((sum, item) => sum + item.messages, 0))}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Total Messages</div>
          </div>
          <div className="text-center group">
            <div className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">
              {chartData.length > 0 ? chartData[chartData.length - 1].health : 0}%
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Health Score</div>
          </div>
          <div className="text-center group">
            <div className="text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">
              {chartData.reduce((sum, item) => sum + item.violations, 0)}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Violations</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TrendChart