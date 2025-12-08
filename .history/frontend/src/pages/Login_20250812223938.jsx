// frontend/src/pages/Login.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useNotifications } from '../contexts/NotificationContext'
import LoadingSpinner from '../components/Layout/LoadingSpinner'

const Login = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { loginWithDiscord, startDiscordAuth, isAuthenticated } = useAuth()
  const { showError, showSuccess } = useNotifications()

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/dashboard'
      navigate(from, { replace: true })
    }
  }, [isAuthenticated, navigate, location.state])

  // Handle OAuth callback
  useEffect(() => {
    const handleOAuthCallback = async () => {
      const code = searchParams.get('code')
      const state = searchParams.get('state')
      const error = searchParams.get('error')

      if (error) {
        showError(`Discord authentication failed: ${error}`)
        navigate('/login', { replace: true })
        return
      }

      if (code && state) {
        setIsLoading(true)
        try {
          const result = await loginWithDiscord(code, state)
          
          if (result.success) {
            showSuccess('Successfully logged in with Discord!')
            
            // Parse state to get original redirect location
            try {
              const stateData = JSON.parse(atob(state))
              const redirectTo = stateData.redirect || '/dashboard'
              navigate(redirectTo, { replace: true })
            } catch {
              navigate('/dashboard', { replace: true })
            }
          } else {
            showError(result.error || 'Login failed')
            navigate('/login', { replace: true })
          }
        } catch (error) {
          showError('An unexpected error occurred during login')
          navigate('/login', { replace: true })
        } finally {
          setIsLoading(false)
        }
      }
    }

    handleOAuthCallback()
  }, [searchParams, loginWithDiscord, navigate, showError, showSuccess])

  const handleDiscordLogin = async () => {
    setIsLoading(true)
    
    try {
      // Check if we have Discord client ID configured
      if (!process.env.REACT_APP_DISCORD_CLIENT_ID) {
        // Development fallback - simulate successful login
        console.warn('Discord client ID not configured, using development mode')
        
        setTimeout(() => {
          showSuccess('Logged in successfully (development mode)')
          const from = location.state?.from?.pathname || '/dashboard'
          navigate(from, { replace: true })
        }, 2000)
        
        return
      }

      // Start real Discord OAuth flow
      startDiscordAuth()
    } catch (error) {
      console.error('Discord login failed:', error)
      showError('Failed to start Discord authentication')
      setIsLoading(false)
    }
  }

  // Show loading state for OAuth callback
  if (searchParams.get('code') || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-600 rounded-3xl flex items-center justify-center mx-auto mb-6 animate-pulse shadow-2xl">
            <span className="text-white font-bold text-3xl">🛡️</span>
          </div>
          <LoadingSpinner size="lg" className="mb-4" />
          <div className="text-lg text-gray-600 dark:text-gray-300 mb-2">
            {searchParams.get('code') ? 'Completing Discord authentication...' : 'Preparing login...'}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Please wait while we verify your account
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Login Card */}
        <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border border-white/20 rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            {/* Logo */}
            <div className="w-20 h-20 bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
              <span className="text-white font-bold text-3xl">🛡️</span>
            </div>
            
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
              Welcome to CommunityClara
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Sign in with Discord to manage your server moderation
            </p>
          </div>

          {/* Login Features */}
          <div className="mb-8 space-y-3">
            <div className="flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-400">
              <span className="text-green-500">✓</span>
              <span>AI-powered content moderation</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-400">
              <span className="text-green-500">✓</span>
              <span>Real-time analytics and insights</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-400">
              <span className="text-green-500">✓</span>
              <span>Privacy-first community learning</span>
            </div>
          </div>

          {/* Login Button */}
          <button
            onClick={handleDiscordLogin}
            disabled={isLoading}
            className="w-full btn bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-indigo-500/25 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed py-4 text-lg"
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-3">
                <LoadingSpinner size="sm" className="text-white" />
                <span>Connecting...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-3">
                <span className="text-2xl">🚀</span>
                <span>Continue with Discord</span>
              </div>
            )}
          </button>

          {/* Security Notice */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-start space-x-2">
              <span className="text-blue-500 text-lg flex-shrink-0">🔒</span>
              <div className="text-sm text-blue-800 dark:text-blue-200">
                <div className="font-medium mb-1">Secure Authentication</div>
                <div>We only access your basic Discord profile and server list. No messages or private data are stored.</div>
              </div>
            </div>
          </div>

          {/* Development Notice */}
          {!process.env.REACT_APP_DISCORD_CLIENT_ID && (
            <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <div className="text-sm text-yellow-800 dark:text-yellow-200">
                <div className="font-medium">Development Mode</div>
                <div>Discord OAuth not configured - using mock authentication</div>
              </div>
            </div>
          )}

          {/* Help Links */}
          <div className="mt-6 text-center space-y-2">
            <a 
              href="https://docs.safespace-ai.com/getting-started" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
            >
              📖 Getting Started Guide
            </a>
            <br />
            <a 
              href="https://discord.gg/safespace-ai" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
            >
              💬 Need Help? Join Our Discord
            </a>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            By signing in, you agree to our{' '}
            <a href="/terms" className="underline hover:no-underline">Terms of Service</a>
            {' '}and{' '}
            <a href="/privacy" className="underline hover:no-underline">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login