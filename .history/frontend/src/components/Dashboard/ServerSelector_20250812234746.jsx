// frontend/src/components/Dashboard/ServerSelector.jsx
// Fixed to handle both prop names and provide better error handling

import React from 'react'

const ServerSelector = ({ 
  servers = [], 
  selectedServerId, 
  onServerChange, 
  onServerSelect, 
  loading = false,
  error = null 
}) => {
  // Handle both prop names for backward compatibility
  const handleChange = (value) => {
    if (onServerChange && typeof onServerChange === 'function') {
      onServerChange(value)
    } else if (onServerSelect && typeof onServerSelect === 'function') {
      onServerSelect(value)
    } else {
      console.error('ServerSelector: No valid onChange handler provided. Expected onServerChange or onServerSelect prop.')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center space-x-3">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Server:
        </label>
        <div className="min-w-[200px] px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700">
          <span className="text-gray-500 dark:text-gray-400">Loading servers...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center space-x-3">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Server:
        </label>
        <div className="min-w-[200px] px-3 py-2 border border-red-300 rounded-md bg-red-50 dark:bg-red-900/20">
          <span className="text-red-600 dark:text-red-400 text-sm">Error loading servers</span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center space-x-3">
      <label htmlFor="server-select" className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Server:
      </label>
      <select
        id="server-select"
        value={selectedServerId || ''}
        onChange={(e) => handleChange(e.target.value)}
        className="input min-w-[200px] bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:border-purple-500 focus:ring-purple-500"
        disabled={!servers || servers.length === 0}
      >
        <option value="" disabled>
          {servers.length === 0 ? 'No servers available' : 'Select a server...'}
        </option>
        {servers.map((server) => (
          <option key={server.id} value={server.id}>
            {server.name || `Server ${server.id}`}
          </option>
        ))}
      </select>
      
      {/* Server count indicator */}
      {servers.length > 0 && (
        <span className="text-xs text-gray-500 dark:text-gray-400">
          ({servers.length} server{servers.length !== 1 ? 's' : ''})
        </span>
      )}
    </div>
  )
}

export default ServerSelector