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

    const showFallbackButton = () => {
      const buttonContainer = document.getElementById('google-signin-button')
      if (buttonContainer) {
        buttonContainer.innerHTML = `
          <button 
            onclick="alert('Please configure VITE_GOOGLE_CLIENT_ID in your .env file')"
            style="
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 12px;
              padding: 12px 24px;
              background: #f8f9fa;
              border: 1px solid #dadce0;
              border-radius: 6px;
              color: #3c4043;
              font-family: 'Roboto', sans-serif;
              font-size: 14px;
              font-weight: 500;
              cursor: pointer;
              width: 250px;
            "
          >
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
              <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2.04a4.8 4.8 0 0 1-7.18-2.53H1.83v2.07A8 8 0 0 0 8.98 17z"/>
              <path fill="#FBBC05" d="M4.5 10.49a4.8 4.8 0 0 1 0-3.07V5.35H1.83a8 8 0 0 0 0 7.28l2.67-2.14z"/>
              <path fill="#EA4335" d="M8.98 4.72c1.16 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.35L4.5 7.42a4.77 4.77 0 0 1 4.48-2.7z"/>
            </svg>
            Configure Google OAuth
          </button>
        `
      }
    }

    const handleGoogleResponse = async (response) => {
      try {
        console.log('🔐 Google response received')
        const result = await login(response.credential)
        
        if (result.success) {
          onSuccess?.(result.user)
        } else {
          onError?.(result.error)
        }
      } catch (error) {
        console.error('❌ Google sign-in error:', error)
        onError?.('Sign-in failed')
      }
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
          
          console.log('✅ Google Sign-In initialized successfully')
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