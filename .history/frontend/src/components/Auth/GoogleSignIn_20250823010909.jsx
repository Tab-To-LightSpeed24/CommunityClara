import React, { useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'

const GoogleSignIn = ({ onSuccess, onError }) => {
  const { login } = useAuth()

  useEffect(() => {
    // Load Google Sign-In script
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
      document.head.appendChild(script)
    }

    const initializeGoogleSignIn = () => {
      if (window.google) {
        // For now, show a placeholder since we don't have Google Client ID yet
        const buttonContainer = document.getElementById('google-signin-button')
        if (buttonContainer) {
          buttonContainer.innerHTML = `
            <button 
              onclick="alert('Google Sign-In would work here with proper Client ID')"
              style="
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 12px;
                padding: 12px 24px;
                background: white;
                border: 1px solid #dadce0;
                border-radius: 6px;
                color: #3c4043;
                font-family: 'Google Sans', Roboto, sans-serif;
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                box-shadow: 0 1px 2px 0 rgba(60,64,67,.30), 0 1px 3px 1px rgba(60,64,67,.15);
                transition: all 0.2s;
              "
              onmouseover="this.style.boxShadow='0 1px 3px 0 rgba(60,64,67,.30), 0 4px 8px 3px rgba(60,64,67,.15)'"
              onmouseout="this.style.boxShadow='0 1px 2px 0 rgba(60,64,67,.30), 0 1px 3px 1px rgba(60,64,67,.15)'"
            >
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
                <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2.04a4.8 4.8 0 0 1-7.18-2.53H1.83v2.07A8 8 0 0 0 8.98 17z"/>
                <path fill="#FBBC05" d="M4.5 10.49a4.8 4.8 0 0 1 0-3.07V5.35H1.83a8 8 0 0 0 0 7.28l2.67-2.14z"/>
                <path fill="#EA4335" d="M8.98 4.72c1.16 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.35L4.5 7.42a4.77 4.77 0 0 1 4.48-2.7z"/>
              </svg>
              Continue with Google
            </button>
          `
        }
      }
    }

    loadGoogleScript()
  }, [login, onSuccess, onError])

  return (
    <div className="flex flex-col items-center space-y-4">
      <div id="google-signin-button"></div>
      
      <div className="text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          Sign in to access your personalized dashboard
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-500">
          Secure authentication powered by Google
        </p>
      </div>
    </div>
  )
}

export default GoogleSignIn