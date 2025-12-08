// frontend/src/App.jsx - State-Based Routing (Compatible with knowledge base)
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
import NotificationCenter from './components/Notifications/NotificationCenter'

// Create React Query client with optimized settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    },
    mutations: {
      retry: 1,
    }
  },
})

function AppContent() {
  const [currentPage, setCurrentPage] = useState('home')
  const [selectedServerId, setSelectedServerId] = useState(null)
  const [settingsTab, setSettingsTab] = useState('bot')
  const { isAuthenticated, loading, user } = useAuth()

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
      case 'notifications':
        return <NotificationCenter />
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
      case 'features':
        return <Features setCurrentPage={setCurrentPage} />
      case 'api-docs':
        return <ApiDocs setCurrentPage={setCurrentPage} />
      case 'documentation':
        return <Documentation setCurrentPage={setCurrentPage} />
      case 'help':
        return <HelpCenter setCurrentPage={setCurrentPage} />
      case 'privacy':
        return <PrivacyPolicy setCurrentPage={setCurrentPage} />
      case 'terms':
        return <TermsOfService setCurrentPage={setCurrentPage} />
      case 'contact':
        return <ContactUs setCurrentPage={setCurrentPage} />

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
              <div className="card backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border border-white/20 shadow-2xl">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                  🏠 Select Server
                </h3>
                <select
                  value={selectedServerId || ''}
                  onChange={(e) => setSelectedServerId(e.target.value)}
                  className="w-full input bg-white/50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-600 focus:border-purple-500 focus:ring-purple-500"
                >
                  <option value="">Select a server...</option>
                  {user.servers.map((server) => (
                    <option key={server.id} value={server.id}>
                      {server.name}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="card backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border border-white/20 shadow-2xl text-center py-8">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🏠</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No Servers Found</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Add ClaraBot to your Discord servers to start moderating
                </p>
              </div>
            )}

            {/* Settings Tabs */}
            {selectedServerId && (
              <div className="space-y-6">
                <div className="flex space-x-4 border-b border-gray-200/50 dark:border-gray-700/50">
                  <button
                    onClick={() => setSettingsTab('bot')}
                    className={`px-4 py-2 font-medium transition-colors duration-200 border-b-2 ${
                      settingsTab === 'bot'
                        ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                        : 'border-transparent text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400'
                    }`}
                  >
                    🤖 Bot Configuration
                  </button>
                  <button
                    onClick={() => setSettingsTab('server')}
                    className={`px-4 py-2 font-medium transition-colors duration-200 border-b-2 ${
                      settingsTab === 'server'
                        ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                        : 'border-transparent text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400'
                    }`}
                  >
                    🏠 Server Settings
                  </button>
                </div>

                {settingsTab === 'bot' ? (
                  <BotConfig serverId={selectedServerId} />
                ) : (
                  <ServerSettings serverId={selectedServerId} />
                )}
              </div>
            )}
          </div>
        )
      case 'home':
      default:
        return <Home setCurrentPage={setCurrentPage} />
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
  // Initialize dark mode
  useEffect(() => {
    const initializeDarkMode = () => {
      const savedTheme = localStorage.getItem('theme')
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      
      if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        document.documentElement.classList.add('dark')
        localStorage.setItem('theme', 'dark')
      } else {
        document.documentElement.classList.remove('dark')
        localStorage.setItem('theme', 'light')
      }
    }

    initializeDarkMode()
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App