// frontend/src/pages/HelpCenter.jsx
import React, { useState } from 'react'

const HelpCenter = ({ setCurrentPage }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const categories = [
    { id: 'all', name: 'All Topics', icon: '📋' },
    { id: 'setup', name: 'Setup & Installation', icon: '🚀' },
    { id: 'configuration', name: 'Configuration', icon: '⚙️' },
    { id: 'moderation', name: 'Moderation', icon: '🛡️' },
    { id: 'troubleshooting', name: 'Troubleshooting', icon: '🔧' },
    { id: 'api', name: 'API & Integration', icon: '🔌' },
    { id: 'billing', name: 'Billing & Account', icon: '💳' }
  ]

  const faqs = [
    {
      id: 1,
      category: 'setup',
      question: 'How do I add CommunityClara to my Discord server?',
      answer: `To add CommunityClara to your Discord server:

1. **Click the "Add to Discord" button** on our homepage
2. **Select your server** from the dropdown (you need Manage Server permissions)
3. **Review and approve permissions** - Clara needs these to moderate effectively:
   - Read Messages
   - Send Messages
   - Manage Messages (to delete violations)
   - Kick Members (for escalated violations)
   - Ban Members (for severe violations)
4. **Complete the setup** by typing \`/clara setup\` in any channel
5. **Configure your preferences** through the interactive setup wizard

The bot will be ready to protect your community immediately!`,
      tags: ['setup', 'discord', 'installation', 'permissions']
    },
    {
      id: 2,
      category: 'configuration',
      question: 'How do I adjust the sensitivity of content moderation?',
      answer: `You can adjust moderation sensitivity in several ways:

**Through Discord Commands:**
- \`/clara threshold toxicity 0.8\` - Set toxicity threshold (0.1 = strict, 1.0 = lenient)
- \`/clara threshold spam 0.7\` - Adjust spam detection
- \`/clara threshold nsfw 0.9\` - Configure NSFW detection

**Through the Dashboard:**
1. Go to your server dashboard
2. Navigate to Settings → Moderation Thresholds
3. Use the sliders to adjust each category
4. Click "Save Changes"

**Recommended Settings:**
- **New servers**: Start with 0.7 (moderate)
- **Family-friendly**: Use 0.4-0.5 (strict)
- **Gaming communities**: Use 0.8-0.9 (lenient)

Monitor your dashboard for false positives and adjust accordingly.`,
      tags: ['sensitivity', 'thresholds', 'configuration', 'moderation']
    },
    {
      id: 3,
      category: 'moderation',
      question: 'What happens when content is flagged?',
      answer: `When CommunityClara detects a violation:

**Immediate Actions:**
1. **Content Analysis** - AI analyzes the message in real-time
2. **Confidence Scoring** - Assigns a confidence score (0-100%)
3. **Threshold Check** - Compares against your configured thresholds

**Automated Responses:**
- **High Confidence (90%+)**: Immediate deletion + warning
- **Medium Confidence (70-89%)**: Warning + log for review
- **Low Confidence (50-69%)**: Log only for human review

**Progressive Enforcement:**
- **1st Violation**: Private warning message
- **2nd Violation**: Public warning + 5 minute timeout
- **3rd Violation**: 1 hour timeout
- **4th+ Violations**: Escalate to human moderators

**Logging & Appeals:**
- All actions are logged in your dashboard
- Users can appeal decisions
- Moderators can review and override decisions`,
      tags: ['moderation', 'violations', 'actions', 'enforcement']
    },
    {
      id: 4,
      category: 'troubleshooting',
      question: 'The bot is not responding to violations. What should I check?',
      answer: `If CommunityClara isn't responding, check these common issues:

**1. Permissions Check:**
- Ensure bot role has "Manage Messages" permission
- Check that bot role is above roles of users being moderated
- Verify channel-specific permissions aren't blocking the bot

**2. Configuration Issues:**
- Check if monitoring is enabled: \`/clara status\`
- Verify thresholds aren't set too high (above 0.95)
- Ensure the channel isn't in the exempt list

**3. Bot Status:**
- Check bot's online status (green dot next to name)
- Look for error messages in your dashboard
- Try \`/clara ping\` to test responsiveness

**4. Recent Changes:**
- Did you recently change server permissions?
- Were there Discord API outages? (Check Discord Status)
- Have you modified bot settings recently?

**Quick Fixes:**
- Restart bot connection in dashboard
- Re-invite bot with fresh permissions
- Contact support with your server ID if issues persist

**Still not working?** Use our diagnostic command: \`/clara diagnose\``,
      tags: ['troubleshooting', 'not working', 'permissions', 'bot offline']
    },
    {
      id: 5,
      category: 'api',
      question: 'How do I get an API key for custom integrations?',
      answer: `To get your API key for custom integrations:

**Step 1: Access Your Dashboard**
1. Sign in to your CommunityClara account
2. Navigate to your server dashboard
3. Go to Settings → API & Integrations

**Step 2: Generate API Key**
1. Click "Generate New API Key"
2. Add a description (e.g., "My Bot Integration")
3. Select permissions scope:
   - Read: View server stats and violations
   - Write: Create/update server settings
   - Admin: Full access including user management
4. Click "Create Key"

**Step 3: Secure Your Key**
- **Copy immediately** - it won't be shown again
- Store in environment variables, never in code
- Use HTTPS for all API requests
- Regenerate if compromised

**Usage Example:**
\`\`\`javascript
const response = await fetch('/api/v1/servers/123/stats', {
  headers: {
    'Authorization': 'Bearer your-api-key-here',
    'Content-Type': 'application/json'
  }
})
\`\`\`

**Rate Limits:**
- Free: 1,000 requests/hour
- Pro: 10,000 requests/hour
- Enterprise: Custom limits

Need help with integration? Check our [API Documentation](#) or contact our developer support team.`,
      tags: ['api', 'integration', 'api key', 'development']
    },
    {
      id: 6,
      category: 'billing',
      question: 'Is CommunityClara really free? What are the limitations?',
      answer: `Yes! CommunityClara AI is completely free for most Discord communities:

**Free Forever Features:**
✅ AI-powered content moderation
✅ Real-time violation detection
✅ Basic analytics dashboard
✅ Up to 10,000 messages/month analysis
✅ Standard violation types (toxicity, spam, NSFW)
✅ Basic automated actions
✅ Community support

**No Credit Card Required:**
- No trial periods or expiration dates
- No hidden fees or surprise charges
- No feature limitations after "trial"
- Export your data anytime

**Why Free?**
- We believe in safer communities for everyone
- Funded by optional enterprise features
- Community feedback helps improve our AI
- Building trust through transparency

**Enterprise Features (Optional):**
- Unlimited message analysis
- Advanced custom rules
- Priority support
- White-label solutions
- Custom AI model training
- Dedicated account manager

**Fair Usage Policy:**
- Free tier covers 99% of Discord servers
- No throttling or artificial limits
- Abuse protection (not for spam servers)

**Future Commitment:**
We pledge to keep core moderation features free forever. Our mission is making online communities safer, not maximizing profits.

Have questions about usage limits? Contact us - we're happy to help!`,
      tags: ['free', 'pricing', 'billing', 'limitations', 'enterprise']
    }
  ]

  const filteredFaqs = faqs.filter(faq => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory
    const matchesSearch = searchQuery === '' || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    
    return matchesCategory && matchesSearch
  })

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <nav className="mb-6">
          <button 
            onClick={() => setCurrentPage('home')}
            className="text-purple-600 dark:text-purple-400 hover:underline"
          >
            ← Back to Home
          </button>
        </nav>
        
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
          💬 Help Center
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          Find answers to common questions and get help with CommunityClara AI
        </p>
      </div>

      {/* Search Bar */}
      <div className="max-w-2xl mx-auto">
        <div className="relative">
          <input
            type="text"
            placeholder="Search for help articles, features, or issues..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-6 py-4 pl-12 pr-4 text-lg border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 focus:outline-none focus:ring-4 focus:ring-purple-500/30 focus:border-purple-500"
          />
          <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl">
            🔍
          </span>
        </div>
      </div>

      {/* Categories */}
      <div className="flex flex-wrap justify-center gap-3">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
              selectedCategory === category.id
                ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 shadow-md'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
            }`}
          >
            <span>{category.icon}</span>
            <span>{category.name}</span>
          </button>
        ))}
      </div>

      {/* FAQ Results */}
      <div className="space-y-6">
        {filteredFaqs.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🔍</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No Results Found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Try different keywords or browse our categories above
            </p>
            <button
              onClick={() => {setSearchQuery(''); setSelectedCategory('all')}}
              className="btn bg-purple-600 text-white hover:bg-purple-700"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          filteredFaqs.map((faq) => (
            <div key={faq.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <details className="group">
                <summary className="flex justify-between items-center p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 pr-4">
                    {faq.question}
                  </h3>
                  <span className="text-purple-600 dark:text-purple-400 transform group-open:rotate-180 transition-transform duration-200 flex-shrink-0">
                    ⌄
                  </span>
                </summary>
                <div className="px-6 pb-6">
                  <div className="prose prose-purple dark:prose-invert max-w-none">
                    <div 
                      dangerouslySetInnerHTML={{ 
                        __html: faq.answer
                          .split('\n')
                          .map(line => {
                            if (line.startsWith('**') && line.endsWith('**')) {
                              return `<h4 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 mt-4">${line.slice(2, -2)}</h4>`
                            } else if (line.startsWith('- ')) {
                              return `<li class="text-gray-600 dark:text-gray-300 mb-1">${line.substring(2)}</li>`
                            } else if (line.startsWith('✅ ')) {
                              return `<li class="text-green-600 dark:text-green-400 mb-1 flex items-center"><span class="mr-2">✅</span>${line.substring(3)}</li>`
                            } else if (line.includes('`') && !line.startsWith('```')) {
                              return `<p class="text-gray-600 dark:text-gray-300 mb-3">${line.replace(/`([^`]+)`/g, '<code class="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm">$1</code>')}</p>`
                            } else if (line.trim()) {
                              return `<p class="text-gray-600 dark:text-gray-300 mb-3">${line}</p>`
                            }
                            return '<br />'
                          })
                          .join('')
                      }}
                    />
                  </div>
                  
                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    {faq.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-md"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </details>
            </div>
          ))
        )}
      </div>

      {/* Contact Support */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-8 text-white text-center">
        <h2 className="text-2xl font-bold mb-4">Still Need Help?</h2>
        <p className="text-lg opacity-90 mb-6">
          Our support team is available 24/7 to assist you
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => setCurrentPage('contact')}
            className="btn bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold"
          >
            💬 Contact Support
          </button>

        </div>
      </div>
    </div>
  )
}

export default HelpCenter