// frontend/src/components/Dashboard/Dashboard.jsx
// Complete fixed version with proper auto-selection and data handling

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
    select: (response) => {
      console.log('🏠 Dashboard: Servers loaded:', response.data)
      return response.data
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    cacheTime: 5 * 60 * 1000  // 5 minutes
  })

  // Auto-select first server immediately when servers load
  useEffect(() => {
    if (serversData?.servers?.length > 0 && !selectedServerId) {
      const firstServer = serversData.servers[0]
      setSelectedServerId(firstServer.id)
      console.log('🎯 Dashboard: Auto-selected server:', {
        name: firstServer.name,
        id: firstServer.id
      })
    }
  }, [serversData?.servers, selectedServerId])

  // Fetch dashboard data for selected server
  const {
    data: dashboardData,
    isLoading: dashboardLoading,
    error: dashboardError,
    refetch: refetchDashboard
  } = useQuery({
    queryKey: ['dashboard', selectedServerId],
    queryFn: async () => {
      console.log('📊 Dashboard: Fetching data for server:', selectedServerId)
      const response = await apiEndpoints.getDashboardData(selectedServerId)
      console.log('📊 Dashboard: Raw API response:', response.data)
      return response.data
    },
    enabled: !!selectedServerId,
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 15000, // Consider data stale after 15 seconds
    retry: 2,
    retryDelay: 1000
  })

  // Force refresh dashboard data when server changes
  useEffect(() => {
    if (selectedServerId) {
      console.log('🔄 Dashboard: Server changed, refreshing data for:', selectedServerId)

      // Invalidate all related queries
      queryClient.invalidateQueries(['dashboard', selectedServerId])
      queryClient.invalidateQueries(['server-stats', selectedServerId])
      queryClient.invalidateQueries(['server-violations', selectedServerId])
      queryClient.invalidateQueries(['server-analytics', selectedServerId])
      queryClient.invalidateQueries(['server-health', selectedServerId])
    }
  }, [selectedServerId, queryClient])

  // Debug dashboard data structure
  useEffect(() => {
    if (dashboardData) {
      console.log('📊 Dashboard: Processed data structure:', {
        hasServerStats: !!dashboardData.server_stats,
        hasHealthScore: !!dashboardData.health_score,
        analyticsCount: dashboardData.recent_analytics?.length || 0,
        violationsCount: dashboardData.recent_violations?.length || 0,
        serverStatsKeys: dashboardData.server_stats ? Object.keys(dashboardData.server_stats) : [],
        analyticsStructure: dashboardData.recent_analytics?.[0] || null,
        violationsStructure: dashboardData.recent_violations?.[0] || null
      })
    }
  }, [dashboardData])

  const handleServerChange = (serverId) => {
    console.log('🎯 Dashboard: User selected server:', serverId)
    setSelectedServerId(serverId)
  }

  const handleRefresh = () => {
    console.log('🔄 Dashboard: Manual refresh triggered')
    if (selectedServerId) {
      queryClient.invalidateQueries(['dashboard', selectedServerId])
      refetchDashboard()
    }
  }

  // Show loading state while servers are loading
  if (serversLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">Loading servers...</p>
        </div>
      </div>
    )
  }

  // Show error state if servers failed to load
  if (serversError) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <ErrorMessage
          title="Unable to Load Servers"
          message={apiHelpers.formatError(serversError)}
          onRetry={() => queryClient.invalidateQueries(['servers'])}
        />
      </div>
    )
  }

  // Show no servers state
  if (!serversData?.servers?.length) {
    return (
      <div className="text-center py-16">
        <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
          <span className="text-white text-3xl">🤖</span>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">No Servers Found</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto">
          Add CommunityClara to your Discord servers to start monitoring and managing your community safety.
        </p>
        <a
          href="https://discord.com/oauth2/authorize?client_id=1399461751552213123&permissions=1099646233670&integration_type=0&scope=bot+applications.commands"
          target="_blank"
          rel="noopener noreferrer"
          className="btn bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-purple-500/25 transform hover:scale-105 transition-all duration-200"
        >
          <span className="mr-2">🚀</span>
          Add Bot to Server
        </a>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Server Selector */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 p-6 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-white/20 rounded-2xl shadow-lg">
        <div className="flex-1">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
            Moderation Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-1">
            Monitor and manage your Discord server safety in real-time
          </p>
          {selectedServerId && (
            <div className="flex items-center space-x-4 mt-2">
              <span className="text-sm text-purple-600 dark:text-purple-400 font-mono">
                Server ID: {selectedServerId}
              </span>
              <button
                onClick={handleRefresh}
                className="text-sm text-gray-500 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-200 flex items-center space-x-1"
              >
                <span>🔄</span>
                <span>Refresh</span>
              </button>
            </div>
          )}
        </div>

        <div className="flex-shrink-0">
          <ServerSelector
            servers={serversData.servers}
            selectedServerId={selectedServerId}
            onServerChange={handleServerChange}
            loading={serversLoading}
            error={serversError}
          />
        </div>
      </div>

      {/* Dashboard Content */}
      {selectedServerId ? (
        <>
          {dashboardLoading ? (
            <div className="min-h-[400px] flex items-center justify-center">
              <div className="text-center">
                <LoadingSpinner size="lg" />
                <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
                  Loading dashboard data...
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Server: {serversData.servers.find(s => s.id === selectedServerId)?.name}
                </p>
              </div>
            </div>
          ) : dashboardError ? (
            <div className="min-h-[400px] flex items-center justify-center">
              <ErrorMessage
                title="Dashboard Error"
                message={apiHelpers.formatError(dashboardError)}
                onRetry={handleRefresh}
              />
            </div>
          ) : dashboardData ? (
            <>
              {/* Stats Overview */}
              <StatsOverview
                stats={dashboardData.server_stats}
                serverId={selectedServerId}
              />

              {/* Health Score and Analytics Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                  <HealthScore
                    healthData={dashboardData.health_score}
                    serverId={selectedServerId}
                  />
                </div>
                <div className="lg:col-span-2">
                  <AnalyticsChart
                    analytics={dashboardData.recent_analytics}
                    violations={dashboardData.recent_violations}
                    serverId={selectedServerId}
                  />
                </div>
              </div>

              {/* Recent Violations */}
              <ViolationsList
                violations={dashboardData.recent_violations}
                serverId={selectedServerId}
                onViolationUpdate={handleRefresh}
              />

              {/* Development Debug Panel */}
              {process.env.NODE_ENV === 'development' && (
                <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                  <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                    <span className="mr-2">🐛</span>
                    Debug Information
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Server Info:</h5>
                      <pre className="text-xs text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 p-3 rounded overflow-auto">
                        {JSON.stringify({
                          selectedServerId,
                          serverName: serversData.servers.find(s => s.id === selectedServerId)?.name,
                          totalServers: serversData.servers.length
                        }, null, 2)}
                      </pre>
                    </div>

                    <div>
                      <h5 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Data Structure:</h5>
                      <pre className="text-xs text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 p-3 rounded overflow-auto">
                        {JSON.stringify({
                          hasData: !!dashboardData,
                          statsKeys: dashboardData?.server_stats ? Object.keys(dashboardData.server_stats) : null,
                          analyticsCount: dashboardData?.recent_analytics?.length || 0,
                          violationsCount: dashboardData?.recent_violations?.length || 0,
                          healthScore: dashboardData?.health_score?.health_score || 'N/A'
                        }, null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-2">
                No Dashboard Data
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Dashboard data will appear here once the server has some activity.
              </p>
              <button
                onClick={handleRefresh}
                className="btn bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700"
              >
                <span className="mr-2">🔄</span>
                Refresh Data
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🎯</span>
          </div>
          <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-2">
            Select a Server
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            Choose a server from the dropdown above to view its dashboard.
          </p>
        </div>
      )}
    </div>
  )
}

export default Dashboard