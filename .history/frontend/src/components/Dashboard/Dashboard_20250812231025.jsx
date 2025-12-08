import React, { useState } from 'react'
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

  // Fetch dashboard data for selected server
  const { data: dashboardData, isLoading: dashboardLoading, error: dashboardError } = useQuery({
    queryKey: ['dashboard', selectedServerId],
    queryFn: () => apiEndpoints.getDashboardData(selectedServerId),
    enabled: !!selectedServerId,
    select: (response) => response.data,
    refetchInterval: 30000
  })

  return (
    <div className="space-y-6">
      {/* Server Selector */}
      <ServerSelector
        servers={serversData?.servers || []}
        selectedServerId={selectedServerId}
        onServerSelect={setSelectedServerId}
        isLoading={serversLoading}
        error={serversError}
      />

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