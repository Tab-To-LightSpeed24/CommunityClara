// frontend/src/components/Dashboard/ServerSelector.jsx
// Complete fixed version with proper selection handling

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
    console.log('🔄 ServerSelector: Changing server selection', {
      from: selectedServerId,
      to: value,
      serverName: servers.find(s => s.id === value)?.name
    })
    
    if (onServerChange && typeof onServerChange === 'function') {
      onServerChange(value)
    } else if (onServerSelect && typeof onServerSelect === 'function') {
      onServerSelect(value)
    } else {
      console.error('ServerSelector: No valid onChange handler provided')
    }
  }

  // Debug current state
  React.useEffect(() => {
    const selectedServer = servers.find(s => s.id === selectedServerId)
    console.log('🎯 ServerSelector: Current state', {
      selectedServerId,
      selectedServerName: selectedServer?.name,
      totalServers: servers.length,
      serverList: servers.map(s => ({ id: s.id, name: s.name }))
    })
  }, [selectedServerId, servers])

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center space-x-3">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Server:
        </label>
        <div className="min-w-[250px] px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-gray-500 dark:text-gray-400">Loading servers...</span>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center space-x-3">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Server:
        </label>
        <div className="min-w-[250px] px-4 py-2 border border-red-300 dark:border-red-700 rounded-lg bg-red-50 dark:bg-red-900/20">
          <span className="text-red-600 dark:text-red-400 text-sm">
            ⚠️ Error loading servers
          </span>
        </div>
      </div>
    )
  }

  // No servers available
  if (!servers || servers.length === 0) {
    return (
      <div className="flex items-center space-x-3">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Server:
        </label>
        <div className="min-w-[250px] px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700">
          <span className="text-gray-500 dark:text-gray-400">No servers available</span>
        </div>
      </div>
    )
  }

  // Find currently selected server
  const selectedServer = servers.find(s => s.id === selectedServerId)

  return (
    <div className="flex items-center space-x-3">
      <label htmlFor="server-select" className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
        Server:
      </label>
      
      <div className="relative">
        <select
          id="server-select"
          value={selectedServerId || ''}
          onChange={(e) => handleChange(e.target.value)}
          className="min-w-[250px] px-4 py-2 pr-10 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200 appearance-none cursor-pointer hover:border-purple-400"
        >
          <option value="" disabled className="text-gray-500">
            Select a server...
          </option>
          {servers.map((server) => (
            <option 
              key={server.id} 
              value={server.id}
              className="py-2"
            >
              {server.name || `Server ${server.id}`}
            </option>
          ))}
        </select>
        
        {/* Custom dropdown arrow */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      
      {/* Server info display */}
      <div className="flex items-center space-x-2">
        {/* Server count */}
        <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
          {servers.length} server{servers.length !== 1 ? 's' : ''}
        </span>
        
        {/* Selected server indicator */}
        {selectedServer && (
          <div className="flex items-center space-x-1 text-xs text-purple-600 dark:text-purple-400">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="font-medium">Active</span>
          </div>
        )}
      </div>
      
      {/* Debug info in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-gray-400 max-w-xs truncate">
          ID: {selectedServerId || 'none'}
        </div>
      )}
    </div>
  )
}

export default ServerSelector