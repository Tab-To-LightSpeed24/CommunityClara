// Create frontend/src/components/Auth/GoogleSignIn.jsx
import React, { useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'

const GoogleSignIn = ({ onSuccess, onError }) => {
  const { login } = useAuth()

  useEffect(() => {
    // Load Google Sign-In script
    const loadGoogleScript = () => {
      if (window.google) return

      const script = document.createElement('script')
      script.src = 'https://accounts.google.com/gsi/client'
      script.async = true
      script.defer = true
      script.onload = initializeGoogleSignIn
      document.head.appendChild(script)
    }

    const initializeGoogleSignIn = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
          callback: handleGoogleResponse
        })

        window.google.accounts.id.renderButton(
          document.getElementById('google-signin-button'),
          {
            theme: 'outline',
            size: 'large',
            text: 'signin_with',
            shape: 'rectangular'
          }
        )
      }
    }

    const handleGoogleResponse = async (response) => {
      try {
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

    loadGoogleScript()
  }, [login, onSuccess, onError])

  return (
    <div className="flex flex-col items-center space-y-4">
      <div id="google-signin-button"></div>
      
      {/* Custom styled button alternative */}
      <div className="text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Sign in to access your personalized dashboard and settings
        </p>
      </div>
    </div>
  )
}

export default GoogleSignIn