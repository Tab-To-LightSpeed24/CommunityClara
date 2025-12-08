// frontend/src/pages/NotFound.jsx
import React from 'react'
import { Link } from 'react-router-dom'

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border border-white/20 rounded-2xl shadow-2xl p-8">
          {/* 404 Icon */}
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <span className="text-white text-3xl">🔍</span>
          </div>

          {/* Error Message */}
          <h1 className="text-6xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
            404
          </h1>
          
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Page Not Found
          </h2>
          
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Link
              to="/"
              className="w-full btn bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-purple-500/25 transform hover:scale-105 transition-all duration-200"
            >
              🏠 Go Home
            </Link>
            
            <Link
              to="/dashboard"
              className="w-full btn bg-gray-600 text-white hover:bg-gray-700 transition-all duration-200"
            >
              📊 Go to Dashboard
            </Link>
          </div>

          {/* Help Text */}
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-6">
            If you believe this is an error, please contact support.
          </p>
        </div>
      </div>
    </div>
  )
}

export default NotFound