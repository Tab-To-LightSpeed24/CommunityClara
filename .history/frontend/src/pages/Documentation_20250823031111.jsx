// frontend/src/pages/Documentation.jsx
import React, { useState } from 'react'

const Documentation = ({ setCurrentPage }) => {
  const [activeSection, setActiveSection] = useState('getting-started')

  const sections = {
    'getting-started': {
      title: '🚀 Getting Started',
      content: `
# Getting Started with CommunityClara AI

Welcome to CommunityClara AI! This guide will help you set up and configure AI-powered moderation for your Discord server.

## Quick Setup (5 minutes)

### Step 1: Invite the Bot
1. Click the "Add to Discord" button on our homepage
2. Select your Discord server
3. Grant the necessary permissions
4. The bot will automatically join your server

### Step 2: Initial Configuration
1. Type \`/clara setup\` in any channel
2. Follow the interactive setup wizard
3. Configure your moderation thresholds
4. Set up automated actions

### Step 3: Test the System
1. Send a test message: "This is a test message"
2. The bot will analyze it and respond
3. Check your dashboard for analytics

## Default Settings
- **Toxicity Threshold**: 70%
- **Auto-delete**: Enabled for high-confidence violations
- **Warning System**: 3 warnings before timeout
- **Learning Mode**: Enabled (adapts to your community)

## Next Steps
- Explore the [Dashboard Features](#dashboard)
- Learn about [Advanced Configuration](#configuration)
- Set up [Custom Rules](#custom-rules)
      `
    },
    'dashboard': {
      title: '📊 Dashboard Features',
      content: `
# Dashboard Overview

Your CommunityClara dashboard provides comprehensive insights into your server's health and moderation activity.

## Key Metrics

### Community Health Score (0-100%)
- **90-100%**: Excellent - Very few violations, active community
- **70-89%**: Good - Occasional violations, well-moderated
- **50-69%**: Fair - Regular violations, needs attention
- **Below 50%**: Poor - High violation rate, review settings

### Real-time Analytics
- **Messages Analyzed**: Total messages processed by AI
- **Violations Detected**: Number of flagged messages
- **False Positives**: Incorrectly flagged content (helps improve accuracy)
- **Actions Taken**: Automated moderation actions

## Violation Types

### Toxicity Detection
- Hate speech and harassment
- Personal attacks
- Discriminatory language
- Threatening behavior

### Spam Detection
- Repetitive messages
- Excessive caps/emojis
- Link spam
- Promotional content

### NSFW Content
- Adult content detection
- Inappropriate images
- Suggestive text

## Interactive Charts
- **Trend Analysis**: See violations over time
- **Channel Breakdown**: Which channels need attention
- **User Activity**: Anonymous activity patterns
- **Success Rates**: Moderation effectiveness

## Export Options
- Download violation reports as CSV
- Generate executive summaries
- Export for compliance reporting
      `
    },
    'configuration': {
      title: '⚙️ Advanced Configuration',
      content: `
# Advanced Configuration

Customize CommunityClara AI to perfectly match your community's needs.

## Threshold Settings

### Toxicity Threshold (0.1 - 1.0)
- **0.1 - 0.3**: Very strict - Flags mild negative language
- **0.4 - 0.6**: Moderate - Balanced approach (recommended)
- **0.7 - 1.0**: Lenient - Only flags clear violations

### Confidence Scoring
Each message receives a confidence score. Higher scores indicate stronger certainty.

## Automated Actions

### Warning System
- **First Violation**: Private warning message
- **Second Violation**: Public warning + temporary mute
- **Third Violation**: Timeout or temporary ban

### Custom Actions
- Delete messages above threshold
- Send to moderation queue
- Notify server staff
- Create audit logs

## Channel Configuration

### Protected Channels
- Select which channels to monitor
- Set different thresholds per channel
- Exempt moderator channels
- Configure announcement channels

### Role-Based Rules
- Exempt trusted roles from moderation
- Different thresholds for new members
- VIP member considerations
- Staff override permissions

## Learning Settings

### Community Adaptation
- AI learns your server's communication style
- Reduces false positives over time
- Adapts to slang and community language
- Maintains consistent safety standards

### Feedback Integration
- Mark false positives to improve accuracy
- Community voting on borderline cases
- Continuous model improvement
- Privacy-preserving learning
      `
    },
    'troubleshooting': {
      title: '🔧 Troubleshooting',
      content: `
# Troubleshooting Guide

Common issues and solutions for CommunityClara AI.

## Bot Not Responding

### Check Permissions
1. Ensure bot has "Manage Messages" permission
2. Verify "Read Message History" is enabled
3. Check channel-specific permissions
4. Confirm bot role is above moderated roles

### Restart Bot Connection
1. Go to your dashboard
2. Click "Reconnect Bot" button
3. Wait for green status indicator
4. Test with \`/clara status\` command

## High False Positives

### Adjust Sensitivity
1. Navigate to Settings → Thresholds
2. Increase toxicity threshold by 0.1
3. Monitor for 24 hours
4. Repeat if necessary

### Mark False Positives
1. Use the "Mark as Safe" button in logs
2. Provide context if possible
3. AI will learn from your feedback
4. Check improvement in weekly reports

## Missing Violations

### Check Configuration
1. Verify all relevant channels are monitored
2. Ensure thresholds aren't too high
3. Check if user roles are exempted
4. Review custom word filters

### Update Detection Rules
1. Add custom keywords for your community
2. Enable additional violation categories
3. Adjust confidence thresholds
4. Enable experimental features

## Dashboard Issues

### Data Not Loading
1. Check internet connection
2. Clear browser cache
3. Disable ad blockers temporarily
4. Try incognito/private browsing

### Sync Problems
1. Force refresh dashboard
2. Disconnect and reconnect Discord
3. Check API key validity
4. Contact support if persistent

## Performance Issues

### High Resource Usage
1. Monitor server CPU/memory
2. Adjust analysis frequency
3. Limit concurrent processing
4. Consider upgrading server plan

### Slow Response Times
1. Check Discord API status
2. Monitor network latency
3. Optimize bot settings
4. Report persistent issues

## Getting Help

### Self-Service Options
- Check this documentation
- Review dashboard alerts
- Test with \`/clara diagnose\`
- Check community forums

### Contact Support
- Use in-app chat widget
- Email: support@communityclara.ai
- Discord: Join our support server
- Response time: Usually within 2 hours
      `
    },
    'api': {
      title: '🔌 API Reference',
      content: `
# API Integration Guide

Integrate CommunityClara AI into your own applications and workflows.

## Authentication

### Getting Your API Key
1. Go to Dashboard → API Settings
2. Click "Generate New API Key"
3. Store securely (never commit to code)
4. Use in Authorization header

### API Key Usage
\`\`\`
Authorization: Bearer your-api-key-here
\`\`\`

## Rate Limits
- **Free Tier**: 1,000 requests/hour
- **Pro Tier**: 10,000 requests/hour
- **Enterprise**: Custom limits

## Core Endpoints

### Content Analysis
Analyze text content for violations:

\`\`\`javascript
POST /api/v1/analyze
{
  "content": "Text to analyze",
  "server_id": "optional-server-id",
  "context": "optional-context"
}
\`\`\`

### Server Management
Get server statistics and configuration:

\`\`\`javascript
GET /api/v1/servers/{server_id}/stats
GET /api/v1/servers/{server_id}/violations
POST /api/v1/servers/{server_id}/config
\`\`\`

### Real-time Webhooks
Receive notifications for violations:

\`\`\`javascript
POST /api/v1/webhooks/subscribe
{
  "url": "https://your-server.com/webhook",
  "events": ["violation.detected", "user.warned"]
}
\`\`\`

## SDKs and Libraries

### JavaScript/Node.js
\`\`\`bash
npm install @communityclara/api
\`\`\`

### Python
\`\`\`bash
pip install communityclara-api
\`\`\`

### Examples
Check our [GitHub repository](https://github.com/communityclara/examples) for complete examples in multiple languages.

## Webhook Events

### violation.detected
Triggered when content is flagged:
\`\`\`json
{
  "event": "violation.detected",
  "server_id": "123456789",
  "user_id": "987654321",
  "message_id": "555666777",
  "violation_type": "toxicity",
  "confidence": 0.95,
  "action_taken": "deleted"
}
\`\`\`

### user.warned
Triggered when user receives warning:
\`\`\`json
{
  "event": "user.warned",
  "server_id": "123456789",
  "user_id": "987654321",
  "warning_count": 2,
  "total_warnings": 3
}
\`\`\`

## Error Handling

### Common Error Codes
- **400**: Bad Request - Invalid parameters
- **401**: Unauthorized - Invalid API key
- **429**: Rate Limited - Too many requests
- **500**: Server Error - Contact support

### Error Response Format
\`\`\`json
{
  "error": "invalid_request",
  "message": "Missing required parameter: content",
  "code": 400
}
\`\`\`

## Best Practices

### Security
- Never expose API keys in client-side code
- Rotate keys regularly
- Use HTTPS for all requests
- Validate webhook signatures

### Performance
- Cache responses when appropriate
- Use batch operations for multiple items
- Implement exponential backoff for retries
- Monitor your rate limit usage

### Reliability
- Handle errors gracefully
- Implement timeout mechanisms
- Log API interactions for debugging
- Set up monitoring and alerts
      `
    }
  }

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
          📚 Documentation
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          Everything you need to know about using CommunityClara AI
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sticky top-8">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Contents</h3>
            <nav className="space-y-2">
              {Object.entries(sections).map(([key, section]) => (
                <button
                  key={key}
                  onClick={() => setActiveSection(key)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    activeSection === key
                      ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {section.title}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8">
            <div className="prose prose-purple dark:prose-invert max-w-none">
              <div 
                dangerouslySetInnerHTML={{ 
                  __html: sections[activeSection].content
                    .split('\n')
                    .map(line => {
                      if (line.startsWith('# ')) {
                        return `<h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">${line.substring(2)}</h1>`
                      } else if (line.startsWith('## ')) {
                        return `<h2 class="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4 mt-8">${line.substring(3)}</h2>`
                      } else if (line.startsWith('### ')) {
                        return `<h3 class="text-xl font-medium text-gray-900 dark:text-gray-100 mb-3 mt-6">${line.substring(4)}</h3>`
                      } else if (line.startsWith('- ')) {
                        return `<li class="text-gray-600 dark:text-gray-300 mb-1">${line.substring(2)}</li>`
                      } else if (line.startsWith('```')) {
                        return line.includes('```') && !line.startsWith('```') ? 
                          `</code></pre>` : 
                          `<pre class="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto my-4"><code>`
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
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white text-center">
          <h3 className="text-xl font-bold mb-2">🚀 Quick Start</h3>
          <p className="mb-4 opacity-90">Get up and running in 5 minutes</p>
          <button
            onClick={() => setActiveSection('getting-started')}
            className="btn bg-white text-purple-600 hover:bg-gray-100 px-6 py-2 rounded-lg font-semibold"
          >
            Start Here
          </button>
        </div>
        
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white text-center">
          <h3 className="text-xl font-bold mb-2">🔌 API Docs</h3>
          <p className="mb-4 opacity-90">Integrate with your apps</p>
          <button
            onClick={() => setCurrentPage('api-docs')}
            className="btn bg-white text-blue-600 hover:bg-gray-100 px-6 py-2 rounded-lg font-semibold"
          >
            View API
          </button>
        </div>
        
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white text-center">
          <h3 className="text-xl font-bold mb-2">💬 Get Help</h3>
          <p className="mb-4 opacity-90">Need assistance? We're here!</p>
          <button
            onClick={() => setCurrentPage('contact')}
            className="btn bg-white text-green-600 hover:bg-gray-100 px-6 py-2 rounded-lg font-semibold"
          >
            Contact Us
          </button>
        </div>
      </div>
    </div>
  )
}

export default Documentation