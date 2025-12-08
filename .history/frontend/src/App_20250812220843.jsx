// frontend/src/App.jsx
import React, { useState, useEffect } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Navbar from './components/Layout/Navbar'
import Dashboard from './components/Dashboard/Dashboard'
import Home from './pages/Home'
import Login from './pages/Login'
import UserProfile from './components/Profile/UserProfile'
import BotConfig from './components/Settings/BotConfig'
import ServerSettings from './components/Settings/ServerSettings'

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

function AppContent() {
  const [currentPage, setCurrentPage] = useState('home')
  const [selectedServerId, setSelectedServerId] = useState(null)
  const [settingsTab, setSettingsTab] = useState('bot')
  const { isAuthenticated, loading, user } = useAuth()

  // Dark mode detection
  useEffect(() => {
    const isDark = localStorage.getItem('darkMode') === 'true' || 
                   (!localStorage.getItem('darkMode') && window.matchMedia('(prefers-color-scheme: dark)').matches)
    
    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [])

  // Auto-select first server if none selected
  useEffect(() => {
    if (user?.servers?.length > 0 && !selectedServerId) {
      setSelectedServerId(user.servers[0].id)
      console.log('🏠 Auto-selected server:', user.servers[0].name, 'ID:', user.servers[0].id)
    }
  }, [user, selectedServerId])

  // Debug server selection
  useEffect(() => {
    if (selectedServerId) {
      const selectedServer = user?.servers?.find(s => s.id === selectedServerId)
      console.log('🎯 Selected server for settings:', selectedServer?.name, 'ID:', selectedServerId)
    }
  }, [selectedServerId, user])

  // Show loading screen
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-600 rounded-3xl flex items-center justify-center mx-auto mb-4 animate-pulse shadow-2xl">
            <span className="text-white font-bold text-2xl">🛡️</span>
          </div>
          <div className="text-lg text-gray-600 dark:text-gray-300 mb-2">Loading CommunityClara...</div>
          <div className="w-48 h-2 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto overflow-hidden">
            <div className="h-full bg-gradient-to-r from-purple-600 to-blue-600 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    )
  }

  // Show login if not authenticated
  if (!isAuthenticated) {
    return <Login />
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'profile':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
                👤 User Profile
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Manage your account settings and preferences
              </p>
            </div>
            <UserProfile />
          </div>
        )
      case 'dashboard':
        return <Dashboard />
      case 'settings':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
                ⚙️ Settings
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Configure ClaraBot's behavior and your server preferences
              </p>
            </div>
            
            {/* Server Selector */}
            {user?.servers?.length > 0 ? (
              <div className="card backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border border-white/20 shadow-2xl mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center shadow-lg">
                        <span className="text-white text-lg">🏠</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-200">Configure Server:</span>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Select which server to configure</p>
                      </div>
                    </div>
                    
                    <select
                      value={selectedServerId || ''}
                      onChange={(e) => {
                        console.log('🔄 Server selection changed to:', e.target.value)
                        setSelectedServerId(e.target.value)
                      }}
                      className="input flex-1 max-w-sm bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-600 focus:border-purple-500 focus:ring-purple-500"
                    >
                      <option value="">Select a server...</option>
                      {user.servers.map((server) => (
                        <option key={server.id} value={server.id}>
                          {server.name} {server.owner ? '(Owner)' : '(Member)'}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {selectedServerId && (
                    <div className="flex items-center space-x-2 bg-green-100 dark:bg-green-900/30 px-3 py-2 rounded-lg">
                      <span className="text-green-600 dark:text-green-400 text-lg">✅</span>
                      <div className="text-sm">
                        <div className="font-medium text-green-800 dark:text-green-300">
                          {user.servers.find(s => s.id === selectedServerId)?.name}
                        </div>
                        <div className="text-green-600 dark:text-green-400">
                          Ready to configure
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="card backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border border-orange-200 shadow-2xl mb-6">
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🤖</span>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No Servers Found</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Add CommunityClara AI to your Discord servers to configure them.
                  </p>
                  <button className="btn bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700">
                    Add Bot to Server
                  </button>
                </div>
              </div>
            )}
            
            {/* Settings Navigation */}
            {selectedServerId && (
              <>
                <div className="flex justify-center mb-8">
                  <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-1 border border-white/20 dark:border-gray-700/30 shadow-lg">
                    <button 
                      onClick={() => setSettingsTab('bot')}
                      className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                        settingsTab === 'bot' 
                          ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg transform scale-105' 
                          : 'text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-gray-100/50 dark:hover:bg-gray-700/50'
                      }`}
                    >
                      🤖 Bot Configuration
                    </button>
                    <button 
                      onClick={() => setSettingsTab('server')}
                      className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                        settingsTab === 'server' 
                          ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg transform scale-105' 
                          : 'text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-gray-100/50 dark:hover:bg-gray-700/50'
                      }`}
                    >
                      🏠 Server Settings
                    </button>
                  </div>
                </div>

                {/* Settings Content */}
                {settingsTab === 'bot' ? (
                  <BotConfig serverId={selectedServerId} />
                ) : (
                  <ServerSettings serverId={selectedServerId} />
                )}
              </>
            )}

            {/* No Server Selected Message */}
            {!selectedServerId && user?.servers?.length > 0 && (
              <div className="card backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border border-blue-200 shadow-2xl">
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">⚙️</span>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Select a Server</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Choose a server from the dropdown above to configure its settings.
                  </p>
                </div>
              </div>
            )}
          </div>
        )
      case 'home':
      default:
        return <Home />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20">
      {/* Navigation */}
      <Navbar 
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />

      {/* Main Content - Full Width */}
      <main className="transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-fade-in">
            {renderCurrentPage()}
          </div>
        </div>
      </main>

      {/* Background Animation */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 via-blue-600/5 to-cyan-600/5 animate-pulse-glow"></div>
      </div>
    </div>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App