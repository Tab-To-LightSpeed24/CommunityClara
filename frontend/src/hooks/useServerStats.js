// frontend/src/hooks/useServerStats.js
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { apiEndpoints } from '../services/api'

export const useServerStats = (serverId, options = {}) => {
  const queryClient = useQueryClient()

  const {
    data,
    isLoading,
    error,
    refetch,
    isSuccess,
    isFetching
  } = useQuery({
    queryKey: ['server-stats', serverId],
    queryFn: () => apiEndpoints.getServerStats(serverId),
    enabled: !!serverId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchInterval: options.realTime ? 30000 : false, // 30 seconds for real-time
    refetchOnWindowFocus: false,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    select: (response) => response.data,
    ...options
  })

  // Prefetch related data
  const prefetchAnalytics = () => {
    if (serverId) {
      queryClient.prefetchQuery({
        queryKey: ['server-analytics', serverId],
        queryFn: () => apiEndpoints.getServerAnalytics(serverId),
        staleTime: 2 * 60 * 1000
      })
    }
  }

  const prefetchHealth = () => {
    if (serverId) {
      queryClient.prefetchQuery({
        queryKey: ['server-health', serverId],
        queryFn: () => apiEndpoints.getServerHealth(serverId),
        staleTime: 1 * 60 * 1000
      })
    }
  }

  const prefetchViolations = () => {
    if (serverId) {
      queryClient.prefetchQuery({
        queryKey: ['server-violations', serverId],
        queryFn: () => apiEndpoints.getServerViolations(serverId),
        staleTime: 1 * 60 * 1000
      })
    }
  }

  // Invalidate and refetch server data
  const refreshServerData = () => {
    if (serverId) {
      queryClient.invalidateQueries({ queryKey: ['server-stats', serverId] })
      queryClient.invalidateQueries({ queryKey: ['server-analytics', serverId] })
      queryClient.invalidateQueries({ queryKey: ['server-health', serverId] })
      queryClient.invalidateQueries({ queryKey: ['server-violations', serverId] })
    }
  }

  // Update server stats in cache
  const updateServerStats = (newStats) => {
    if (serverId) {
      queryClient.setQueryData(['server-stats', serverId], (oldData) => ({
        ...oldData,
        data: { ...oldData?.data, ...newStats }
      }))
    }
  }

  return {
    // Data
    stats: data,
    
    // States
    isLoading,
    isFetching,
    isSuccess,
    error,
    
    // Actions
    refetch,
    refreshServerData,
    updateServerStats,
    
    // Prefetch functions
    prefetchAnalytics,
    prefetchHealth,
    prefetchViolations,
    
    // Computed values
    hasData: !!data,
    healthScore: data?.health_score || 0,
    totalMessages: data?.total_messages || 0,
    totalViolations: data?.total_violations || 0,
    falsePositives: data?.false_positives || 0,
    isHealthy: (data?.health_score || 0) > 0.7,
    violationRate: data?.total_messages ? (data.total_violations / data.total_messages) : 0,
    accuracy: data?.false_positives && data?.total_violations 
      ? 1 - (data.false_positives / data.total_violations) 
      : 1
  }
}

export const useServerAnalytics = (serverId, days = 7, options = {}) => {
  return useQuery({
    queryKey: ['server-analytics', serverId, days],
    queryFn: () => apiEndpoints.getServerAnalytics(serverId, days),
    enabled: !!serverId,
    staleTime: 2 * 60 * 1000,
    select: (response) => response.data,
    ...options
  })
}

export const useServerHealth = (serverId, options = {}) => {
  return useQuery({
    queryKey: ['server-health', serverId],
    queryFn: () => apiEndpoints.getServerHealth(serverId),
    enabled: !!serverId,
    staleTime: 1 * 60 * 1000,
    refetchInterval: options.realTime ? 60000 : false, // 1 minute for health
    select: (response) => response.data,
    ...options
  })
}

export const useServerViolations = (serverId, limit = 50, options = {}) => {
  return useQuery({
    queryKey: ['server-violations', serverId, limit],
    queryFn: () => apiEndpoints.getServerViolations(serverId, limit),
    enabled: !!serverId,
    staleTime: 30 * 1000, // 30 seconds for violations
    refetchInterval: options.realTime ? 30000 : false,
    select: (response) => response.data,
    ...options
  })
}

export const useDashboardData = (serverId, options = {}) => {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['dashboard', serverId],
    queryFn: () => apiEndpoints.getDashboardData(serverId),
    enabled: !!serverId,
    staleTime: 30 * 1000,
    refetchInterval: options.realTime ? 30000 : false,
    select: (response) => response.data,
    ...options
  })

  const refreshDashboard = () => {
    if (serverId) {
      queryClient.invalidateQueries({ queryKey: ['dashboard', serverId] })
    }
  }

  return {
    ...query,
    refreshDashboard,
    dashboardData: query.data,
    serverStats: query.data?.server_stats,
    recentAnalytics: query.data?.recent_analytics,
    recentViolations: query.data?.recent_violations,
    healthScore: query.data?.health_score,
    violationTrends: query.data?.violation_trends
  }
}

export const useRealTimeStats = (serverId) => {
  return useServerStats(serverId, { realTime: true })
}

// Custom hook for server list
export const useServers = (options = {}) => {
  return useQuery({
    queryKey: ['servers'],
    queryFn: () => apiEndpoints.getServers(),
    staleTime: 5 * 60 * 1000,
    select: (response) => response.data,
    ...options
  })
}