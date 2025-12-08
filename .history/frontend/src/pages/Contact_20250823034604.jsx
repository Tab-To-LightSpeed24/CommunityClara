// frontend/src/pages/Contact.jsx
import React, { useState } from 'react'

const Contact = ({ setCurrentPage }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    type: 'general'
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    setSubmitted(true)
    setIsSubmitting(false)
  }

  const contactTypes = [
    { value: 'general', label: '💬 General Inquiry', icon: '💬' },
    { value: 'technical', label: '🔧 Technical Support', icon: '🔧' },
    { value: 'billing', label: '💳 Billing Question', icon: '💳' },
    { value: 'feature', label: '💡 Feature Request', icon: '💡' },
    { value: 'bug', label: '🐛 Bug Report', icon: '🐛' },
    { value: 'partnership', label: '🤝 Partnership', icon: '🤝' }
  ]

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <div className="bg-green-50 dark:bg-green-900/20 rounded-2xl p-8">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl">✅</span>
          </div>
          <h2 className="text-2xl font-bold text-green-700 dark:text-green-400 mb-4">
            Message Sent Successfully!
          </h2>
          <p className="text-green-600 dark:text-green-300 mb-6">
            Thank you for reaching out! Our team will get back to you within 24 hours.
          </p>
          <button
            onClick={() => setSubmitted(false)}
            className="btn bg-green-500 text-white hover:bg-green-600 px-6 py-2 rounded-lg"
          >
            Send Another Message
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
          📞 Contact Us
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300">
          We're here to help! Get in touch with our team.
        </p>
      </div>


      {/* Contact Options - Updated */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white text-center">
            <span className="text-3xl mb-2 block">📧</span>
            <h3 className="font-bold mb-2">Email Support</h3>
            <p className="text-sm opacity-90 mb-4">support@communityclara.ai</p>
            <p className="text-xs opacity-75">We respond within 24 hours</p>
        </div>
        
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white text-center">
            <span className="text-3xl mb-2 block">💬</span>
            <h3 className="font-bold mb-2">Send Message</h3>
            <p className="text-sm opacity-90 mb-4">Use the form below for instant delivery</p>
            <p className="text-xs opacity-75">Direct to our support team</p>
        </div>
        </div>


      {/* Contact Form */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          Send us a message
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Contact Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              What can we help you with?
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {contactTypes.map((type) => (
                <label
                  key={type.value}
                  className={`relative cursor-pointer rounded-lg border-2 p-3 text-center transition-all duration-200 ${
                    formData.type === type.value
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:border-purple-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="type"
                    value={type.value}
                    checked={formData.type === type.value}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <span className="text-xl block mb-1">{type.icon}</span>
                  <span className="text-xs font-medium">{type.label.split(' ').slice(1).join(' ')}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Name and Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                placeholder="Enter your full name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                placeholder="Enter your email"
              />
            </div>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Subject *
            </label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
              placeholder="Brief description of your inquiry"
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Message *
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white resize-none"
              placeholder="Please provide as much detail as possible..."
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 px-8 py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Sending...</span>
                </span>
              ) : (
                'Send Message'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Contact