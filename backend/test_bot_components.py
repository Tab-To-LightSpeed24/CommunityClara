# backend/test_bot_components.py
"""
Quick diagnostic script to test all bot components
Run this to identify what's working and what's not
"""

import asyncio
import sys
from datetime import datetime

print("=" * 60)
print("🔍 CommunityClara Bot Diagnostic Test")
print("=" * 60)
print()

# Test 1: Check Python Version
print("1️⃣ Checking Python version...")
print(f"   Python {sys.version}")
if sys.version_info < (3, 9):
    print("   ❌ Python 3.9+ required!")
else:
    print("   ✅ Python version OK")
print()

# Test 2: Check Discord.py
print("2️⃣ Checking discord.py...")
try:
    import discord
    print(f"   ✅ discord.py {discord.__version__} installed")
except ImportError as e:
    print(f"   ❌ discord.py not installed: {e}")
    print("   Fix: pip install discord.py==2.3.2")
print()

# Test 3: Check Transformers
print("3️⃣ Checking transformers (HuggingFace)...")
try:
    import transformers
    print(f"   ✅ transformers {transformers.__version__} installed")
except ImportError:
    print("   ❌ transformers not installed")
    print("   Fix: pip install transformers torch")
print()

# Test 4: Check PyTorch
print("4️⃣ Checking PyTorch...")
try:
    import torch
    print(f"   ✅ torch {torch.__version__} installed")
    print(f"   CPU available: {torch.cuda.is_available() == False}")
except ImportError:
    print("   ❌ torch not installed")
    print("   Fix: pip install torch")
print()

# Test 5: Check Environment Variables
print("5️⃣ Checking environment variables...")
try:
    from app.utils.config import config
    
    checks = {
        "DISCORD_BOT_TOKEN": bool(config.DISCORD_BOT_TOKEN),
        "DISCORD_CLIENT_ID": bool(config.DISCORD_CLIENT_ID),
        "CONTENT_ANALYZER": config.CONTENT_ANALYZER,
    }
    
    for key, value in checks.items():
        if isinstance(value, bool):
            status = "✅" if value else "❌"
            print(f"   {status} {key}: {'Set' if value else 'NOT SET'}")
        else:
            print(f"   ℹ️  {key}: {value}")
    
    if not config.DISCORD_BOT_TOKEN:
        print()
        print("   ⚠️  DISCORD_BOT_TOKEN is required!")
        print("   Add it to backend/.env file")
        
except Exception as e:
    print(f"   ❌ Error loading config: {e}")
print()

# Test 6: Check Database
print("6️⃣ Checking database connection...")
try:
    from app.database.connection import get_db_session
    from sqlalchemy import text
    
    with get_db_session() as session:
        result = session.execute(text("SELECT 1 as test")).fetchone()
        if result and result[0] == 1:
            print("   ✅ Database connection OK")
        else:
            print("   ❌ Database query failed")
except Exception as e:
    print(f"   ❌ Database error: {e}")
print()

# Test 7: Check Content Analyzer
print("7️⃣ Checking content analyzer...")
try:
    from app.ml.content_analyzer import content_analyzer
    print(f"   ✅ Content analyzer loaded")
    
    # Check if it's HuggingFace
    if hasattr(content_analyzer, 'toxicity_classifier'):
        print("   ℹ️  Using HuggingFace analyzer")
    else:
        print("   ℹ️  Using fallback analyzer")
        
except Exception as e:
    print(f"   ❌ Content analyzer error: {e}")
print()

# Test 8: Test Toxicity Detection
print("8️⃣ Testing toxicity detection...")
async def test_toxicity():
    try:
        from app.ml.content_analyzer import content_analyzer
        
        test_text = "You're such an idiot"
        print(f"   Testing: '{test_text}'")
        
        result = await content_analyzer.analyze_text(test_text)
        
        print(f"   Flagged: {result.get('flagged', False)}")
        print(f"   Max Score: {result.get('max_score', 0):.3f}")
        print(f"   Violation Type: {result.get('violation_type', 'None')}")
        
        if result.get('flagged'):
            print("   ✅ Toxicity detection working!")
        else:
            print("   ⚠️  Toxicity not detected (might be threshold issue)")
            
    except Exception as e:
        print(f"   ❌ Toxicity test failed: {e}")
        import traceback
        traceback.print_exc()

try:
    asyncio.run(test_toxicity())
except Exception as e:
    print(f"   ❌ Async test failed: {e}")
print()

# Test 9: Check Spam Tracker
print("9️⃣ Checking spam tracker...")
try:
    from app.bot.spam_tracker import spam_tracker
    
    # Test spam detection
    for i in range(6):
        result = spam_tracker.add_message(
            user_id="test_user_123",
            content="test message",
            timestamp=datetime.utcnow()
        )
    
    if result.get('is_spam'):
        print("   ✅ Spam detection working!")
        print(f"   Spam Score: {result.get('spam_score', 0)}/100")
    else:
        print("   ⚠️  Spam not detected")
        
except Exception as e:
    print(f"   ❌ Spam tracker error: {e}")
print()

# Test 10: Check Bot Initialization
print("🔟 Checking bot initialization...")
try:
    from app.bot.discord_bot_minimal import CommunityClara
    
    bot = CommunityClara()
    print(f"   ✅ Bot instance created")
    print(f"   Command prefix: {bot.command_prefix}")
    print(f"   Intents: Message Content = {bot.intents.message_content}")
    
except Exception as e:
    print(f"   ❌ Bot initialization error: {e}")
print()

# Summary
print("=" * 60)
print("📊 DIAGNOSTIC SUMMARY")
print("=" * 60)
print()
print("If all tests pass ✅, your bot should work!")
print()
print("Common issues:")
print("1. ❌ discord.py not installed → pip install discord.py==2.3.2")
print("2. ❌ DISCORD_BOT_TOKEN not set → Add to backend/.env")
print("3. ❌ Message Content Intent → Enable in Discord Developer Portal")
print("4. ⚠️  Toxicity not detected → Check threshold (default 0.7)")
print()
print("Next steps:")
print("1. Fix any ❌ errors above")
print("2. Run: python -m app.main_with_bot")
print("3. Test in Discord: !clara help")
print()
print("=" * 60)
