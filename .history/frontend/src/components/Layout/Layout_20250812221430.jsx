// frontend/src/components/Layout/Layout.jsx
import React, { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Navbar from './Navbar'
import Sidebar from './Sidebar'
import { useAuth } from '../../contexts/AuthContext'

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { isAuthenticated } = useAuth()
  const location = useLocation()

  // Don't show sidebar on home page for non-authenticated users
  const showSidebar = isAuthenticated && location.pathname !== '/'

  return (
    <div className="min-h-screen">
      {/* Navigation Bar */}
      <Navbar onMenuClick={() => setSidebarOpen(true)} />

      <div className="flex">
        {/* Sidebar for authenticated users */}
        {showSidebar && (
          <>
            {/* Desktop Sidebar */}
            <div className="hidden lg:block">
              <Sidebar />
            </div>

            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
              <div className="lg:hidden">
                <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setSidebarOpen(false)} />
                <div className="fixed inset-y-0 left-0 z-50 w-64">
                  <Sidebar onClose={() => setSidebarOpen(false)} />
                </div>
              </div>
            )}
          </>
        )}

        {/* Main Content */}
        <main className={`flex-1 transition-all duration-300 ${showSidebar ? 'lg:ml-64' : ''}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="animate-fade-in">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default Layout