# backend/run_with_bot.py
#!/usr/bin/env python3
"""
CommunityClara - Full System Runner
Starts FastAPI server with Discord bot integration
"""

import asyncio
import sys
import os
from pathlib import Path
from dotenv import load_dotenv

# Add app directory to Python path
sys.path.append(str(Path(__file__).parent))

def main():
    """Main application entry point with Discord bot"""
    try:
        # Import after path setup
        from app.utils.logger import logger
        from app.utils.config import config
        import uvicorn
        
        print("🚀 Starting CommunityClara AI - Complete System")
        print("=" * 60)
        print(f"🌐 API Server: http://{config.API_HOST}:{config.API_PORT}")
        print(f"📚 API Docs: http://{config.API_HOST}:{config.API_PORT}/docs")
        print(f"🔧 Content Analyzer: {config.CONTENT_ANALYZER}")
        print(f"🤖 Discord Bot: {'✅ Enabled' if config.DISCORD_BOT_TOKEN else '❌ Disabled'}")
        print(f"🧠 AI Model: {'✅ Hugging Face' if config.CONTENT_ANALYZER == 'huggingface' else '🔄 Fallback'}")
        print()
        
        if not config.DISCORD_BOT_TOKEN:
            print("⚠️  Discord bot token not configured!")
            print("   Add DISCORD_BOT_TOKEN to your .env file to enable bot functionality")
            print()
        
        logger.info("🎯 Initializing CommunityClara Complete System...")
        
        # Import the app with bot integration
        from app.main_with_bot import app
        
        # Start the server with bot
        uvicorn.run(
            "app.main_with_bot:app",
            host=config.API_HOST,
            port=config.API_PORT,
            reload=False,  # Disable reload when running bot to avoid issues
            log_level="info",
            access_log=True
        )
        
    except KeyboardInterrupt:
        print("\n🛑 CommunityClara stopped by user")
        logger.info("Application stopped by user")
    except Exception as e:
        print(f"\n❌ Startup failed: {e}")
        logger.error(f"Application startup failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()