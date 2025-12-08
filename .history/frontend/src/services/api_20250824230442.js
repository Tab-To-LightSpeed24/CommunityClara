// frontend/src/services/api.js

import axios from 'axios';

// API base configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ API Response Error:', error.response?.data || error.message);
    
    // Handle common error scenarios
    if (error.response?.status === 404) {
      console.warn('🔍 Resource not found');
    } else if (error.response?.status === 500) {
      console.error('🔥 Server error occurred');
    } else if (error.code === 'NETWORK_ERROR') {
      console.error('🌐 Network connection failed');
    }
    
    return Promise.reject(error);
  }
);

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('safespace_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle 401 responses (add after existing response interceptor)
const existingResponseInterceptor = api.interceptors.response.handlers[0]

api.interceptors.response.use(
  existingResponseInterceptor.fulfilled,
  (error) => {
    // Handle auth errors
    if (error.response?.status === 401) {
      localStorage.removeItem('safespace_token')
      // Don't redirect automatically, let AuthContext handle it
      console.warn('🔒 Authentication expired, token removed')
    }
    
    // Call existing error handler
    return existingResponseInterceptor.rejected(error)
  }
)



// API endpoints
export const apiEndpoints = {
  // Health check
  health: () => api.get('/health'),
  
  // Server management
  getServers: () => api.get('/api/v1/servers'),
  getServerStats: (serverId) => api.get(`/api/v1/servers/${serverId}/stats`),
  getServerAnalytics: (serverId, days = 7) => api.get(`/api/v1/servers/${serverId}/analytics?days=${days}`),
  getServerViolations: (serverId, limit = 50) => api.get(`/api/v1/servers/${serverId}/violations?limit=${limit}`),
  getServerHealth: (serverId) => api.get(`/api/v1/servers/${serverId}/health`),
  getDashboardData: (serverId) => api.get(`/api/v1/servers/${serverId}/dashboard`),
  getLearningInsights: (serverId) => api.get(`/api/v1/servers/${serverId}/insights`),
  
  // Server settings endpoints
  getServerSettings: (serverId) => {
    console.log('🏠 API: Getting server settings:', { serverId })
    
    return api.get(`/api/v1/servers/${serverId}/settings`)
      .then(response => {
        console.log('✅ API: Server settings loaded:', response.data)
        return response
      })
      .catch(error => {
        console.error('❌ API: Server settings load failed:', error.response?.data || error.message)
        // If settings endpoint doesn't exist, throw the error to trigger fallback
        throw error
      })
  },
  sendContactMessage: (contactData) => {
    console.log('📧 API: Sending contact message:', contactData)
    
    return api.post('/api/contact/send', contactData)
      .then(response => {
        console.log('✅ API: Contact message sent:', response.data)
        return response
      })
      .catch(error => {
        console.error('❌ API: Contact message failed:', error.response?.data || error.message)
        throw error
      })
  },

  updateServerSettings: (serverId, settings) => {
    console.log('🏠 API: Updating server settings:', { serverId, settings })
    
    return api.post(`/api/v1/servers/${serverId}/settings`, settings)
      .then(response => {
        console.log('✅ API: Server settings updated:', response.data)
        return response
      })
      .catch(error => {
        console.error('❌ API: Server settings update failed:', error.response?.data || error.message)
        throw error
      })
  },

  // Bot configuration endpoints
  updateServerConfig: (serverId, config) => {
    console.log('🤖 API: Updating server config:', { serverId, config })
    
    return api.post(`/api/v1/servers/${serverId}/config`, config)
      .then(response => {
        console.log('✅ API: Config update successful:', response.data)
        return response
      })
      .catch(error => {
        console.error('❌ API: Config update failed:', error.response?.data || error.message)
        throw error
      })
  },

  // Server name update
  updateServerName: (serverId, name) => {
    console.log('🏷️ API: Updating server name:', { serverId, name })
    
    return api.put(`/api/v1/servers/${serverId}/name`, { name })
      .then(response => {
        console.log('✅ API: Server name updated:', response.data)
        return response
      })
      .catch(error => {
        console.error('❌ API: Server name update failed:', error.response?.data || error.message)
        throw error
      })
  },

  // Content analysis
  analyzeContent: (content, contentType = 'text') => {
    console.log('🔍 API: Analyzing content:', { contentType, length: content?.length })
    
    return api.post('/api/v1/analyze', {
      content,
      content_type: contentType
    })
      .then(response => {
        console.log('✅ API: Content analysis complete:', response.data)
        return response
      })
      .catch(error => {
        console.error('❌ API: Content analysis failed:', error.response?.data || error.message)
        throw error
      })
  },
  
  // Feedback system
  reportViolationFeedback: (serverId, violationId, isFalsePositive) => {
    console.log(`🔧 API: Sending feedback: serverId=${serverId}, violationId=${violationId}, isFalsePositive=${isFalsePositive}`)
    
    return api.post(
      `/api/v1/servers/${serverId}/violations/${violationId}/feedback`,
      { is_false_positive: isFalsePositive },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
      .then(response => {
        console.log('✅ API: Feedback submitted successfully:', response.data)
        return response
      })
      .catch(error => {
        console.error('❌ API: Feedback submission failed:', error.response?.data || error.message)
        throw error
      })
  },

  // Test endpoints
  testConnection: () => {
    console.log('🔌 API: Testing connection...')
    
    return api.get('/health')
      .then(response => {
        console.log('✅ API: Connection test successful:', response.data)
        return response
      })
      .catch(error => {
        console.error('❌ API: Connection test failed:', error.response?.data || error.message)
        throw error
      })
  },

  // Debug endpoints
  debugFeedback: (data) => {
    console.log('🔧 API: Debug feedback endpoint:', data)
    
    return api.post('/api/v1/debug/feedback', data)
      .then(response => {
        console.log('✅ API: Debug feedback successful:', response.data)
        return response
      })
      .catch(error => {
        console.error('❌ API: Debug feedback failed:', error.response?.data || error.message)
        throw error
      })
  },
  // User preferences and notifications
  updateUserPreferences: (preferences) => {
    console.log('🔧 API: Updating user preferences:', preferences)
    
    return api.put('/api/v1/user/preferences', preferences)
      .then(response => {
        console.log('✅ API: User preferences updated:', response.data)
        return response
      })
      .catch(error => {
        console.error('❌ API: User preferences update failed:', error.response?.data || error.message)
        throw error
      })
  },

  // Notification endpoints - FIXED
  getUserNotifications: () => {
    console.log('🔔 API: Getting user notifications...')
    
    return api.get('/api/v1/user/notifications')
      .then(response => {
        console.log('✅ API: User notifications loaded:', response.data)
        return response
      })
      .catch(error => {
        console.error('❌ API: User notifications load failed:', error.response?.data || error.message)
        throw error
      })
  },

  markNotificationRead: (notificationId) => {
    console.log('📖 API: Marking notification as read:', notificationId)
    
    return api.put(`/api/v1/user/notifications/${notificationId}/read`)
      .then(response => {
        console.log('✅ API: Notification marked as read:', response.data)
        return response
      })
      .catch(error => {
        console.error('❌ API: Mark notification read failed:', error.response?.data || error.message)
        throw error
      })
  },

  deleteNotification: (notificationId) => {
    console.log('🗑️ API: Deleting notification:', notificationId)
    
    return api.delete(`/api/v1/user/notifications/${notificationId}`)
      .then(response => {
        console.log('✅ API: Notification deleted:', response.data)
        return response
      })
      .catch(error => {
        console.error('❌ API: Delete notification failed:', error.response?.data || error.message)
        throw error
      })
  },

  markAllNotificationsRead: () => {
    console.log('📖 API: Marking all notifications as read...')
    
    return api.put('/api/v1/user/notifications/mark-all-read')
      .then(response => {
        console.log('✅ API: All notifications marked as read:', response.data)
        return response
      })
      .catch(error => {
        console.error('❌ API: Mark all notifications read failed:', error.response?.data || error.message)
        throw error
      })
  },

  // Generate analytics data
  generateAnalyticsData: (serverId) => {
    console.log('📊 API: Generating analytics data for server:', serverId)
    
    return api.post(`/api/v1/servers/${serverId}/analytics/generate`)
      .then(response => {
        console.log('✅ API: Analytics data generated:', response.data)
        return response
      })
      .catch(error => {
        console.error('❌ API: Analytics generation failed:', error.response?.data || error.message)
        throw error
      })
  },

  // Authentication endpoints
  googleAuth: (token) => {
    console.log('🔐 API: Google authentication...')
    return api.post('/api/v1/auth/google', { token })
      .then(response => {
        console.log('✅ API: Google auth successful:', response.data)
        return response
      })
      .catch(error => {
        console.error('❌ API: Google auth failed:', error.response?.data || error.message)
        throw error
      })
  },

  getCurrentUser: () => {
    console.log('👤 API: Getting current user...')
    return api.get('/api/v1/auth/me')
      .then(response => {
        console.log('✅ API: Current user loaded:', response.data)
        return response
      })
      .catch(error => {
        console.error('❌ API: Get current user failed:', error.response?.data || error.message)
        throw error
      })
  },

  updateProfile: (profileData) => {
    console.log('📝 API: Updating profile...', profileData)
    return api.put('/api/v1/auth/profile', profileData)
      .then(response => {
        console.log('✅ API: Profile updated:', response.data)
        return response
      })
      .catch(error => {
        console.error('❌ API: Profile update failed:', error.response?.data || error.message)
        throw error
      })
  },

  logout: () => {
    console.log('🚪 API: Logging out...')
    return api.post('/api/v1/auth/logout')
      .then(response => {
        console.log('✅ API: Logout successful:', response.data)
        return response
      })
      .catch(error => {
        console.error('❌ API: Logout failed:', error.response?.data || error.message)
        throw error
      })
  }



  
};

// Helper functions
export const apiHelpers = {
  // Format error messages for display
  formatError: (error) => {
    if (error.response?.data?.detail) {
      return error.response.data.detail;
    } else if (error.response?.data?.message) {
      return error.response.data.message;
    } else if (error.message) {
      return error.message;
    } else {
      return 'An unexpected error occurred';
    }
  },

  // Check if API is healthy
  checkHealth: async () => {
    try {
      const response = await apiEndpoints.health();
      return response.data;
    } catch (error) {
      console.error('❌ API health check failed:', error);
      throw error;
    }
  },

  // Format numbers for display
  formatNumber: (num) => {
    if (typeof num !== 'number') return '0';
    
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    } else {
      return num.toString();
    }
  },

  // Format percentages for display
  formatPercentage: (decimal) => {
    if (typeof decimal !== 'number') return '0%';
    return `${Math.round(decimal * 100)}%`;
  },

  // Format dates for display
  formatDate: (dateString) => {
    if (!dateString) return 'Unknown';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    } catch (error) {
      return 'Invalid date';
    }
  },

  // Format relative time
  formatRelativeTime: (dateString) => {
    if (!dateString) return 'Unknown';
    
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      const diffMinutes = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMinutes / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMinutes < 1) return 'Just now';
      if (diffMinutes < 60) return `${diffMinutes}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      
      return date.toLocaleDateString();
    } catch (error) {
      return 'Unknown';
    }
  },

  // Get health status color
  getHealthStatusColor: (status) => {
    switch (status) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'fair': return 'text-yellow-600';
      case 'poor': return 'text-red-600';
      default: return 'text-gray-600';
    }
  },

  // Validate server ID format
  isValidServerId: (serverId) => {
    return typeof serverId === 'string' && serverId.length > 10 && /^\d+$/.test(serverId);
  },

  // Build query parameters
  buildQueryParams: (params) => {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        searchParams.append(key, value.toString());
      }
    });
    
    return searchParams.toString();
  },

  // Handle API errors consistently
  handleApiError: (error, defaultMessage = 'An error occurred') => {
    const message = apiHelpers.formatError(error);
    console.error('🔥 API Error:', message);
    
    // You can add global error handling here (toast notifications, etc.)
    return message;
  }
};

// Export default for backward compatibility
export default {
  apiEndpoints,
  apiHelpers
};