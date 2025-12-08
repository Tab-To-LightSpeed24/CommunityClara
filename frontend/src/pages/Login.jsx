// frontend/src/pages/Login.jsx
import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import GoogleSignIn from '../components/Auth/GoogleSignIn'

const Login = () => {
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()

  const handleDiscordLogin = async () => {
    setIsLoading(true)

    try {
      // Check if we have Discord client ID configured
      if (!import.meta.env.VITE_DISCORD_CLIENT_ID) {
        // Development fallback - simulate successful login
        console.warn('Discord client ID not configured, using development mode')

        setTimeout(() => {
          console.log('Simulated login successful')
          window.location.reload() // This will trigger AuthContext to load user data
        }, 2000)

        return
      }

      // Start real Discord OAuth flow
      const discordAuthUrl = `https://discord.com/api/oauth2/authorize?client_id=${import.meta.env.VITE_DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(window.location.origin + '/auth/callback')}&response_type=code&scope=identify%20guilds`
      window.location.href = discordAuthUrl
    } catch (error) {
      console.error('Discord login failed:', error)
      setIsLoading(false)
    }
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
          <GoogleSignIn
            onSuccess={(userData) => {
              console.log('✅ Login successful:', userData)
              // AuthContext will handle the redirect
            }}
            onError={(error) => {
              console.error('❌ Login failed:', error)
            }}
          />



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