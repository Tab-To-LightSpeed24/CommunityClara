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
  
  // In the apiEndpoints object, REPLACE updateServerConfig:
  updateServerConfig: (serverId, config) => {
    console.log('🌐 API: Updating server config:', { serverId, config })
    
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
  // Add to the apiEndpoints object:
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
  analyzeContent: (content, contentType = 'text') => api.post('/api/v1/analyze', {
    content,
    content_type: contentType
  }),
  
  // Feedback
  reportViolationFeedback: (serverId, violationId, isFalsePositive) => {
    console.log(`🔧 Sending feedback: serverId=${serverId}, violationId=${violationId}, isFalsePositive=${isFalsePositive}`)
    
    return api.post(
      `/api/v1/servers/${serverId}/violations/${violationId}/feedback`,
      { is_false_positive: isFalsePositive },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
  },

  // Replace the duplicate updateServerSettings functions with this single one:
  getServerSettings: (serverId) => {
    console.log('🏠 API: Getting server settings:', { serverId })
    
    return api.get(`/api/v1/servers/${serverId}/settings`)
      .then(response => {
        console.log('✅ API: Server settings loaded:', response.data)
        return response
      })
      .catch(error => {
        console.error('❌ API: Server settings load failed:', error.response?.data || error.message)
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
      return response.data.status === 'healthy';
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  },

  // Format dates consistently
  formatDate: (dateString) => {
    const date = new Date(dateString)
    
    // Convert to Indian Standard Time (GMT+5:30)
    const istOptions = {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }
    
    return date.toLocaleDateString('en-IN', istOptions)
  },

  // Format percentages
  formatPercentage: (value, decimals = 1) => {
    return `${(value * 100).toFixed(decimals)}%`;
  },

  // Format large numbers
  formatNumber: (num) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    } else {
      return num.toString();
    }
  },

  // Get health status color
  getHealthStatusColor: (status) => {
    switch (status) {
      case 'excellent': return 'text-success-600';
      case 'good': return 'text-primary-600';
      case 'fair': return 'text-warning-600';
      case 'poor': return 'text-danger-600';
      default: return 'text-gray-600';
    }
  },

  // Get violation type color  
  getViolationTypeColor: (type) => {
    switch (type) {
      case 'nsfw': return 'text-danger-600';
      case 'toxicity': return 'text-warning-600';
      case 'harassment': return 'text-danger-600';
      case 'spam': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  }
};

export default api;