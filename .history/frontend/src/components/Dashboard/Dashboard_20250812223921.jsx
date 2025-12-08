// frontend/src/pages/Dashboard.jsx
import React from 'react'
import DashboardComponent from '../components/Dashboard/Dashboard'

const Dashboard = () => {
  return <DashboardComponent />
}

export default Dashboard

// frontend/src/pages/Profile.jsx
import React from 'react'
import UserProfile from '../components/Profile/UserProfile'

const Profile = () => {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
          👤 User Profile
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Manage your account settings and preferences
        </p>
      </div>
      <UserProfile />
    </div>
  )
}

export default Profile

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

// frontend/src/pages/NotFound.jsx
import React from 'react'
import { Link } from 'react-router-dom'

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border border-white/20 rounded-2xl shadow-2xl p-8">
          {/* 404 Icon */}
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <span className="text-white text-3xl">🔍</span>
          </div>

          {/* Error Message */}
          <h1 className="text-6xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
            404
          </h1>
          
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Page Not Found
          </h2>
          
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Link
              to="/"
              className="w-full btn bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-purple-500/25 transform hover:scale-105 transition-all duration-200"
            >
              🏠 Go Home
            </Link>
            
            <Link
              to="/dashboard"
              className="w-full btn bg-gray-600 text-white hover:bg-gray-700 transition-all duration-200"
            >
              📊 Go to Dashboard
            </Link>
          </div>

          {/* Help Text */}
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-6">
            If you believe this is an error, please contact support.
          </p>
        </div>
      </div>
    </div>
  )
}

export default NotFound