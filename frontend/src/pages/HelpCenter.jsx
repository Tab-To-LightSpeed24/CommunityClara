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
    { id: 'troubleshooting', name: 'Troubleshooting', icon: '🔧' }
  ]

  const faqs = [
    {
      id: 1,
      category: 'setup',
      question: 'How do I add CommunityClara to my Discord server?',
      answer: `To add CommunityClara to your Discord server:

1. **Use the Invite Link** provided by the bot administrator.
2. **Select your server** from the dropdown.
3. **Grant Permissions**:
   - Manage Messages (Essential for auto-delete)
   - Read Message History (Essential for analysis)
   - Moderate Members (Essential for timeouts)
4. **Login to Dashboard**: Use your Discord account to access the web dashboard and configure settings.

The bot will be ready to protect your community immediately!`,
      tags: ['setup', 'discord', 'installation', 'permissions']
    },
    {
      id: 2,
      category: 'configuration',
      question: 'How do I adjust the sensitivity?',
      answer: `You can adjust moderation sensitivity primarily through the **Dashboard**:

1. Go to your server dashboard
2. Navigate to **Settings**
3. Adjust the **Sensitivity Sliders**:
   - **0.1 - 0.4**: Strict (High false positives)
   - **0.5 - 0.7**: Balanced (Recommended)
   - **0.8 - 0.9**: Lenient (Low false positives)
4. Click "Save Changes"

You can also check current settings with \`!clara status\`.`,
      tags: ['sensitivity', 'thresholds', 'configuration', 'moderation']
    },
    {
      id: 3,
      category: 'moderation',
      question: 'What happens when content is flagged?',
      answer: `When CommunityClara detects a violation:

**Immediate Actions:**
1. **Content Analysis**: AI analyzes text/images in real-time
2. **Confidence Check**: If score > threshold (e.g., 0.7), it flags the content.
3. **Action**: If Auto-Delete is enabled, the message is removed.

**3-Strike System:**
- **1st Violation**: User receives a generic warning.
- **2nd Violation**: User receives a final warning.
- **3rd Violation**: User is Timed Out (default 5 mins) and warnings reset.

**Logging:**
- All actions are logged in the dashboard.
- Violations can be reviewed and marked as "False Positive" to improve the AI.`,
      tags: ['moderation', 'violations', 'actions', 'enforcement']
    },
    {
      id: 4,
      category: 'troubleshooting',
      question: 'The bot is not responding. What should I check?',
      answer: `If CommunityClara isn't responding:

**1. Permissions Check:**
- Use \`!clara checkperms\` to run a self-diagnostic.
- Ensure the bot's role is **higher** than the users it's trying to moderate.

**2. Status Check:**
- Use \`!clara status\` or \`!clara test\`.
- Check if the dashboard shows "Online".

**3. Common Fixes:**
- Re-invite the bot if permissions are broken.
- Ensure the channel is not in the "Exempt Channels" list in the dashboard.`,
      tags: ['troubleshooting', 'not working', 'permissions', 'bot offline']
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
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${selectedCategory === category.id
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
              onClick={() => { setSearchQuery(''); setSelectedCategory('all') }}
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