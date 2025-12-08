// frontend/src/utils/constants.js

// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000
}

// Application Routes
export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  SERVERS: '/servers',
  ANALYTICS: '/analytics',
  SETTINGS: '/settings',
  PROFILE: '/profile',
  LOGIN: '/login'
}

// Violation Types
export const VIOLATION_TYPES = {
  TOXICITY: 'toxicity',
  HARASSMENT: 'harassment',
  SPAM: 'spam',
  HATE_SPEECH: 'hate_speech',
  THREATS: 'threats',
  SELF_HARM: 'self_harm'
}

// Violation Type Display Configuration
export const VIOLATION_CONFIG = {
  [VIOLATION_TYPES.TOXICITY]: {
    label: 'Toxic Language',
    icon: '🤬',
    color: 'warning',
    description: 'Harmful or offensive language'
  },
  [VIOLATION_TYPES.HARASSMENT]: {
    label: 'Harassment',
    icon: '😡',
    color: 'danger',
    description: 'Targeted abuse or bullying'
  },
  [VIOLATION_TYPES.SPAM]: {
    label: 'Spam',
    icon: '📧',
    color: 'primary',
    description: 'Repetitive or unwanted content'
  },
  [VIOLATION_TYPES.HATE_SPEECH]: {
    label: 'Hate Speech',
    icon: '💢',
    color: 'danger',
    description: 'Discriminatory or hateful content'
  },
  [VIOLATION_TYPES.THREATS]: {
    label: 'Threats',
    icon: '⚠️',
    color: 'danger',
    description: 'Threatening or violent language'
  },
  [VIOLATION_TYPES.SELF_HARM]: {
    label: 'Self Harm',
    icon: '🆘',
    color: 'danger',
    description: 'Content promoting self-harm'
  }
}

// Moderation Actions
export const MODERATION_ACTIONS = {
  DELETE: 'delete',
  WARN: 'warn',
  TIMEOUT: 'timeout',
  KICK: 'kick',
  BAN: 'ban',
  LOG: 'log'
}

// Action Configuration
export const ACTION_CONFIG = {
  [MODERATION_ACTIONS.DELETE]: {
    label: 'Delete Message',
    icon: '🗑️',
    color: 'danger',
    description: 'Remove the violating message'
  },
  [MODERATION_ACTIONS.WARN]: {
    label: 'Warn User',
    icon: '⚠️',
    color: 'warning',
    description: 'Send warning to user'
  },
  [MODERATION_ACTIONS.TIMEOUT]: {
    label: 'Timeout User',
    icon: '⏰',
    color: 'primary',
    description: 'Temporarily restrict user'
  },
  [MODERATION_ACTIONS.KICK]: {
    label: 'Kick User',
    icon: '👢',
    color: 'danger',
    description: 'Remove user from server'
  },
  [MODERATION_ACTIONS.BAN]: {
    label: 'Ban User',
    icon: '🔨',
    color: 'danger',
    description: 'Permanently ban user'
  },
  [MODERATION_ACTIONS.LOG]: {
    label: 'Log Only',
    icon: '📝',
    color: 'secondary',
    description: 'Record violation without action'
  }
}

// Health Status Levels
export const HEALTH_STATUS = {
  EXCELLENT: 'excellent',
  GOOD: 'good',
  FAIR: 'fair',
  POOR: 'poor'
}

// Health Status Configuration
export const HEALTH_CONFIG = {
  [HEALTH_STATUS.EXCELLENT]: {
    label: 'Excellent',
    icon: '🟢',
    color: 'success',
    minScore: 0.9,
    description: 'Community is thriving with minimal issues'
  },
  [HEALTH_STATUS.GOOD]: {
    label: 'Good',
    icon: '🔵',
    color: 'primary',
    minScore: 0.7,
    description: 'Community is healthy with occasional issues'
  },
  [HEALTH_STATUS.FAIR]: {
    label: 'Fair',
    icon: '🟡',
    color: 'warning',
    minScore: 0.5,
    description: 'Community needs attention and improvement'
  },
  [HEALTH_STATUS.POOR]: {
    label: 'Poor',
    icon: '🔴',
    color: 'danger',
    minScore: 0.0,
    description: 'Community requires immediate intervention'
  }
}

// User Roles
export const USER_ROLES = {
  OWNER: 'owner',
  ADMIN: 'admin',
  MODERATOR: 'moderator',
  MEMBER: 'member',
  BOT: 'bot'
}

// Permission Levels
export const PERMISSIONS = {
  VIEW_DASHBOARD: 'view_dashboard',
  MANAGE_SETTINGS: 'manage_settings',
  VIEW_VIOLATIONS: 'view_violations',
  MANAGE_VIOLATIONS: 'manage_violations',
  VIEW_ANALYTICS: 'view_analytics',
  EXPORT_DATA: 'export_data'
}

// Theme Configuration
export const THEME = {
  COLORS: {
    PRIMARY: {
      50: '#eff6ff',
      100: '#dbeafe',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      900: '#1e3a8a'
    },
    SUCCESS: {
      50: '#f0fdf4',
      100: '#dcfce7',
      500: '#22c55e',
      600: '#16a34a'
    },
    WARNING: {
      50: '#fffbeb',
      100: '#fef3c7',
      500: '#f59e0b',
      600: '#d97706'
    },
    DANGER: {
      50: '#fef2f2',
      100: '#fee2e2',
      500: '#ef4444',
      600: '#dc2626'
    }
  },
  GRADIENTS: {
    PRIMARY: 'from-purple-600 to-blue-600',
    SUCCESS: 'from-green-600 to-emerald-600',
    WARNING: 'from-yellow-600 to-orange-600',
    DANGER: 'from-red-600 to-pink-600',
    RAINBOW: 'from-purple-600 via-blue-600 to-cyan-600'
  }
}

// Animation Durations
export const ANIMATIONS = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
  VERY_SLOW: 1000
}

// Data Refresh Intervals (in milliseconds)
export const REFRESH_INTERVALS = {
  DASHBOARD: 30000,     // 30 seconds
  ANALYTICS: 60000,     // 1 minute
  HEALTH: 60000,        // 1 minute
  VIOLATIONS: 30000,    // 30 seconds
  ACTIVITY_LOG: 10000   // 10 seconds
}

// Chart Configuration
export const CHART_CONFIG = {
  COLORS: [
    '#8B5CF6', // Purple
    '#3B82F6', // Blue
    '#10B981', // Green
    '#F59E0B', // Yellow
    '#EF4444', // Red
    '#8B5CF6', // Pink
    '#6B7280'  // Gray
  ],
  GRADIENT_STOPS: {
    START: '5%',
    MIDDLE: '50%',
    END: '95%'
  }
}

// Local Storage Keys
export const STORAGE_KEYS = {
  THEME: 'safespace_theme',
  SELECTED_SERVER: 'safespace_selected_server',
  DASHBOARD_LAYOUT: 'safespace_dashboard_layout',
  USER_PREFERENCES: 'safespace_user_preferences'
}

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Unable to connect to the server. Please check your internet connection.',
  SERVER_ERROR: 'An unexpected server error occurred. Please try again later.',
  NOT_FOUND: 'The requested resource was not found.',
  UNAUTHORIZED: 'You are not authorized to access this resource.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  TIMEOUT_ERROR: 'The request timed out. Please try again.',
  GENERIC_ERROR: 'An unexpected error occurred. Please try again.'
}

// Success Messages
export const SUCCESS_MESSAGES = {
  SETTINGS_SAVED: 'Settings saved successfully!',
  SERVER_UPDATED: 'Server configuration updated!',
  VIOLATION_REPORTED: 'Violation feedback recorded!',
  DATA_EXPORTED: 'Data exported successfully!',
  BOT_CONFIGURED: 'Bot configuration updated!'
}

// Validation Rules
export const VALIDATION = {
  SERVER_NAME: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 100
  },
  THRESHOLD: {
    MIN: 0.1,
    MAX: 1.0,
    STEP: 0.1
  },
  TIMEOUT_DURATION: {
    MIN: 60,      // 1 minute
    MAX: 86400    // 24 hours
  },
  CUSTOM_KEYWORDS: {
    MAX_LENGTH: 1000
  }
}

// Feature Flags
export const FEATURES = {
  DARK_MODE: true,
  REAL_TIME_UPDATES: true,
  EXPORT_DATA: true,
  COMMUNITY_LEARNING: true,
  ADVANCED_ANALYTICS: true,
  CUSTOM_THEMES: false,
  MULTI_LANGUAGE: false
}

// Discord Configuration
export const DISCORD_CONFIG = {
  BOT_PERMISSIONS: [
    'VIEW_CHANNEL',
    'SEND_MESSAGES',
    'MANAGE_MESSAGES',
    'READ_MESSAGE_HISTORY',
    'USE_EXTERNAL_EMOJIS',
    'ADD_REACTIONS',
    'MODERATE_MEMBERS'
  ],
  INVITE_URL: 'https://discord.com/api/oauth2/authorize',
  SUPPORT_SERVER: 'https://discord.gg/safespace-ai'
}

// Analytics Configuration
export const ANALYTICS_CONFIG = {
  DEFAULT_DAYS: 7,
  MAX_DAYS: 30,
  METRICS: [
    'messages_processed',
    'violations_detected',
    'false_positives',
    'community_health_score',
    'toxicity_trend',
    'engagement_score'
  ]
}

// Export all constants as default
export default {
  API_CONFIG,
  ROUTES,
  VIOLATION_TYPES,
  VIOLATION_CONFIG,
  MODERATION_ACTIONS,
  ACTION_CONFIG,
  HEALTH_STATUS,
  HEALTH_CONFIG,
  USER_ROLES,
  PERMISSIONS,
  THEME,
  ANIMATIONS,
  REFRESH_INTERVALS,
  CHART_CONFIG,
  STORAGE_KEYS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  VALIDATION,
  FEATURES,
  DISCORD_CONFIG,
  ANALYTICS_CONFIG
}