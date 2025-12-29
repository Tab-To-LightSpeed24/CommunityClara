# Quick Start Guide - Get Your Bot Online NOW!

## 🚀 FASTEST WAY TO START THE BOT

### Option 1: Use the Batch File (Easiest)
1. Double-click `start_bot.bat` in the project root
2. Wait for: `🤖 CommunityClara#XXXX is now online!`
3. Check Discord - bot should show online ✅

### Option 2: Manual Start
```bash
# 1. Open terminal in project root
cd c:\Users\asus\safespace-ai\backend

# 2. Activate virtual environment
venv\Scripts\activate

# 3. Start the bot
python -m app.main_with_bot
```

## ✅ What You Should See

**Terminal Output:**
```
🚀 Starting ClaraBot AI with Discord Integration
✅ Database initialized
🤖 Starting Discord bot...
🤗 Hugging Face analyzer ready for initialization
🎉 Discord bot startup initiated
🎉 ClaraBot AI is ready!
INFO:     Uvicorn running on http://0.0.0.0:8000

🤖 CommunityClara#1234 is now online!
📊 Connected to 1 servers
🧹 Spam tracker cleanup started
```

**In Discord:**
- Bot shows **ONLINE** (green status) ✅
- Bot appears in member list

## 🧪 TESTING (Once Bot is Online)

### Test 1: Basic Command
```
!clara help
```
**Expected:** Bot sends help embed

### Test 2: Toxicity Detection
```
You're such an idiot
```
**Expected:** 
- Bot sends you a DM warning (1/3)
- Posts alert in channel
- Logs violation

### Test 3: Spam Detection
Send 6 rapid messages:
```
test
test
test
test
test
test
```
**Expected:**
- Messages deleted
- Spam warning DM
- Spam alert posted

### Test 4: NSFW Detection
Upload an NSFW image

**Expected:**
- Image deleted
- Warning DM
- Alert posted

## ❌ TROUBLESHOOTING

### Bot Still Offline?

**Check 1: Is the backend running?**
```bash
# You should see this process running
python -m app.main_with_bot
```

**Check 2: Discord Token Correct?**
```bash
# Check backend/.env file
DISCORD_BOT_TOKEN=your_actual_token_here
```

**Check 3: Message Content Intent Enabled?**
1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Select your application
3. Go to "Bot" tab
4. Under "Privileged Gateway Intents":
   - ✅ Enable "MESSAGE CONTENT INTENT"
5. Click "Save Changes"
6. **Restart the bot**

**Check 4: Bot Invited to Server?**
1. Go to OAuth2 → URL Generator
2. Select: `bot` + `applications.commands`
3. Select permissions (see full list in SETUP_AND_TROUBLESHOOTING.md)
4. Copy URL and re-invite bot

### Detection Not Working?

**If bot is online but not detecting violations:**

1. **Check if you're exempt:**
   - Admins/Moderators might be exempt
   - Try testing with a regular user account

2. **Check channel moderation:**
   - Bot might not be monitoring all channels
   - Check server settings in database

3. **Check threshold:**
   - Default: 0.7 (70%)
   - Your test message score: 0.960 ✅
   - Should definitely trigger!

4. **Check backend logs:**
   ```
   Look for:
   📝 MODERATING: 'your message'
   🔍 Starting AI analysis...
   🚨 VIOLATION TRIGGERED
   ```

## 🎯 QUICK FIXES

### "Bot not responding to commands"
```bash
# Restart the bot
# Press Ctrl+C in terminal
# Run again: python -m app.main_with_bot
```

### "ModuleNotFoundError"
```bash
# Reinstall dependencies
pip install -r requirements.txt
```

### "Database locked"
```bash
# Stop all backend instances
# Only run ONE instance at a time
```

### "Model loading failed"
```bash
# Check internet connection
# Model downloads from huggingface.co (~400MB)
# Or use fallback: CONTENT_ANALYZER=mock in .env
```

## 📊 VERIFY EVERYTHING WORKS

Run the diagnostic script:
```bash
cd backend
python test_bot_components.py
```

All should be ✅ (as shown in your diagnostic output!)

## 🆘 STILL NOT WORKING?

1. **Check backend logs** - Most issues are logged
2. **Verify bot token** - Regenerate if needed
3. **Check firewall** - Might be blocking Discord connection
4. **Try different network** - Some networks block Discord

## 📝 NOTES

- Bot needs to stay running to work
- Don't close the terminal window
- Backend runs on http://localhost:8000
- Frontend (if needed) runs on http://localhost:5173

---

**Your diagnostic shows everything is configured correctly!**
**Just start the bot and it will work! 🚀**
