import React, { useState, useEffect } from 'react'
import { useServers } from '../hooks/useServerStats'
import TrendChart from '../components/Dashboard/TrendChart'
import ActivityLog from '../components/Dashboard/ActivityLog'
import { motion } from 'framer-motion'


const Home = ({ setCurrentPage }) => {

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
      description: 'Secure processing and adaptive thresholds ensure your community data remains private',
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  return (
    <div className="min-h-screen bg-transparent">
      {/* Hero Section */}
      <div className="relative overflow-hidden pt-10 pb-20">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Logo Animation */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0, rotate: -10 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{ duration: 0.5, type: 'spring' }}
              className="mb-8 flex justify-center"
            >
              <div className="relative group cursor-pointer">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-600 rounded-3xl flex items-center justify-center shadow-2xl group-hover:shadow-purple-500/50 transition-all duration-500 transform group-hover:rotate-6">
                  <span className="text-white font-bold text-4xl">🛡️</span>
                </div>
                <div className="absolute -inset-4 bg-gradient-to-r from-purple-600/30 to-cyan-600/30 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight"
            >
              <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
                CommunityClara AI
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl md:text-3xl text-gray-600 dark:text-gray-300 mb-6 font-light"
            >
              Privacy-Preserving Discord Moderation
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-lg text-gray-500 dark:text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed"
            >
              Harness the power of artificial intelligence to create safer, more welcoming Discord communities
              while respecting user privacy and adapting to your unique server culture.
            </motion.p>

            {/* CTA Buttons - SANITIZED */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center mb-20"
            >
              <a
                href="https://discord.com/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=YOUR_PERMISSIONS&integration_type=0&scope=bot+applications.commands"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary px-8 py-4 text-lg shadow-xl shadow-blue-600/20 hover:shadow-blue-600/30 transform hover:-translate-y-1 transition-all"
              >
                🚀 Add to Discord
              </a>
              <button
                onClick={() => setCurrentPage('help')}
                className="btn btn-secondary px-8 py-4 text-lg transform hover:-translate-y-1 transition-all"
              >
                📖 View Documentation
              </button>
            </motion.div>

            {/* Live Stats */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-2 md:grid-cols-4 gap-6"
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="card p-6 flex flex-col items-center justify-center text-center hover:border-purple-500/30 transition-colors"
                >
                  <div className={`text-4xl mb-3 ${stat.color} filter drop-shadow-sm`}>
                    {stat.icon}
                  </div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1 tracking-tight">
                    {stat.value}
                  </div>
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </motion.div>
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

      {/* Footer Section */}
      <footer className="mt-20 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl">
        <div className="px-8 py-12">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">

            {/* Company Info */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">🛡️</span>
                </div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-cyan-600 bg-clip-text text-transparent">
                  CommunityClara
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4 max-w-md">
                AI-powered moderation platform making Discord communities safer, smarter, and more inclusive.
                Trusted by thousands of servers worldwide.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-purple-600 transition-colors duration-200">
                  <span className="sr-only">Discord</span>
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Product Links */}
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Product</h4>
              <ul className="space-y-3">
                <li>
                  <button
                    onClick={() => setCurrentPage('api-docs')}
                    className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-200"
                  >
                    API Documentation
                  </button>
                </li>
                <li>
                  <a href="#features" className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-200">
                    Features
                  </a>
                </li>
              </ul>
            </div>

            {/* Support Links */}
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Support</h4>
              <ul className="space-y-3">
                <li>
                  <button
                    onClick={() => setCurrentPage('help')}
                    className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-200"
                  >
                    Help Center
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setCurrentPage('contact')}
                    className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-200"
                  >
                    Contact Us
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Footer */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-4 md:mb-0">
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  © 2025 CommunityClara AI. All rights reserved. Making Discord communities safer.
                </p>
              </div>
              <div className="flex flex-wrap gap-6 text-sm">
                <button
                  onClick={() => setCurrentPage('privacy')}
                  className="text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-200"
                >
                  🔒 Privacy Policy
                </button>
                <button
                  onClick={() => setCurrentPage('terms')}
                  className="text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-200"
                >
                  📄 Terms of Service
                </button>
              </div>
            </div>
          </div>
        </div>
      </footer>

    </div>
  )
}

export default Home