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

  // Remove any line like: const { showError, showSuccess } = useNotifications()

  // Fetch real server data from your backend
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('safespace_token')
      
      if (token) {
        try {
          const response = await apiEndpoints.getCurrentUser()
          setUser(response.data.user)
          setIsAuthenticated(true)
        } catch (error) {
          console.error('❌ Auth check failed:', error)
          localStorage.removeItem('safespace_token')
        }
      }
      
      setIsLoading(false)
    }

    checkAuth()
  }, [])

  const login = async (googleToken) => {
    try {
      setIsLoading(true)
      
      const response = await apiEndpoints.googleAuth(googleToken)
      const { user: userData, token } = response.data
      
      // Store token
      localStorage.setItem('safespace_token', token)
      
      // Update state
      setUser(userData)
      setIsAuthenticated(true)
      
      console.log('✅ Login successful:', userData)
      return { success: true, user: userData }
      
    } catch (error) {
      console.error('❌ Login failed:', error)
      return { success: false, error: error.response?.data?.detail || 'Login failed' }
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('safespace_token')
    setUser(null)
    setIsAuthenticated(false)
    console.log('✅ Logout successful')
  }

  const updateProfile = async (profileData) => {
    try {
      const response = await apiEndpoints.updateProfile(profileData)
      setUser(response.data.user)
      return { success: true, user: response.data.user }
    } catch (error) {
      console.error('❌ Profile update failed:', error)
      return { success: false, error: error.response?.data?.detail || 'Update failed' }
    }
  }

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    updateProfile
  }

    const fetchUserData = async () => {
      try {
        // Fetch ALL servers from your backend
        const serversResponse = await apiEndpoints.getServers()
        const servers = serversResponse.data.servers

        console.log('🔍 Raw server data from API:', servers)

        // Use ALL servers from the API (no filtering)
        console.log('✅ Using all servers from API:', servers)

        // Create user with ALL server data
        const mockUser = {
          id: '691640049900716065',
          username: 'TestUser',
          discriminator: '1234',
          avatar: null,
          email: 'test@example.com',
          servers: servers.map(server => ({
            id: server.id,
            name: server.name,
            icon: null,
            owner: true,
            permissions: ['administrator'],
            health_score: server.health_score || 0.85
          }))
        }

        setUser(mockUser)
        setIsAuthenticated(true)
        console.log('✅ User loaded with all servers:', mockUser.servers)
        
      } catch (error) {
        console.error('❌ Failed to fetch servers:', error)
        
        // Emergency fallback with multiple servers
        const mockUser = {
          id: '691640049900716065',
          username: 'TestUser',
          discriminator: '1234',
          avatar: null,
          email: 'test@example.com',
          servers: [
            {
              id: '936677346449170493',
              name: 'Empty Room',
              icon: null,
              owner: true,
              permissions: ['administrator'],
              health_score: 0.85
            },
            {
              id: '757139036648374332',
              name: 'Test Server',
              icon: null,
              owner: true,
              permissions: ['administrator'],
              health_score: 0.75
            }
          ]
        }
        setUser(mockUser)
        setIsAuthenticated(true)
        console.log('⚠️ Using fallback servers:', mockUser.servers)
      } finally {
        setLoading(false)
      }
    }

    // Simulate loading delay then fetch real data
    setTimeout(fetchUserData, 1000)
  }, [])

  const login = async (discordCode) => {
    // TODO: Implement Discord OAuth
    console.log('Login with Discord code:', discordCode)
  }

  const logout = () => {
    setUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem('auth_token')
  }

  const refreshServers = async () => {
    try {
      const serversResponse = await apiEndpoints.getServers()
      const servers = serversResponse.data.servers
      
      setUser(prev => ({
        ...prev,
        servers: servers.map(server => ({
          id: server.id,
          name: server.name,
          icon: null,
          owner: true,
          permissions: ['administrator'],
          health_score: server.health_score || 0.85
        }))
      }))
      
      console.log('🔄 Refreshed servers:', servers)
    } catch (error) {
      console.error('❌ Failed to refresh servers:', error)
    }
  }

  const refreshServerNames = async () => {
    try {
      const serversResponse = await apiEndpoints.getServers()
      const servers = serversResponse.data.servers
      
      setUser(prev => ({
        ...prev,
        servers: prev.servers.map(userServer => {
          const apiServer = servers.find(s => s.id === userServer.id)
          return apiServer ? {
            ...userServer,
            name: apiServer.name
          } : userServer
        })
      }))
      
      console.log('🔄 Refreshed server names')
    } catch (error) {
      console.error('❌ Failed to refresh server names:', error)
    }
  }

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    refreshServers,
    refreshServerNames
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}