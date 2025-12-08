// frontend/src/pages/Home.jsx
import React, { useState, useEffect } from 'react'
import { useServers } from '../hooks/useServerStats'
import TrendChart from '../components/Dashboard/TrendChart'
import ActivityLog from '../components/Dashboard/ActivityLog'


const Home = () => {
  const [currentTime, setCurrentTime] = useState(new Date())
  const { data: serversData, isLoading } = useServers()

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const features = [
    {
      icon: '🛡️',
      title: 'AI-Powered Moderation',
      description: 'Advanced machine learning algorithms detect and prevent inappropriate content in real-time',
      gradient: 'from-blue-500 to-purple-500',
      stats: '99.3% Accuracy'
    },
    {
      icon: '🔒',
      title: 'Privacy-First Design',
      description: 'Federated learning ensures your community data never leaves your server',
      gradient: 'from-green-500 to-emerald-500',
      stats: 'Zero Data Retention'
    },
    {
      icon: '📊',
      title: 'Smart Analytics',
      description: 'Comprehensive insights into community health and engagement patterns',
      gradient: 'from-purple-500 to-pink-500',
      stats: 'Real-time Insights'
    },
    {
      icon: '🤖',
      title: 'Community Learning',
      description: 'AI adapts to your server culture while maintaining consistent safety standards',
      gradient: 'from-cyan-500 to-blue-500',
      stats: 'Adaptive AI'
    }
  ]

  const stats = [
    { label: 'Servers Protected', value: serversData?.total_count || 0, icon: '🏠', color: 'text-blue-500' },
    { label: 'Messages Analyzed', value: '2.4M+', icon: '💬', color: 'text-green-500' },
    { label: 'Violations Prevented', value: '15.7K+', icon: '🛡️', color: 'text-purple-500' },
    { label: 'Communities Safer', value: '100%', icon: '✨', color: 'text-pink-500' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-blue-600/10 to-cyan-600/10">
          <div className="absolute inset-0 opacity-50" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            {/* Logo Animation */}
            <div className="mb-8 flex justify-center">
              <div className="relative group">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-600 rounded-3xl flex items-center justify-center shadow-2xl group-hover:shadow-purple-500/25 transition-all duration-500 transform group-hover:scale-110 group-hover:rotate-3">
                  <span className="text-white font-bold text-4xl">🛡️</span>
                </div>
                <div className="absolute -inset-4 bg-gradient-to-r from-purple-600/20 to-cyan-600/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
            </div>

            {/* Main Heading */}
            <h1 className="text-6xl md:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
                CommunityClara AI
              </span>
            </h1>

            <p className="text-2xl md:text-3xl text-gray-600 dark:text-gray-300 mb-4 font-light">
              Privacy-Preserving Discord Moderation
            </p>

            <p className="text-lg text-gray-500 dark:text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed">
              Harness the power of artificial intelligence to create safer, more welcoming Discord communities 
              while respecting user privacy and adapting to your unique server culture.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <a 
                href="https://discord.com/oauth2/authorize?client_id=1399461751552213123&permissions=1099511982080&integration_type=0&scope=bot"
                target="_blank"
                rel="noopener noreferrer"
                className="btn bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 shadow-2xl hover:shadow-purple-500/25 transform hover:scale-105 transition-all duration-300 px-8 py-4 text-lg"
              >
                🚀 Add to Discord
              </a>
              <a 
                href="/docs" 
                target="_blank"
                rel="noopener noreferrer"
                className="btn bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-700 shadow-xl backdrop-blur-sm border border-white/20 dark:border-gray-700/30 px-8 py-4 text-lg"
              >
                📖 View Documentation
              </a>
            </div>


            {/* Live Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
              {stats.map((stat, index) => (
                <div 
                  key={index}
                  className="card backdrop-blur-sm bg-white/60 dark:bg-gray-900/60 border border-white/30 dark:border-gray-700/30 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                  style={{
                    animationDelay: `${index * 100}ms`,
                    animation: 'slideUp 0.6s ease-out forwards'
                  }}
                >
                  <div className="text-center">
                    <div className={`text-3xl mb-2 ${stat.color}`}>
                      {stat.icon}
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                      {stat.value}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {stat.label}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
              Why Choose CommunityClara AI?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Built for modern Discord communities that value both safety and privacy
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="group card backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border border-white/20 dark:border-gray-700/30 shadow-xl hover:shadow-2xl transform hover:scale-[1.02] transition-all duration-500"
                style={{
                  animationDelay: `${index * 150}ms`,
                  animation: 'slideUp 0.6s ease-out forwards'
                }}
              >
                <div className="flex items-start space-x-4">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300`}>
                    <span className="text-white text-2xl">{feature.icon}</span>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                        {feature.title}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${feature.gradient} text-white shadow-lg`}>
                        {feature.stats}
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Live Dashboard Preview */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Real-Time Monitoring
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              See your community health at a glance with beautiful, actionable insights
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <TrendChart type="area" />
            <ActivityLog serverId="demo" />
          </div>

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
            <TrendChart type="radial" />
            <TrendChart type="pie" />
          </div>
        </div>
      </div>

      {/* Getting Started Section */}
      <div className="py-20 bg-gradient-to-r from-purple-600/10 via-blue-600/10 to-cyan-600/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-cyan-600 bg-clip-text text-transparent mb-8">
            Ready to Protect Your Community?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <span className="text-white text-2xl">1️⃣</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Add Bot to Server
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Invite CommunityClara AI to your Discord server with one click
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <span className="text-white text-2xl">2️⃣</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Configure Settings
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Customize moderation preferences for your community
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <span className="text-white text-2xl">3️⃣</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Enjoy Safe Community
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Watch as AI learns and adapts to your server culture
              </p>
            </div>
          </div>


          {/* Live Status */}
          <div className="mt-12 flex items-center justify-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
              <span>All Systems Operational</span>
            </div>
            <span>•</span>
            <span>Last updated: {currentTime.toLocaleTimeString()}</span>
            <span>•</span>
            <span>{isLoading ? 'Loading...' : `${serversData?.total_count || 0} Active Servers`}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-t border-white/20 dark:border-gray-700/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold">🛡️</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-cyan-600 bg-clip-text text-transparent">
                    CommunityClara AI
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Privacy-preserving moderation</p>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4 max-w-md">
                Building safer Discord communities through intelligent, privacy-first AI moderation that adapts to your unique server culture.
              </p>
              <div className="flex space-x-4">
                <button className="text-gray-400 hover:text-purple-600 transition-colors duration-200">
                  <span className="text-2xl">📧</span>
                </button>
                <button className="text-gray-400 hover:text-purple-600 transition-colors duration-200">
                  <span className="text-2xl">🐦</span>
                </button>
                <button className="text-gray-400 hover:text-purple-600 transition-colors duration-200">
                  <span className="text-2xl">📱</span>
                </button>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <li><button onClick={() => setCurrentPage('features')} className="hover:text-purple-600 transition-colors duration-200 text-left">Features</button></li>
                <li><button onClick={() => setCurrentPage('api-docs')} className="hover:text-purple-600 transition-colors duration-200 text-left">API</button></li>
                <li><button onClick={() => setCurrentPage('documentation')} className="hover:text-purple-600 transition-colors duration-200 text-left">Documentation</button></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <li><button onClick={() => setCurrentPage('help')} className="hover:text-purple-600 transition-colors duration-200 text-left">Help Center</button></li>
                <li><button onClick={() => setCurrentPage('privacy')} className="hover:text-purple-600 transition-colors duration-200 text-left">Privacy Policy</button></li>
                <li><button onClick={() => setCurrentPage('terms')} className="hover:text-purple-600 transition-colors duration-200 text-left">Terms of Service</button></li>
                <li><button onClick={() => setCurrentPage('contact')} className="hover:text-purple-600 transition-colors duration-200 text-left">Contact Us</button></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-200/50 dark:border-gray-700/50 mt-8 pt-8 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              &copy; 2025 CommunityClara AI. All rights reserved. Built with ❤️ for safer communities.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Home