import React, { useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'

const GoogleSignIn = ({ onSuccess, onError }) => {
  const { login } = useAuth()

  useEffect(() => {
    const loadGoogleScript = () => {
      if (window.google) {
        initializeGoogleSignIn()
        return
      }

      const script = document.createElement('script')
      script.src = 'https://accounts.google.com/gsi/client'
      script.async = true
      script.defer = true
      script.onload = initializeGoogleSignIn
      script.onerror = (error) => {
        console.error('❌ Failed to load Google GSI script:', error)
        showFallbackButton()
      }
      document.head.appendChild(script)
    }

    const initializeGoogleSignIn = () => {
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
      
      if (!clientId) {
        console.warn('⚠️ Google Client ID not configured')
        showFallbackButton()
        return
      }

      // Add error handling for Google initialization
      try {
        if (window.google && window.google.accounts && window.google.accounts.id) {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: handleGoogleResponse,
            auto_select: false,
            cancel_on_tap_outside: true,
            context: 'signin',
            ux_mode: 'popup'
          })

          window.google.accounts.id.renderButton(
            document.getElementById('google-signin-button'),
            {
              theme: 'outline',
              size: 'large',
              text: 'signin_with',
              shape: 'rectangular',
              width: 250
            }
          )
        } else {
          console.error('❌ Google GSI library not properly loaded')
          showFallbackButton()
        }
      } catch (error) {
        console.error('❌ Error initializing Google Sign-In:', error)
        showFallbackButton()
      }
    }

    // Add delay to ensure DOM is ready
    const timer = setTimeout(loadGoogleScript, 100)
    
    return () => clearTimeout(timer)
  }, [login, onSuccess, onError])

  return (
    <div className="flex flex-col items-center space-y-4">
      <div id="google-signin-button"></div>
      
      <div className="text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          Sign in to access your personalized dashboard
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-500">
          {import.meta.env.VITE_GOOGLE_CLIENT_ID ? 
            'Secure authentication powered by Google' : 
            'Google OAuth needs to be configured'}
        </p>
      </div>
    </div>
  )
}

export default GoogleSignIn