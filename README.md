# 🛡️ CommunityClara AI

**Privacy-Preserving Discord Moderation with AI-Powered Content Analysis**

🌐 **Live Website:** [https://community-clara.vercel.app/](https://community-clara.vercel.app/)

[![Discord Bot](https://img.shields.io/badge/Discord-Bot-7289da?style=for-the-badge&logo=discord&logoColor=white)](https://discord.com/oauth2/authorize?client_id=1399461751552213123&permissions=1099646233670&integration_type=0&scope=bot+applications.commands)
[![Python](https://img.shields.io/badge/Python-3.11+-3776ab?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![React](https://img.shields.io/badge/React-18+-61dafb?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)

## 🌟 Features

### 🤖 AI-Powered Content Moderation
- **Advanced NLP Analysis** - Uses `toxic-bert` detection via Hugging Face Transformers.
- **Multi-Category Detection**: Identifies NSFW, Toxicity, Harassment, Spam, Hate Speech, Threats, and Self-Harm.
- **Configurable Sensitivity** - Adjust strictness thresholds (0.0 - 1.0) per server.
- **Image Analysis** - Detects NSFW content in image attachments.

### 🔒 Privacy-First Architecture
- **Data Minimization** - Stores only violation metadata, not full chat logs.
- **Adaptive Learning** - Self-tunes thresholds based on false-positive feedback without retraining.
- **Server-Specific Silos** - Each community has its own isolated configuration and rules.

### ⚡ Real-Time Discord Integration
- **3-Strike System** - Progressive enforcement: Warning → Final Warning → Action (Timeout/Ban).
- **Smart Spam Detection** - Heuristic algorithm to catch rapid-fire spam and repetition.
- **Automated Actions**: Auto-delete, Auto-timeout, and Auto-kick capabilities.
- **Moderation Logs**: Detailed embed reports sent to designated admin channels.

### 📊 Comprehensive Analytics Dashboard
- **Live Health Score** - Real-time community safety metric (0-100%).
- **Violation Trends** - Interactive charts showing toxicity patterns over time.
- **Server Management** - update bot settings directly from the web interface.

## 📸 Screenshots

### 🖥️ Web Interface

| Landing Page | Dashboard | Profile |
|:---:|:---:|:---:|
| ![Landing Page](screenshots/landing-page.png) | ![Dashboard](screenshots/dashboard.png) | ![Profile Page](screenshots/profile.png) |

| Settings | Notifications | Contact Support |
|:---:|:---:|:---:|
| ![Settings](screenshots/settings.png) | ![Notifications](screenshots/notifications.png) | ![Contact Us](screenshots/contact-us.png) |

### 🤖 Discord Bot Alerts

| Toxicity Alert | Spam Alert | NSFW Violation |
|:---:|:---:|:---:|
| ![Toxicity Alert](screenshots/bot-test-screenshot.png) | ![Spam Alert](screenshots/bot-test-spam-screenshot.png) | ![NSFW Violation](screenshots/nsfw-violation.png) |

---

## 🚀 Quick Start

### Prerequisites
- Python 3.9+
- Node.js 18+
- Discord Bot Token
- Google OAuth Client ID (for dashboard login)

### 1. Clone & Setup
```bash
git clone https://github.com/Tab-To-LightSpeed24/CommunityClara.git
cd CommunityClara

# Backend setup
cd backend
python -m venv venv
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

pip install -r requirements.txt
```

### 2. Frontend Setup
```bash
cd ../frontend
npm install
```

### 3. Environment Variables
Create a `.env` file in `backend/` with:
```env
DISCORD_BOT_TOKEN=your_token_here
GOOGLE_CLIENT_ID=your_google_client_id
SECRET_KEY=your_random_secret
API_HOST=0.0.0.0
API_PORT=8000
```

### 4. Run Application
**Backend:**
```bash
# In backend folder
python run_with_bot.py
```

**Frontend:**
```bash
# In frontend folder
npm run dev
```

Visit `http://localhost:5173` to access the dashboard!
