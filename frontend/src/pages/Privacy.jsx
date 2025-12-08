// frontend/src/pages/Privacy.jsx
import React from 'react'

const Privacy = ({ setCurrentPage }) => {
  const sections = [
    {
      title: "Information We Collect",
      icon: "📊",
      content: `
**Discord Data**: When you add CommunityClara to your server, we collect:
- Server ID and basic server information
- Message content for moderation analysis (processed in real-time, not stored)
- User IDs for moderation actions and analytics
- Channel configurations and permission settings

**Account Information**: When you create an account:
- Discord username and avatar
- Email address (for important notifications only)
- Server ownership/administration status

**Usage Analytics**: To improve our service:
- Dashboard usage patterns (anonymized)
- Feature usage statistics
- Error logs and performance metrics
- General usage trends (no personal identifiers)
      `
    },
    {
      title: "How We Use Your Information",
      icon: "🎯",
      content: `
**Primary Purpose - Moderation**: 
- Real-time content analysis for violations
- Generating moderation recommendations
- Creating community health insights
- Automated moderation actions you configure

**Service Improvement**:
- Enhancing AI model accuracy
- Developing new moderation features
- Optimizing platform performance
- Providing technical support

**Communication**:
- Critical service updates and security alerts
- Feature announcements (can be disabled)
- Response to support requests
- Account and billing notifications

**Legal Compliance**:
- Complying with Discord's Terms of Service
- Responding to legal requests when required
- Preventing abuse and ensuring platform security
      `
    },
    {
      title: "Data Storage & Security",
      icon: "🔐",
      content: `
**What We DON'T Store**:
- Message content after analysis (deleted within seconds)
- Private conversations or DMs
- Deleted messages from Discord
- User personal information beyond what's necessary

**What We Store Temporarily**:
- Moderation decisions and confidence scores (30 days)
- Analytics data for dashboard insights (90 days)
- Error logs for debugging (7 days)
- Account settings and preferences (until account deletion)

**Security Measures**:
- End-to-end encryption for data transmission
- SOC 2 Type II certified data centers
- Regular security audits and penetration testing
- Multi-factor authentication for staff access
- Automatic data retention policy enforcement

**Data Location**:
- Primary servers: United States (AWS US-East)
- Backup servers: European Union (AWS EU-West)
- No data stored in countries with poor privacy laws
      `
    },
    {
      title: "Your Privacy Rights",
      icon: "⚖️",
      content: `
**Access & Control**:
- View all data we have about your server
- Download your analytics and moderation history
- Update or correct any stored information
- Configure data retention preferences

**Deletion Rights**:
- Delete your account and all associated data
- Remove specific servers from our system
- Request deletion of specific time periods
- Automated deletion after 2 years of inactivity

**Communication Preferences**:
- Opt out of non-essential emails
- Choose notification frequency
- Select which updates you receive
- Unsubscribe from all communications (except critical security)

**Data Portability**:
- Export all your data in standard formats
- Transfer analytics to other platforms
- Receive moderation logs and insights
- Download server configuration backups

**Geographic Rights**:
- GDPR compliance for EU users
- CCPA compliance for California residents
- Right to be forgotten
- Data processing transparency
      `
    },
    {
      title: "Third-Party Services",
      icon: "🤝",
      content: `
**Discord Integration**:
- We use Discord's official API
- Subject to Discord's Privacy Policy
- Only access permissions you grant
- Cannot access more than Discord allows

**AI & Analytics Providers**:
- OpenAI (for content moderation) - Data processing only, no storage
- Google Analytics (anonymized usage data)
- Sentry (error monitoring with privacy protection)
- No sharing of identifiable user data

**Service Providers**:
- Secure Cloud Hosting Providers
- CloudFlare for DDoS protection and performance
- SendGrid for transactional emails only
- All providers are GDPR and SOC 2 compliant
      `
    },
    {
      title: "Children's Privacy",
      icon: "👶",
      content: `
**Age Requirements**:
- Users must be 13+ (Discord's minimum age)
- Parental consent required for users under 16 in EU
- No intentional collection of children's data
- Immediate deletion if underage user discovered

**Special Protections**:
- Enhanced privacy for educational Discord servers
- Stricter data retention for servers with minors
- Additional security measures for school partnerships
- Compliance with COPPA and similar regulations

**Parental Rights**:
- Parents can request account deletion for minors
- Access to all data collected about their child
- Opt-out of all data collection
- Direct communication channel for concerns
      `
    }
  ]

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
          🔒 Privacy Policy
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-4">
          Your privacy is our top priority. Here's how we protect your data.
        </p>
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <p className="text-green-700 dark:text-green-400 font-medium">
            <span className="mr-2">✅</span>
            Last updated: December 8, 2025 • Effective immediately
          </p>
        </div>
      </div>

      {/* Key Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 text-center">
          <span className="text-3xl mb-2 block">🚫</span>
          <h3 className="font-bold text-blue-700 dark:text-blue-400 mb-2">No Message Storage</h3>
          <p className="text-sm text-blue-600 dark:text-blue-300">
            Messages are analyzed in real-time and immediately deleted
          </p>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6 text-center">
          <span className="text-3xl mb-2 block">🔐</span>
          <h3 className="font-bold text-green-700 dark:text-green-400 mb-2">GDPR Compliant</h3>
          <p className="text-sm text-green-600 dark:text-green-300">
            Full compliance with EU privacy regulations
          </p>
        </div>

        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-6 text-center">
          <span className="text-3xl mb-2 block">👤</span>
          <h3 className="font-bold text-purple-700 dark:text-purple-400 mb-2">You Own Your Data</h3>
          <p className="text-sm text-purple-600 dark:text-purple-300">
            Export, delete, or modify your data anytime
          </p>
        </div>
      </div>

      {/* Detailed Sections */}
      <div className="space-y-8">
        {sections.map((section, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <span className="text-2xl">{section.icon}</span>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {section.title}
              </h2>
            </div>
            <div
              className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300"
              dangerouslySetInnerHTML={{
                __html: section.content
                  .split('\n')
                  .map(line => {
                    if (line.startsWith('**') && line.endsWith('**:')) {
                      return `<h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-6 mb-3">${line.slice(2, -3)}</h3>`
                    } else if (line.startsWith('• ')) {
                      return `<li class="ml-4">${line.slice(2)}</li>`
                    } else if (line.trim()) {
                      return `<p class="mb-3">${line}</p>`
                    }
                    return ''
                  })
                  .join('')
              }}
            />
          </div>
        ))}
      </div>

      {/* Contact Section */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 text-white text-center mt-8">
        <h2 className="text-2xl font-bold mb-4">Questions About Your Privacy?</h2>
        <p className="text-lg opacity-90 mb-6">
          Our privacy team is here to help with any questions or concerns.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => setCurrentPage('contact')}
            className="btn bg-white text-purple-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold"
          >
            💬 Contact Privacy Team
          </button>

          <a
            href="mailto:privacy@communityclara.ai"
            className="btn bg-transparent border border-white text-white hover:bg-white hover:text-purple-600 px-8 py-3 rounded-lg font-semibold transition-all duration-300"
          >
            📧 privacy@communityclara.ai
          </a>
        </div>
      </div>
    </div>
  )
}

export default Privacy