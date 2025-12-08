// frontend/src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react'
import { apiEndpoints } from '../services/api'


const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const notifications = useNotifications?.() // Optional chaining for tests

  // Check for existing authentication on mount
  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      
      if (!token) {
        setLoading(false)
        return
      }

      // Validate token with backend
      const response = await fetch('/api/v1/auth/verify', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
        setIsAuthenticated(true)
        await loadUserServers(userData.id)
      } else {
        // Invalid token
        localStorage.removeItem('auth_token')
        notifications?.showWarning('Session expired. Please log in again.')
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      // Fallback to mock data for development
      await loadMockUserData()
    } finally {
      setLoading(false)
    }
  }

  const loadUserServers = async (userId) => {
    try {
      const serversResponse = await apiEndpoints.getServers()
      const servers = serversResponse.data.servers || []
      
      setUser(prev => ({
        ...prev,
        servers: servers.map(server => ({
          id: server.id,
          name: server.name,
          icon: server.icon || null,
          owner: server.owner || false,
          permissions: server.permissions || ['view'],
          health_score: server.health_score || 0.85
        }))
      }))
    } catch (error) {
      console.error('Failed to load servers:', error)
      notifications?.showError('Failed to load your servers')
    }
  }

  const loadMockUserData = async () => {
    // Mock data for development/testing
    const mockUser = {
      id: '123456789',
      username: 'TestUser',
      discriminator: '1234',
      email: 'test@example.com',
      avatar: null,
      servers: []
    }

    try {
      // Try to load real servers even with mock user
      const serversResponse = await apiEndpoints.getServers()
      const servers = serversResponse.data.servers || []
      
      mockUser.servers = servers.map(server => ({
        id: server.id,
        name: server.name,
        icon: null,
        owner: true,
        permissions: ['administrator'],
        health_score: server.health_score || 0.85
      }))
    } catch (error) {
      // If no real servers, use mock servers
      mockUser.servers = [
        {
          id: '936677346449170493',
          name: 'Test Server',
          icon: null,
          owner: true,
          permissions: ['administrator'],
          health_score: 0.85
        }
      ]
    }

    setUser(mockUser)
    setIsAuthenticated(true)
    notifications?.showInfo('Running in development mode with mock user')
  }

  const loginWithDiscord = async (code, state) => {
    try {
      setLoading(true)
      
      const response = await fetch('/api/v1/auth/discord/callback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code, state })
      })

      if (!response.ok) {
        throw new Error('Discord authentication failed')
      }

      const { token, user: userData } = await response.json()
      
      // Store token
      localStorage.setItem('auth_token', token)
      
      // Set user data
      setUser(userData)
      setIsAuthenticated(true)
      
      // Load user's servers
      await loadUserServers(userData.id)
      
      notifications?.showSuccess(`Welcome back, ${userData.username}!`)
      
      return { success: true }
    } catch (error) {
      console.error('Discord login failed:', error)
      notifications?.showError('Failed to log in with Discord. Please try again.')
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  const startDiscordAuth = () => {
    const clientId = process.env.REACT_APP_DISCORD_CLIENT_ID
    const redirectUri = encodeURIComponent(process.env.REACT_APP_DISCORD_REDIRECT_URI || `${window.location.origin}/auth/callback`)
    const scope = encodeURIComponent('identify email guilds')
    const state = btoa(JSON.stringify({ timestamp: Date.now(), redirect: window.location.pathname }))
    
    if (!clientId) {
      notifications?.showError('Discord authentication not configured')
      return
    }

    const authUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&state=${state}`
    
    window.location.href = authUrl
  }

  const logout = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      
      if (token) {
        // Notify backend of logout
        await fetch('/api/v1/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
      }
    } catch (error) {
      console.error('Logout request failed:', error)
    } finally {
      // Clear local state regardless of backend response
      localStorage.removeItem('auth_token')
      setUser(null)
      setIsAuthenticated(false)
      notifications?.showInfo('You have been logged out')
    }
  }

  const refreshServers = async () => {
    if (!user?.id) return

    try {
      await loadUserServers(user.id)
      notifications?.showSuccess('Servers refreshed successfully')
    } catch (error) {
      console.error('Failed to refresh servers:', error)
      notifications?.showError('Failed to refresh servers')
    }
  }

  const updateUserProfile = async (updates) => {
    try {
      const token = localStorage.getItem('auth_token')
      
      const response = await fetch('/api/v1/auth/profile', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      })

      if (response.ok) {
        const updatedUser = await response.json()
        setUser(updatedUser)
        notifications?.showSuccess('Profile updated successfully')
        return { success: true }
      } else {
        throw new Error('Profile update failed')
      }
    } catch (error) {
      console.error('Profile update failed:', error)
      notifications?.showError('Failed to update profile')
      return { success: false, error: error.message }
    }
  }

  const value = {
    user,
    loading,
    isAuthenticated,
    loginWithDiscord,
    startDiscordAuth,
    logout,
    refreshServers,
    updateUserProfile,
    checkAuthStatus
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}