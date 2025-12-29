# 🚀 CommunityClara AI - Complete Setup & Troubleshooting Guide

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Backend Setup](#backend-setup)
3. [Frontend Setup](#frontend-setup)
4. [Discord Bot Setup](#discord-bot-setup)
5. [Testing the Bot](#testing-the-bot)
6. [Troubleshooting Common Issues](#troubleshooting-common-issues)
7. [Environment Variables](#environment-variables)

---

## Prerequisites

### Required Software
- **Python 3.9+** (Check: `python --version`)
- **Node.js 18+** (Check: `node --version`)
- **npm** (Check: `npm --version`)
- **Git** (Check: `git --version`)

### Required Accounts
- **Discord Developer Account** - [Discord Developer Portal](https://discord.com/developers/applications)
- **OpenAI Account** (Optional) - [OpenAI Platform](https://platform.openai.com/)
- **Google Cloud Account** (Optional, for Google OAuth) - [Google Cloud Console](https://console.cloud.google.com/)

---

## Backend Setup

### Step 1: Navigate to Backend Directory
```bash
cd c:\Users\asus\safespace-ai\backend
```

### Step 2: Create Virtual Environment (if not exists)
```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate

# On Mac/Linux:
source venv/bin/activate
```

### Step 3: Install Dependencies
```bash
pip install -r requirements.txt
```

**Expected packages:**
- `discord.py==2.3.2` ✅ (Already installed)
- `fastapi==0.104.1`
- `transformers` (for HuggingFace ML models)
- `torch` (PyTorch for ML)
- `openai` (optional)
- `sqlalchemy`
- `uvicorn`

### Step 4: Configure Environment Variables

Create/Edit `.env` file in the `backend` directory:

```env
# Discord Configuration (REQUIRED)
DISCORD_BOT_TOKEN=your_discord_bot_token_here
DISCORD_CLIENT_ID=your_discord_client_id_here
DISCORD_CLIENT_SECRET=your_discord_client_secret_here
DISCORD_REDIRECT_URI=http://localhost:3000/auth/callback

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# Security
JWT_SECRET_KEY=your-super-secret-jwt-key-change-this-to-random-string

# OpenAI (Optional - for OpenAI Moderation API)
OPENAI_API_KEY=your_openai_api_key_here

# ML Model Configuration
CONTENT_ANALYZER=huggingface
# Options: "huggingface" (free, local), "openai" (paid, API), "mock" (testing)

# Database
DATABASE_URL=sqlite:///./safespace.db

# API Configuration
API_HOST=0.0.0.0
API_PORT=8000
DEBUG=True

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

### Step 5: Initialize Database
```bash
# The database will be created automatically on first run
# Location: backend/safespace.db
```

### Step 6: Start the Backend Server

**Option A: Run with Discord Bot (Recommended)**
```bash
python -m app.main_with_bot
```

**Option B: Run without Discord Bot**
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Expected Output:**
```
🚀 Starting ClaraBot AI with Discord Integration
✅ Database initialized
🤖 Starting Discord bot...
🤗 Hugging Face analyzer ready for initialization
🎉 Discord bot startup initiated
🎉 ClaraBot AI is ready!
INFO:     Uvicorn running on http://0.0.0.0:8000
```

**Verify Backend:**
- Open browser: http://localhost:8000
- Check health: http://localhost:8000/health
- API docs: http://localhost:8000/docs

---

## Frontend Setup

### Step 1: Navigate to Frontend Directory
```bash
cd c:\Users\asus\safespace-ai\frontend
```

### Step 2: Install Dependencies
```bash
npm install
```

**Expected packages:**
- `react`
- `react-dom`
- `vite`
- `tailwindcss`
- `axios`
- `framer-motion`
- `recharts`
- `lucide-react`

### Step 3: Configure Environment Variables

Create/Edit `.env` file in the `frontend` directory:

```env
VITE_API_URL=http://localhost:8000
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
```

### Step 4: Start the Development Server
```bash
npm run dev
```

**Expected Output:**
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

**Verify Frontend:**
- Open browser: http://localhost:5173
- You should see the CommunityClara landing page

---

## Discord Bot Setup

### Step 1: Create Discord Application

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click **"New Application"**
3. Name it: `CommunityClara` (or your preferred name)
4. Click **"Create"**

### Step 2: Configure Bot

1. Go to **"Bot"** tab in left sidebar
2. Click **"Add Bot"** → **"Yes, do it!"**
3. Under **"Privileged Gateway Intents"**, enable:
   - ✅ **Presence Intent**
   - ✅ **Server Members Intent**
   - ✅ **Message Content Intent** (REQUIRED!)
4. Click **"Reset Token"** → Copy the token
5. Paste token in `backend/.env` as `DISCORD_BOT_TOKEN`

### Step 3: Get Client ID & Secret

1. Go to **"OAuth2"** → **"General"** tab
2. Copy **"Client ID"** → Paste in `.env` as `DISCORD_CLIENT_ID`
3. Copy **"Client Secret"** → Paste in `.env` as `DISCORD_CLIENT_SECRET`

### Step 4: Configure Bot Permissions

1. Go to **"OAuth2"** → **"URL Generator"**
2. Select **Scopes:**
   - ✅ `bot`
   - ✅ `applications.commands`
3. Select **Bot Permissions:**
   - ✅ **Read Messages/View Channels**
   - ✅ **Send Messages**
   - ✅ **Manage Messages** (to delete violations)
   - ✅ **Embed Links**
   - ✅ **Read Message History**
   - ✅ **Add Reactions**
   - ✅ **Use External Emojis**
   - ✅ **Moderate Members** (for timeouts)
   - ✅ **Ban Members** (optional, for NSFW auto-ban)
   - ✅ **Kick Members** (optional, for NSFW auto-kick)

### Step 5: Invite Bot to Your Server

1. Copy the generated URL from URL Generator
2. Paste in browser
3. Select your test server
4. Click **"Authorize"**
5. Complete the CAPTCHA

### Step 6: Verify Bot is Online

1. Check your Discord server - bot should appear online
2. Check backend logs for: `🤖 CommunityClara#1234 is now online!`

---

## Testing the Bot

### Test 1: Basic Commands

In your Discord server, type:

```
!clara help
```

**Expected Response:**
- Embed with bot commands and features

```
!clara status
```

**Expected Response:**
- Bot statistics (messages processed, violations, etc.)

```
!clara test
```

**Expected Response:**
- `✅ TEST SUCCESSFUL! All systems operational!`

```
!clara checkperms
```

**Expected Response:**
- Permission check showing all required permissions

### Test 2: Toxicity Detection

Send a test message with toxic content:

```
You're such an idiot
```

**Expected Behavior:**
1. Bot analyzes the message
2. Detects toxicity (score > 0.7)
3. Sends you a DM warning (1/3)
4. Logs violation in database
5. Posts alert in log channel (if configured)

**Check Backend Logs:**
```
📝 MODERATING: 'You're such an idiot' from User#1234
🔍 Starting AI analysis...
🤖 AI result: flagged=True, score=0.890
🚨 VIOLATION TRIGGERED: 0.890 >= 0.700
⚠️ Sent warning 1/3 to User#1234
```

### Test 3: NSFW Detection

1. Upload an NSFW image (or use a test URL)
2. Bot should detect and delete it
3. You should receive a warning DM

### Test 4: Spam Detection

Send 6+ messages rapidly (within 5 seconds):

```
test
test
test
test
test
test
```

**Expected Behavior:**
1. Bot detects spam pattern
2. Deletes spam messages
3. Sends spam warning DM
4. Posts spam alert in log channel

**Check Backend Logs:**
```
🔍 Spam analysis result:
   📊 Spam score: 85/100
   🚨 Is spam: True
   📝 Reasons: ['Rapid-fire messages (6 in 5s)', 'Repetitive content']
🚨 SPAM DETECTED
🗑️ Deleted spam message
```

---

## Troubleshooting Common Issues

### Issue 1: Bot Commands Not Working

**Symptoms:**
- `!clara help` doesn't respond
- No reaction from bot

**Solutions:**

1. **Check Message Content Intent:**
   ```
   Discord Developer Portal → Bot → Privileged Gateway Intents
   ✅ Enable "Message Content Intent"
   ```

2. **Check Bot Permissions:**
   ```
   !clara checkperms
   ```
   Ensure all permissions are ✅

3. **Check Backend Logs:**
   ```
   Look for: "📝 MODERATING: '!clara help'"
   If missing, bot isn't receiving messages
   ```

4. **Verify Bot is Online:**
   - Check Discord server member list
   - Check backend logs for: `🤖 CommunityClara#1234 is now online!`

5. **Check Command Prefix:**
   - Prefix is `!clara ` (with space)
   - Try: `!clara help` (not `!clarahelp`)

### Issue 2: Toxicity Detection Not Working

**Symptoms:**
- Toxic messages not flagged
- No warnings sent

**Solutions:**

1. **Check ML Model Loading:**
   ```bash
   cd backend
   python -c "from app.ml.huggingface_analyzer import huggingface_analyzer; print('OK')"
   ```
   
   **Expected:** `OK`
   
   **If Error:** Install transformers and torch:
   ```bash
   pip install transformers torch
   ```

2. **Check Content Analyzer Configuration:**
   ```env
   # In backend/.env
   CONTENT_ANALYZER=huggingface
   ```

3. **Check Threshold Settings:**
   - Default threshold: 0.7 (70%)
   - Lower threshold = more sensitive (e.g., 0.5)
   - Higher threshold = less sensitive (e.g., 0.9)

4. **Check Backend Logs:**
   ```
   Look for:
   🔍 Starting AI analysis for: 'message'
   🤖 AI result: flagged=True, score=0.890
   🎯 THRESHOLD CHECK: 0.890 vs 0.700
   ```

5. **Test with Obvious Toxic Content:**
   ```
   fuck you idiot
   ```
   This should definitely trigger (score ~0.9)

6. **Check if User is Exempt:**
   - Admins/Moderators might be exempt
   - Check logs for: `⚪ Skipping moderation for exempt user`

### Issue 3: NSFW Detection Not Working

**Symptoms:**
- NSFW images not detected
- No deletion/warning

**Solutions:**

1. **Check Image Analyzer:**
   ```bash
   cd backend
   python -c "from app.ml.image_analyzer import image_analyzer; print('OK')"
   ```

2. **Check NSFW Settings in Database:**
   - NSFW detection might be disabled for the server
   - Check `servers` table in database

3. **Check Backend Logs:**
   ```
   Look for:
   📎 Message attachments: 1
   🖼️ Analyzing image: image.png
   🚨 NSFW IMAGE DETECTED
   ```

4. **Verify Image is Actually NSFW:**
   - Use a known NSFW test image
   - Some images might be borderline

### Issue 4: Spam Detection Not Working

**Symptoms:**
- Rapid messages not flagged as spam
- No spam warnings

**Solutions:**

1. **Check Spam Tracker:**
   ```
   !clara testspam
   ```
   Check backend logs for spam detection

2. **Check Spam Threshold:**
   - Default: 70/100 spam score
   - Rapid-fire: 6+ messages in 5 seconds
   - Repetitive: Same message 3+ times

3. **Check Backend Logs:**
   ```
   Look for:
   🔍 Spam analysis result:
      📊 Spam score: 85/100
      🚨 Is spam: True
   ```

4. **Test with Clear Spam Pattern:**
   ```
   Send 10 identical messages rapidly
   ```

### Issue 5: Bot Not Responding at All

**Symptoms:**
- Bot shows online but doesn't respond
- No logs in backend

**Solutions:**

1. **Restart Backend:**
   ```bash
   # Stop backend (Ctrl+C)
   # Start again
   python -m app.main_with_bot
   ```

2. **Check Discord Token:**
   ```env
   # In backend/.env
   DISCORD_BOT_TOKEN=your_actual_token_here
   ```
   
   **Verify token is correct:**
   - Go to Discord Developer Portal
   - Bot tab → Reset Token
   - Copy new token to `.env`

3. **Check Firewall/Antivirus:**
   - Might be blocking Discord connection
   - Temporarily disable and test

4. **Check Internet Connection:**
   - Bot needs internet to connect to Discord

5. **Check Backend Logs for Errors:**
   ```
   Look for:
   ❌ Failed to start Discord bot: ...
   ```

### Issue 6: Database Errors

**Symptoms:**
- `No such table: servers`
- `Database locked`

**Solutions:**

1. **Delete and Recreate Database:**
   ```bash
   cd backend
   rm safespace.db
   python -m app.main_with_bot
   ```
   Database will be recreated automatically

2. **Check Database Permissions:**
   - Ensure `backend/safespace.db` is writable

3. **Check for Multiple Backend Instances:**
   - Only run one backend instance at a time
   - SQLite doesn't support concurrent writes well

### Issue 7: Frontend Not Connecting to Backend

**Symptoms:**
- Frontend shows errors
- API calls fail

**Solutions:**

1. **Check Backend is Running:**
   ```
   http://localhost:8000/health
   ```
   Should return JSON with status

2. **Check CORS Configuration:**
   ```python
   # In backend/app/main_with_bot.py
   allow_origins=[
       "http://localhost:3000",
       "http://localhost:5173",  # Vite dev server
   ]
   ```

3. **Check Frontend API URL:**
   ```env
   # In frontend/.env
   VITE_API_URL=http://localhost:8000
   ```

4. **Check Browser Console:**
   - Open DevTools (F12)
   - Look for CORS errors or network errors

### Issue 8: HuggingFace Model Not Loading

**Symptoms:**
- `Transformers not installed`
- `Model loading failed`

**Solutions:**

1. **Install Transformers:**
   ```bash
   pip install transformers torch
   ```

2. **Download Model Manually:**
   ```bash
   python -c "from transformers import pipeline; pipeline('text-classification', model='unitary/toxic-bert')"
   ```
   This will download the model (~400MB)

3. **Check Disk Space:**
   - Model cache: `~/.cache/huggingface/`
   - Needs ~500MB free space

4. **Use Fallback Analyzer:**
   ```env
   # In backend/.env
   CONTENT_ANALYZER=mock
   ```
   This uses keyword-based detection (less accurate but works)

---

## Environment Variables Reference

### Backend (.env)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DISCORD_BOT_TOKEN` | ✅ Yes | - | Discord bot token from Developer Portal |
| `DISCORD_CLIENT_ID` | ✅ Yes | - | Discord application client ID |
| `DISCORD_CLIENT_SECRET` | ✅ Yes | - | Discord application client secret |
| `DISCORD_REDIRECT_URI` | No | `http://localhost:3000/auth/callback` | OAuth redirect URI |
| `GOOGLE_CLIENT_ID` | No | - | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | No | - | Google OAuth client secret |
| `JWT_SECRET_KEY` | ✅ Yes | - | Secret key for JWT tokens |
| `OPENAI_API_KEY` | No | - | OpenAI API key (optional) |
| `CONTENT_ANALYZER` | No | `huggingface` | ML analyzer: `huggingface`, `openai`, or `mock` |
| `DATABASE_URL` | No | `sqlite:///./safespace.db` | Database connection string |
| `API_HOST` | No | `0.0.0.0` | Backend server host |
| `API_PORT` | No | `8000` | Backend server port |
| `DEBUG` | No | `True` | Debug mode |
| `FRONTEND_URL` | No | `http://localhost:3000` | Frontend URL for CORS |

### Frontend (.env)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_API_URL` | ✅ Yes | - | Backend API URL |
| `VITE_GOOGLE_CLIENT_ID` | No | - | Google OAuth client ID |

---

## Quick Start Checklist

### Backend Setup
- [ ] Python 3.9+ installed
- [ ] Virtual environment created and activated
- [ ] Dependencies installed (`pip install -r requirements.txt`)
- [ ] `.env` file configured with Discord token
- [ ] Backend running (`python -m app.main_with_bot`)
- [ ] Health check passing (http://localhost:8000/health)

### Frontend Setup
- [ ] Node.js 18+ installed
- [ ] Dependencies installed (`npm install`)
- [ ] `.env` file configured with API URL
- [ ] Frontend running (`npm run dev`)
- [ ] Landing page accessible (http://localhost:5173)

### Discord Bot Setup
- [ ] Discord application created
- [ ] Bot created with token
- [ ] Message Content Intent enabled
- [ ] Bot invited to test server
- [ ] Bot shows online in Discord
- [ ] `!clara help` command works

### Testing
- [ ] `!clara test` works
- [ ] `!clara status` shows statistics
- [ ] Toxic message triggers warning
- [ ] Spam detection works
- [ ] NSFW detection works (if applicable)

---

## Additional Resources

### Documentation
- [Discord.py Documentation](https://discordpy.readthedocs.io/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [HuggingFace Transformers](https://huggingface.co/docs/transformers/)
- [React Documentation](https://react.dev/)

### Support
- Check backend logs for detailed error messages
- Check Discord Developer Portal for bot status
- Review database (`backend/safespace.db`) for stored data

### Performance Tips
- First ML model load takes ~30 seconds (downloads model)
- Subsequent loads are instant (uses cache)
- CPU inference: ~100-200ms per message
- GPU inference: ~20-50ms per message (if available)

---

## Next Steps

1. **Configure Server Settings:**
   - Set toxicity threshold (0.4 - 0.95)
   - Enable/disable auto-delete
   - Configure log channels
   - Set exempt roles

2. **Test Thoroughly:**
   - Test all violation types
   - Test warning system (1st, 2nd, 3rd)
   - Test spam detection
   - Test NSFW detection

3. **Monitor Performance:**
   - Check backend logs
   - Monitor database size
   - Review violation statistics

4. **Deploy to Production:**
   - Use production database (PostgreSQL recommended)
   - Set up proper hosting (Railway, Heroku, etc.)
   - Configure environment variables
   - Enable HTTPS

---

**Need Help?** Check the logs first! Most issues are logged with detailed error messages.

**Still Stuck?** Review the [TOXICITY_DETECTION_EXPLAINED.md](./TOXICITY_DETECTION_EXPLAINED.md) for ML model details.
