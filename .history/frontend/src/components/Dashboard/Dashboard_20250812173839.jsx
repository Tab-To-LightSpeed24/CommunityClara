// frontend/src/components/Dashboard/Dashboard.jsx
import React, { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { apiEndpoints, apiHelpers } from '../../services/api'
import StatsOverview from './StatsOverview'
import HealthScore from './HealthScore'
import ViolationsList from './ViolationsList'
import AnalyticsChart from './AnalyticsChart'
import LearningInsights from './LearningInsights'
import ServerSelector from './ServerSelector'
import LoadingSpinner from '../Layout/LoadingSpinner'
import ErrorMessage from '../Layout/ErrorMessage'

const Dashboard = () => {
  const [selectedServerId, setSelectedServerId] = useState(null)
  const [refreshing, setRefreshing] = useState(false)
  const queryClient = useQueryClient()

  // Fetch servers list
  const { data: serversData, isLoading: serversLoading, error: serversError } = useQuery({
    queryKey: ['servers'],
    queryFn: () => apiEndpoints.getServers(),
    select: (response) => response.data
  })

  // Fetch dashboard data for selected server
  const { data: dashboardData, isLoading: dashboardLoading, error: dashboardError, refetch } = useQuery({
    queryKey: ['dashboard', selectedServerId],
    queryFn: () => apiEndpoints.getDashboardData(selectedServerId),
    enabled: !!selectedServerId,
    select: (response) => response.data,
    refetchInterval: 30000 // Refresh every 30 seconds
  })
  
  // Auto-select first server if none selected
  React.useEffect(() => {
    if (serversData?.servers?.length > 0 && !selectedServerId) {
      setSelectedServerId(serversData.servers[0].id)
    }
  }, [serversData, selectedServerId])

  // Manual refresh function
  const handleRefresh = async () => {
    if (!selectedServerId) return
    
    setRefreshing(true)
    try {
      // Invalidate all related queries
      await queryClient.invalidateQueries(['dashboard', selectedServerId])
      await queryClient.invalidateQueries(['servers'])
      await queryClient.invalidateQueries(['server-stats', selectedServerId])
      await queryClient.invalidateQueries(['server-violations', selectedServerId])
      await queryClient.invalidateQueries(['server-analytics', selectedServerId])
      await queryClient.invalidateQueries(['server-health', selectedServerId])
      
      // Force refetch dashboard data
      await refetch()
      
      console.log('✅ Dashboard refreshed successfully')
    } catch (error) {
      console.error('❌ Dashboard refresh failed:', error)
    } finally {
      setRefreshing(false)
    }
  }

  if (serversLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
        <span className="ml-3 text-lg text-gray-600">Loading servers...</span>
      </div>
    )
  }
  
  if (serversError) {
    return (
      <ErrorMessage 
        title="Unable to load servers"
        message={apiHelpers.formatError(serversError)}
      />
    )
  }

  if (!serversData?.servers?.length) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">🤖</span>
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No Servers Found</h3>
        <p className="text-gray-600 mb-4">
          Add the CommunityClara AI bot to your Discord servers to get started.
        </p>
        <a 
          href="https://discord.com/api/oauth2/authorize?client_id=YOUR_BOT_ID&permissions=8&scope=bot"
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary"
        >
          Add Bot to Server
        </a>
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      {/* Header with Server Selector and Refresh Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Moderation Dashboard</h2>
          <p className="text-gray-600 dark:text-gray-400">Monitor and manage your Discord server safety</p>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={refreshing || !selectedServerId}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            title="Refresh dashboard data"
          >
            <span className={`mr-2 ${refreshing ? 'animate-spin' : ''}`}>
              {refreshing ? '⟳' : '🔄'}
            </span>
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>

          {/* Server Selector */}
          <ServerSelector
            servers={serversData.servers}
            selectedServerId={selectedServerId}
            onServerChange={setSelectedServerId}
          />
        </div>
      </div>

      {/* Dashboard Content */}
      {selectedServerId && (
        <>
          {dashboardLoading ? (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner />
              <span className="ml-3 text-gray-600">Loading dashboard...</span>
            </div>
          ) : dashboardError ? (
            <ErrorMessage 
              title="Dashboard Error"
              message={apiHelpers.formatError(dashboardError)}
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
                  <AnalyticsChart analytics={dashboardData.recent_analytics} />
                </div>
              </div>

              {/* Learning Insights */}
              <LearningInsights serverId={selectedServerId} />

              {/* Recent Violations */}
              <ViolationsList 
                violations={dashboardData.recent_violations}
                serverId={selectedServerId}
              />
            </>
          ) : null}
        </>
      )}
    </div>
  )
}

export default Dashboard