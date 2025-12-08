// frontend/src/pages/Terms.jsx
import React from 'react'

const Terms = ({ setCurrentPage }) => {
  const sections = [
    {
      title: "Acceptance of Terms",
      icon: "📋",
      content: `
By accessing or using CommunityClara AI ("the Service"), you agree to be bound by these Terms of Service ("Terms"). If you disagree with any part of these terms, then you may not access the Service.

**What This Means**: By adding our bot to your Discord server or using our dashboard, you're agreeing to follow these rules.

**Who Can Use Our Service**:
- Discord server owners and administrators
- Users 13 years of age or older (Discord's minimum age requirement)
- Individuals with legal capacity to enter into agreements
- Organizations acting through authorized representatives

**Updates to Terms**: We may update these Terms from time to time. Continued use of the Service after changes constitutes acceptance of the new Terms.
      `
    },
    {
      title: "Service Description",
      icon: "🤖",
      content: `
**What CommunityClara Provides**:
- AI-powered content moderation for Discord servers
- Real-time analysis of messages for policy violations
- Automated moderation actions based on your configuration
- Analytics dashboard for community health insights
- Custom moderation rules and threshold adjustments

**What We Don't Provide**:
- 100% accuracy guarantee (AI systems can make mistakes)
- Legal advice or compliance guarantees
- Moderation of private messages or DMs
- Backup or recovery of Discord data
- Customer support for Discord platform issues

**Service Availability**: We strive for 99.9% uptime but cannot guarantee uninterrupted service due to:
- Scheduled maintenance windows
- Discord API limitations or outages
- Extraordinary circumstances beyond our control
- Security incidents requiring service suspension
      `
    },
    {
      title: "User Responsibilities",
      icon: "👥",
      content: `
**Server Owners/Administrators Must**:
- Ensure they have authority to add bots to their Discord server
- Configure moderation settings appropriate for their community
- Review and approve automated moderation actions
- Comply with Discord's Terms of Service and Community Guidelines
- Inform server members about AI moderation being in use

**All Users Must**:
- Provide accurate information when creating accounts
- Keep login credentials secure and confidential
- Report bugs, security issues, or inappropriate behavior
- Use the Service only for legitimate Discord server moderation
- Respect other users and our staff in all interactions

**Prohibited Activities**:
- Attempting to circumvent or interfere with our AI systems
- Using the Service to harass, threaten, or harm others
- Sharing account credentials with unauthorized individuals
- Reverse engineering or attempting to copy our technology
- Using the Service for illegal activities or spam
      `
    },
    {
      title: "Privacy & Data Handling",
      icon: "🔒",
      content: `
**Data Processing Agreement**: By using our Service, you acknowledge that:
- We process Discord messages in real-time for moderation analysis
- Message content is analyzed but not stored after processing
- We collect analytics data to improve service quality
- Server configuration and moderation logs are retained as specified

**Your Data Rights**:
- Access: View all data we have about your server
- Correction: Update incorrect information
- Deletion: Remove your data from our systems
- Portability: Export your data in standard formats
- Objection: Opt out of certain data processing activities

**GDPR & CCPA Compliance**: We fully comply with applicable privacy regulations. See our Privacy Policy for complete details.

**Data Security**: We implement industry-standard security measures including encryption, access controls, and regular security audits.
      `
    },
    {
      title: "Intellectual Property",
      icon: "⚖️",
      content: `
**Our Intellectual Property**:
- CommunityClara name, logo, and branding
- AI models, algorithms, and proprietary technology
- Dashboard interface and user experience design
- Documentation, guides, and educational content
- All improvements and derivatives of our technology

**Your Rights**:
- Use our Service according to these Terms
- Export your own data and analytics
- Provide feedback and suggestions (which become ours to use)
- Customize settings and configurations for your server

**Respect for Third-Party Rights**:
- Discord's intellectual property and API terms
- Open source libraries used in our service (properly licensed)
- Any third-party integrations or services

**DMCA Policy**: We respond to valid takedown notices. If you believe your intellectual property has been infringed, contact legal@communityclara.ai.
      `
    },
    {
      title: "Service Limitations & Disclaimers",
      icon: "⚠️",
      content: `
**AI Accuracy Disclaimer**:
- Our AI makes predictions, not perfect judgments
- False positives and false negatives will occur
- Human oversight and review are always recommended
- We continuously improve but cannot guarantee perfection

**Service Limitations**:
- Dependent on Discord's API availability and limitations
- Subject to rate limits and usage restrictions
- May not detect all forms of harmful content
- Cannot moderate content in real-time during high traffic

**No Warranty**: The Service is provided "as is" without warranties of any kind, either express or implied, including but not limited to:
- Merchantability or fitness for a particular purpose
- Accuracy, reliability, or completeness of results
- Uninterrupted or error-free operation
- Security or freedom from viruses or harmful components

**Limitation of Liability**: Our total liability for any claims related to the Service is limited to the amount you paid us in the 12 months preceding the claim.
      `
    },
    {
      title: "Billing & Cancellation",
      icon: "💳",
      content: `
**Free Service**: Core moderation features are free forever, including:
- Basic AI moderation for up to 10,000 messages/month
- Standard violation detection (toxicity, spam, NSFW)
- Basic analytics dashboard
- Community support

**Paid Plans** (Pro/Enterprise):
- Billed monthly or annually in advance
- No refunds for partial months of service
- Automatic renewal unless cancelled
- 30-day notice for plan changes or price increases

**Payment Terms**:
- Payments processed securely through Stripe or PayPal
- All prices in USD unless otherwise specified
- Taxes may apply based on your location
- Failed payments may result in service suspension

**Cancellation**:
- Cancel anytime from your dashboard
- Service continues until end of billing period
- Data retained for 30 days after cancellation
- Automatic downgrade to free plan if eligible
      `
    },
    {
      title: "Termination",
      icon: "🚪",
      content: `
**Your Right to Terminate**:
- Stop using the Service at any time
- Remove our bot from your Discord server
- Delete your account from the dashboard
- Request deletion of all your data

**Our Right to Terminate**:
We may suspend or terminate your access if you:
- Violate these Terms of Service
- Use the Service for illegal or harmful purposes
- Attempt to abuse, hack, or interfere with our systems
- Fail to pay for paid services after reasonable notice
- Violate Discord's Terms of Service

**Effect of Termination**:
- Immediate loss of access to paid features
- Data retention according to our Privacy Policy
- Outstanding payments remain due
- Survival of sections that should reasonably survive

**Appeals Process**: If your account is terminated, you may appeal by contacting support@communityclara.ai with relevant information.
      `
    },
    {
      title: "Dispute Resolution",
      icon: "🤝",
      content: `
**Informal Resolution**: Before formal proceedings, contact us at legal@communityclara.ai to attempt resolution.

**Binding Arbitration**: Any disputes will be resolved through binding arbitration rather than court proceedings, except for:
- Small claims court matters under applicable limits
- Injunctive relief for intellectual property infringement
- Emergency relief for security or safety issues

**Arbitration Rules**:
- Governed by the American Arbitration Association rules
- Single arbitrator selected through AAA process
- Location: San Francisco, California (or your location if required by law)
- Language: English

**Class Action