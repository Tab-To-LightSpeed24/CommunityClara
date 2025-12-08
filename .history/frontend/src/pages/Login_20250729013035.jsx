import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

const Login = () => {
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()

  const handleDiscordLogin = async () => {
    setIsLoading(true)
    
    // For now, simulate login
    setTimeout(() => {
      window.location.reload()
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20 flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        {/* Login Card */}
        <div className="card backdrop-blur-sm bg-white/90 dark:bg-gray-900/90 border border-white/20 shadow-2xl">
          <div className="text-center mb-8">
            {/* Logo */}
            <div className="w-20 h-20 bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
              <span className="text-white font-bold text-3xl">🛡️</span>
            </div>
            
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
              Welcome to CommunityClara
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Sign in with Discord to manage your servers
            </p>
          </div>

          {/* Login Button */}
          <button
            onClick={handleDiscordLogin}
            disabled={isLoading}
            className="w-full btn bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-indigo-500/25 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed py-4 text-lg"
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Connecting to Discord...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-3">
                <span className="text-2xl">🎮</span>
                <span>Continue with Discord</span>
              </div>
            )}
          </button>

          {/* Features */}
          <div className="mt-8 pt-6 border-t border-gray-200/50 dark:border-gray-700/50">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 text-center">
              What you'll get:
            </h3>
            <div className="space-y-3">
              {[
                { icon: '🛡️', text: 'AI-powered content moderation' },
                { icon: '📊', text: 'Real-time analytics dashboard' },
                { icon: '🔒', text: 'Privacy-first approach' },
                { icon: '⚡', text: 'Instant violation detection' }
              ].map((feature, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <span className="text-lg">{feature.icon}</span>
                  <span className="text-sm text-gray-600 dark:text-gray-300">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-gray-200/50 dark:border-gray-700/50 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              By signing in, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Don't have ClaraBot in your server yet?{' '}
            <a href="#" className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium">
              Add it now
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login