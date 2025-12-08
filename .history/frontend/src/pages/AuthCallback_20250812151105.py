import React, { useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'

const AuthCallback = () => {
  const { handleCallback } = useAuth()

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get('code')
    const error = urlParams.get('error')

    if (error) {
      console.error('OAuth error:', error)
      window.location.href = '/login'
      return
    }

    if (code) {
      handleCallback(code).then(() => {
        window.location.href = '/dashboard'
      }).catch(() => {
        window.location.href = '/login'
      })
    }
  }, [handleCallback])

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-600 rounded-3xl flex items-center justify-center mx-auto mb-4 animate-pulse shadow-2xl">
          <span className="text-white font-bold text-2xl">🛡️</span>
        </div>
        <div className="text-lg text-gray-600 dark:text-gray-300 mb-2">Authenticating...</div>
        <div className="w-48 h-2 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto overflow-hidden">
          <div className="h-full bg-gradient-to-r from-purple-600 to-blue-600 rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  )
}

export default AuthCallback