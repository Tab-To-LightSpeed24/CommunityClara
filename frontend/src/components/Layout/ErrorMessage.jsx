// frontend/src/components/Layout/ErrorMessage.jsx
import React from 'react'

const ErrorMessage = ({ title = 'Error', message, onRetry }) => {
  return (
    <div className="card border-danger-200 bg-danger-50">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-danger-100 rounded-full flex items-center justify-center">
            <span className="text-danger-600 text-sm">⚠️</span>
          </div>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-medium text-danger-900 mb-1">{title}</h3>
          <p className="text-danger-700 mb-4">{message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="btn btn-danger text-sm"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default ErrorMessage