// frontend/src/pages/Profile.jsx
import React from 'react'
import UserProfile from '../components/Profile/UserProfile'

const Profile = () => {
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
}

export default Profile
