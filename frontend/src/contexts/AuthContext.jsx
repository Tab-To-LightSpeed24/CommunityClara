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
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Check for existing token on app load
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('safespace_token')
      
      if (token) {
        try {
          // Try to get current user with existing token
          const response = await apiEndpoints.getCurrentUser()
          const userData = response.data.user
          
          // Fetch servers and associate with user
          try {
            const serversResponse = await apiEndpoints.getServers()
            const servers = serversResponse.data.servers || []
            
            const enhancedUser = {
              ...userData,
              servers: servers.map(server => ({
                id: server.id,
                name: server.name,
                icon: null,
                owner: true,
                permissions: ['administrator'],
                health_score: server.health_score || 0.85
              }))
            }
            
            setUser(enhancedUser)
            setIsAuthenticated(true)
            console.log('✅ User authenticated from existing token:', enhancedUser)
          } catch (serverError) {
            console.warn('⚠️ Could not fetch servers, using user data only:', serverError)
            setUser({ ...userData, servers: [] })
            setIsAuthenticated(true)
          }
          
        } catch (error) {
          console.error('❌ Auth check failed:', error)
          
          // Only remove token if it's actually invalid (not a network error)
          if (error.response?.status === 401 || error.response?.status === 403) {
            localStorage.removeItem('safespace_token')
            console.log('🔓 Invalid token removed')
          } else {
            console.log('🌐 Network error during auth check, keeping token')
          }
          
          setUser(null)
          setIsAuthenticated(false)
        }
      } else {
        // No token - user needs to authenticate
        setUser(null)
        setIsAuthenticated(false)
        console.log('🔓 No token found, user needs to sign in')
      }
      
      setIsLoading(false)
    }
    checkAuth()
  }, [])

  const login = async (googleToken) => {
    try {
      setIsLoading(true)
      console.log('🔐 Attempting Google login...')
      
      const response = await apiEndpoints.googleAuth(googleToken)
      const { user: userData, token } = response.data
      
      // Store token
      localStorage.setItem('safespace_token', token)
      
      // Fetch servers for authenticated user
      try {
        const serversResponse = await apiEndpoints.getServers()
        const servers = serversResponse.data.servers || []
        
        const enhancedUser = {
          ...userData,
          servers: servers.map(server => ({
            id: server.id,
            name: server.name,
            icon: null,
            owner: true,
            permissions: ['administrator'],
            health_score: server.health_score || 0.85
          }))
        }
        
        setUser(enhancedUser)
      } catch (serverError) {
        console.warn('⚠️ Could not fetch servers, using user data only:', serverError)
        setUser({ ...userData, servers: [] })
      }
      
      setIsAuthenticated(true)
      
      console.log('✅ Login successful:', userData)
      return { success: true, user: userData }
      
    } catch (error) {
      console.error('❌ Login failed:', error)
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Login failed' 
      }
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      await apiEndpoints.logout()
    } catch (error) {
      console.warn('⚠️ Logout API call failed:', error)
    }
    
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
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Update failed' 
      }
    }
  }

  const refreshServers = async () => {
    try {
      const serversResponse = await apiEndpoints.getServers()
      const servers = serversResponse.data.servers || []
      
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

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    updateProfile,
    refreshServers,
    // Backward compatibility
    loading: isLoading,
    refreshServerNames: refreshServers
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}