// frontend/src/components/Dashboard/ServerSelector.jsx
import React from 'react'

const ServerSelector = ({ servers, selectedServerId, onServerChange }) => {
  return (
    <div className="flex items-center space-x-3">
      <label htmlFor="server-select" className="text-sm font-medium text-gray-700">
        Server:
      </label>
      <select
        id="server-select"
        value={selectedServerId || ''}
        onChange={(e) => onServerChange(e.target.value)}
        className="input min-w-[200px]"
      >
        <option value="">Select a server...</option>
        {servers.map((server) => (
          <option key={server.id} value={server.id}>
            {server.name}
          </option>
        ))}
      </select>
    </div>
  )
}

export default ServerSelector