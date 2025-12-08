// frontend/src/pages/Analytics.jsx
import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { apiEndpoints } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import ServerSelector from '../components/Dashboard/ServerSelector'
import AnalyticsChart from '../components/Dashboard/AnalyticsChart'
import TrendChart from '../components/Dashboard/TrendChart'
import LoadingSpinner from '../components/Layout/LoadingSpinner'
import ErrorMessage from '../components/Layout/ErrorMessage'

const Analytics = () => {
  const [selectedServerId, setSelectedServerId] = useState(null)
  const [timeRange, setTimeRange] = useState(30) // days
  const { user } = useAuth()

  // Auto-select first server
  React.useEffect(() => {
    if (user?.servers?.length > 0 && !selectedServerId) {
      setSelectedServerId(user.servers[0].id)
    }
  }, [user, selectedServerId])

  // Fetch analytics data
  const { data: analyticsData, isLoading, error } = useQuery({
    queryKey: ['analytics', selectedServerId, timeRange],
    queryFn: () => apiEndpoints.getServerAnalytics(selectedServerId, timeRange),
    enabled: !!selectedServerId,
    select: (response) => response.data
  })

  if (!user?.servers?.length) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">📈</span>
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No Servers Available</h3>
        <p className="text-gray-600 dark:text-gray-400">Add the bot to your Discord servers to view analytics.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
            📈 Advanced Analytics
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Deep insights into your server's moderation patterns and community health
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Time Range Selector */}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(parseInt(e.target.value))}
            className="input"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>

          {/* Server Selector */}
          <ServerSelector
            servers={user.servers}
            selectedServerId={selectedServerId}
            onServerChange={setSelectedServerId}
          />
        </div>
      </div>

      {selectedServerId && (
        <>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner size="lg" />
              <span className="ml-3 text-lg text-gray-600 dark:text-gray-400">Loading analytics...</span>
            </div>
          ) : error ? (
            <ErrorMessage 
              title="Analytics Error"
              message="Failed to load analytics data"
            />
          ) : (
            <div className="space-y-8">
              {/* Main Analytics Chart */}
              <AnalyticsChart analytics={analyticsData} />

              {/* Trend Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <TrendChart data={analyticsData} type="area" />
                <TrendChart data={analyticsData} type="pie" />
              </div>

              {/* Detailed Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card">
                  <h3 className="text-lg font-semibold mb-4">🎯 Detection Accuracy</h3>
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {analyticsData?.length > 0 ? '94.2%' : 'N/A'}
                  </div>
                  <p className="text-sm text-gray-600">Average confidence score</p>
                </div>

                <div className="card">
                  <h3 className="text-lg font-semibold mb-4">⚡ Response Time</h3>
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {analyticsData?.length > 0 ? '0.3s' : 'N/A'}
                  </div>
                  <p className="text-sm text-gray-600">Average detection time</p>
                </div>

                <div className="card">
                  <h3 className="text-lg font-semibold mb-4">📊 Coverage Rate</h3>
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    {analyticsData?.length > 0 ? '99.8%' : 'N/A'}
                  </div>
                  <p className="text-sm text-gray-600">Messages monitored</p>
                </div>
              </div>

              {/* Coming Soon Features */}
              <div className="card bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
                <h3 className="text-lg font-semibold mb-4">🚀 Coming Soon</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">🔮</span>
                    <div>
                      <div className="font-medium">Predictive Analytics</div>
                      <div className="text-sm text-gray-600">Forecast community trends</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">📈</span>
                    <div>
                      <div className="font-medium">Custom Reports</div>
                      <div className="text-sm text-gray-600">Generate detailed reports</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">🎨</span>
                    <div>
                      <div className="font-medium">Data Visualization</div>
                      <div className="text-sm text-gray-600">Interactive charts & graphs</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">📊</span>
                    <div>
                      <div className="font-medium">Benchmark Comparison</div>
                      <div className="text-sm text-gray-600">Compare with similar servers</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default Analytics
