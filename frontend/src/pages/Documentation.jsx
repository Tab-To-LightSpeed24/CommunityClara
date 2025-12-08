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
1. Use the invite link provided by the bot owner
2. Select your Discord server
3. Grant the "Administrator" or "Manage Messages" permissions
4. The bot will automatically join your server

### Step 2: Initial Configuration
1. Log in to the **CommunityClara Dashboard** using your Discord account
2. Select your server from the list
3. Configure your moderation thresholds (Toxicity, Spam, NSFW)
4. Enable automated actions (Auto-Delete, Auto-Timeout)

### Step 3: Test the System
1. Send a test message in a monitored channel
2. Ensure the bot has permissions to view and delete messages in that channel
3. Check your dashboard for real-time analytics

## Default Settings
- **Toxicity Threshold**: 70% (0.7)
- **Spam Detection**: Enabled
- **NSFW Detection**: Disabled by default
- **3-Strike System**: Warn 1 -> Warn 2 -> Action

## Next Steps
- Explore the [Dashboard Features](#dashboard)
- Learn about [Configuration](#configuration)
      `
    },
    'dashboard': {
      title: '📊 Dashboard Features',
      content: `
# Dashboard Overview

Your CommunityClara dashboard provides comprehensive insights into your server's health and moderation activity.

## Key Metrics

### Community Health Score
A dynamic score (0-100%) reflecting your server's safety based on violation rates and false positives.

### Real-time Analytics
- **Messages Processed**: Total messages analyzed
- **Violations Detected**: Number of flagged messages
- **False Positive Rate**: Accuracy tracking

## Violation Types

### Toxicity Detection
- Hate speech, harassment, and personal attacks
- Uses advanced AI models (Hugging Face / OpenAI)

### Spam Shield
- Rapid-fire message detection
- Repetitive content analysis
- Automated cleanup

### NSFW Content
- Image analysis for adult content
- Configurable strictness

## Logs & Appeals
- View detailed violation logs
- See original message content (masked for safety)
- Track moderation actions taken
      `
    },
    'configuration': {
      title: '⚙️ Configuration',
      content: `
# Configuration Guide

Customize CommunityClara AI to perfectly match your community's needs via the Dashboard.

## Threshold Settings

### Sensitivity Sliders (0.0 - 1.0)
- **Low (0.1 - 0.4)**: Very strict, may flag mild language
- **Medium (0.5 - 0.7)**: Balanced (Recommended)
- **High (0.8 - 0.9)**: Lenient, only flags severe violations

## Automated Actions

### auto-delete
Automatically removes messages that exceed the confidence threshold.

### auto-timeout
Temporarily times out users after the 3rd violation. Default duration is 5 minutes (300s).

### Exempt Roles
Select roles that should bypass moderation (e.g., Moderators, Admins, Bots).

## Notification Channels
- **Violation Logs**: Designated channel for moderation reports
      `
    },
    'troubleshooting': {
      title: '🔧 Troubleshooting',
      content: `
# Troubleshooting Guide

Common issues and solutions.

## Bot Not Responding

### Check Permissions
1. Ensure bot has **"Manage Messages"**, **"Kick/Ban Members"**, and **"Timeout Members"** permissions.
2. Verify the bot's role is **higher** than the users it is trying to moderate.

### Commands
Use these commands in Discord to check status:
- \`!clara help\` - Show help menu
- \`!clara status\` - Check bot uptime and stats
- \`!clara checkperms\` - Verify bot permissions
- \`!clara test\` - Run a self-test

## False Positives
If legitimate messages are being flagged:
1. Go to **Settings > Thresholds** in the dashboard
2. Increase the threshold slightly (e.g., from 0.7 to 0.75)
3. Check **Exempt Roles** to ensure trusted users are not integrated

## "Application not responding"
If slash commands fail, try using the prefix commands (\`!clara\`) or rejoin the bot to refresh cache.
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
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${activeSection === key
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