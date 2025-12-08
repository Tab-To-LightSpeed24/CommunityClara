// frontend/src/components/Dashboard/Dashboard.jsx
// Fixed auto-selection and improved data handling

import React, { useState, useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { apiEndpoints, apiHelpers } from '../../services/api'
import StatsOverview from './StatsOverview'
import HealthScore from './HealthScore'
import ViolationsList from './ViolationsList'
import AnalyticsChart from './AnalyticsChart'
import ServerSelector from './ServerSelector'
import LoadingSpinner from '../Layout/LoadingSpinner'
import ErrorMessage from '../Layout/ErrorMessage'

const Dashboard = () => {
  const [selectedServerId, setSelectedServerId] = useState(null)
  const queryClient = useQueryClient()

  // Fetch servers list
  const { data: serversData, isLoading: serversLoading, error: serversError } = useQuery({
    queryKey: ['servers'],
    queryFn: () => apiEndpoints.getServers(),
    select: (response) => response.data
  })

  // IMPROVED: Auto-select first server immediately when servers load
  useEffect(() => {
    if (serversData?.servers?.length > 0 && !selectedServerId) {
      const firstServerId = serversData.servers[0].id
      setSelectedServerId(firstServerId)
      console.log('🎯 Dashboard: Auto-selected first server:', serversData.servers[0].name, 'ID:', firstServerId)
    }
  }, [serversData, selectedServerId])

  // Fetch dashboard data for selected server
  const { data: dashboardData, isLoading: dashboardLoading, error: dashboardError } = useQuery({
    queryKey: ['dashboard', selectedServerId],
    queryFn: () => apiEndpoints.getDashboardData(selectedServerId),
    enabled: !!selectedServerId, // Only run when server is selected
    select: (response) => {
      console.log('📊 Raw dashboard data received:', response.data)
      return response.data
    },
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 10000 // Consider data stale after 10 seconds
  })

  // Force refresh when server changes
  useEffect(() => {
    if (selectedServerId) {
      console.log('🔄 Dashboard: Refreshing data for server:', selectedServerId)
      queryClient.invalidateQueries(['dashboard', selectedServerId])
      queryClient.invalidateQueries(['server-stats', selectedServerId])
      queryClient.invalidateQueries(['server-violations', selectedServerId])
      queryClient.invalidateQueries(['server-analytics', selectedServerId])
    }
  }, [selectedServerId, queryClient])

  // Debug dashboard data
  useEffect(() => {
    if (dashboardData) {
      console.log('📊 Dashboard data structure:', {
        server_stats: dashboardData.server_stats,
        health_score: dashboardData.health_score,
        recent_analytics: dashboardData.recent_analytics,
        recent_violations: dashboardData.recent_violations,
        analytics_length: dashboardData.recent_analytics?.length || 0,
        violations_length: dashboardData.recent_violations?.length || 0
      })
    }
  }, [dashboardData])

  const handleServerChange = (serverId) => {
    console.log('🎯 Dashboard: Server changed to:', serverId)
    setSelectedServerId(serverId)
  }

  // Loading state for initial server fetch
  if (serversLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
        <span className="ml-3 text-lg text-gray-600 dark:text-gray-300">Loading servers...</span>
      </div>
    )
  }
  
  // Error state for server fetch
  if (serversError) {
    return (
      <ErrorMessage 
        title="Unable to load servers"
        message={apiHelpers.formatError(serversError)}
        onRetry={() => queryClient.invalidateQueries(['servers'])}
      />
    )
  }

  // No servers available
  if (!serversData?.servers?.length) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">🤖</span>
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No Servers Found</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Add the CommunityClara AI bot to your Discord servers to get started.
        </p>
        <a 
          href="https://discord.com/api/oauth2/authorize?client_id=YOUR_BOT_ID&permissions=8&scope=bot"
          target="_blank"
          rel="noopener noreferrer"
          className="btn bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700"
        >
          Add Bot to Server
        </a>
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      {/* Header with Server Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Moderation Dashboard</h2>
          <p className="text-gray-600 dark:text-gray-300">Monitor and manage your Discord server safety</p>
          {selectedServerId && (
            <p className="text-sm text-purple-600 dark:text-purple-400 mt-1">
              Server ID: {selectedServerId}
            </p>
          )}
        </div>
        
        <ServerSelector
          servers={serversData.servers}
          selectedServerId={selectedServerId}
          onServerChange={handleServerChange}
          loading={serversLoading}
          error={serversError}
        />
      </div>

      {/* Dashboard Content - Always show when server is selected */}
      {selectedServerId && (
        <>
          {dashboardLoading ? (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner />
              <span className="ml-3 text-gray-600 dark:text-gray-300">Loading dashboard data...</span>
            </div>
          ) : dashboardError ? (
            <ErrorMessage 
              title="Dashboard Error"
              message={apiHelpers.formatError(dashboardError)}
              onRetry={() => queryClient.invalidateQueries(['dashboard', selectedServerId])}
            />
          ) : dashboardData ? (
            <>
              {/* Stats Overview */}
              <StatsOverview stats={dashboardData.server_stats} />

              {/* Health Score and Analytics Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                  <HealthScore healthData={dashboardData.health_score} />
                </div>
                <div className="lg:col-span-2">
                  <AnalyticsChart 
                    analytics={dashboardData.recent_analytics} 
                    serverId={selectedServerId}
                  />
                </div>
              </div>

              {/* Recent Violations */}
              <ViolationsList 
                violations={dashboardData.recent_violations}
                serverId={selectedServerId}
              />

              {/* Debug Panel - Remove in production */}
              {process.env.NODE_ENV === 'development' && (
                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                  <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-2">Debug Info:</h4>
                  <pre className="text-xs text-gray-700 dark:text-gray-300 overflow-auto">
                    {JSON.stringify({
                      selectedServerId,
                      hasData: !!dashboardData,
                      statsKeys: dashboardData?.server_stats ? Object.keys(dashboardData.server_stats) : null,
                      analyticsCount: dashboardData?.recent_analytics?.length || 0,
                      violationsCount: dashboardData?.recent_violations?.length || 0
                    }, null, 2)}
                  </pre>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No Data Available</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Dashboard data will appear here once the server has some activity.
              </p>
              <button
                onClick={() => queryClient.invalidateQueries(['dashboard', selectedServerId])}
                className="btn bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700"
              >
                🔄 Refresh Data
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default Dashboard