# backend/app/main_with_bot.py

import os
from dotenv import load_dotenv

# Load environment variables FIRST
load_dotenv()

import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse


from app.utils.config import config
from app.utils.logger import logger
from app.database.connection import create_tables
from app.api.routes import router
from app.api.contact import router as contact_router  # ADD THIS LINE

# Import bot components
bot_task = None
bot_instance = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan with Discord bot integration"""
    global bot_task, bot_instance
    
    logger.info("🚀 Starting ClaraBot AI with Discord Integration")
    
    try:
        # Create database tables
        create_tables()
        logger.info("✅ Database initialized")
        
        # Start Discord bot if token is available
        if config.DISCORD_BOT_TOKEN:
            logger.info("🤖 Starting Discord bot...")
            try:
                from app.bot.discord_bot_minimal import CommunityClara
                bot_instance = CommunityClara()
                
                # Start bot in background task
                bot_task = asyncio.create_task(bot_instance.start(config.DISCORD_BOT_TOKEN))
                logger.info("🎉 Discord bot startup initiated")
                
            except Exception as e:
                logger.error(f"❌ Failed to start Discord bot: {e}")
                bot_task = None
        else:
            logger.warning("⚠️ Discord bot token not configured - bot disabled")
        
        logger.info("🎉 ClaraBot AI is ready!")
        
        yield
        
    except Exception as e:
        logger.error(f"❌ Startup error: {e}")
        raise
    finally:
        # Cleanup
        logger.info("🛑 Shutting down ClaraBot AI...")
        
        if bot_task and not bot_task.done():
            logger.info("🤖 Stopping Discord bot...")
            bot_task.cancel()
            try:
                await bot_task
            except asyncio.CancelledError:
                pass
        
        if bot_instance:
            try:
                await bot_instance.close()
            except:
                pass
        
        logger.info("✅ Shutdown complete")

# Create FastAPI application
app = FastAPI(
    title="ClaraBot AI with Discord",
    description="Privacy-preserving Discord moderation platform with active bot",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)



# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",  # Vite dev server
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "https://accounts.google.com",
        "https://www.googleapis.com",
        "https://gstatic.com" , # ADD THIS
        "https://community-clara.vercel.app/"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# ADD CUSTOM HEADERS MIDDLEWARE FOR GOOGLE GSI
@app.middleware("http")
async def add_security_headers(request, call_next):
    response = await call_next(request)
    
    # Fix Cross-Origin-Opener-Policy for Google GSI
    response.headers["Cross-Origin-Opener-Policy"] = "same-origin-allow-popups"
    response.headers["Cross-Origin-Embedder-Policy"] = "unsafe-none"
    
    return response

# Include API routes
app.include_router(router, prefix="/api/v1", tags=["ClaraBot AI"])
app.include_router(contact_router, prefix="/api")  # ADD THIS LINE

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "ClaraBot AI - Privacy-Preserving Discord Moderation",
        "version": "1.0.0",
        "status": "operational",
        "bot_status": "active" if config.DISCORD_BOT_TOKEN else "disabled",
        "ai_model": config.CONTENT_ANALYZER,
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        from app.database.connection import get_db_session
        from sqlalchemy import text
        
        with get_db_session() as session:
            result = session.execute(text("SELECT 1 as test")).fetchone()
            db_status = "operational" if result and result[0] == 1 else "error"
        
        # Check bot status
        bot_status = "disabled"
        if config.DISCORD_BOT_TOKEN:
            if bot_instance and not bot_instance.is_closed():
                bot_status = "active"
            else:
                bot_status = "error"
        
        # Check AI analyzer
        ai_status = "operational"
        try:
            from app.ml.content_analyzer import content_analyzer
            if hasattr(content_analyzer, 'initialized'):
                ai_status = "operational" if content_analyzer.initialized else "loading"
            else:
                ai_status = "fallback"
        except:
            ai_status = "error"
        
        return {
            "status": "healthy",
            "timestamp": "2025-07-30T00:00:00Z",
            "services": {
                "database": db_status,
                "discord_bot": bot_status,
                "ai_analyzer": ai_status,
                "content_analyzer": config.CONTENT_ANALYZER
            },
            "bot_info": {
                "servers_connected": len(bot_instance.guilds) if bot_instance and not bot_instance.is_closed() else 0,
                "messages_processed": getattr(bot_instance, 'processed_messages', 0) if bot_instance else 0,
                "violations_detected": getattr(bot_instance, 'violations_detected', 0) if bot_instance else 0
            }
        }
        
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return JSONResponse(
            status_code=200,
            content={
                "status": "degraded",
                "error": str(e),
                "services": {
                    "database": "error",
                    "discord_bot": "active" if config.DISCORD_BOT_TOKEN else "disabled",
                    "ai_analyzer": "unknown",
                    "content_analyzer": config.CONTENT_ANALYZER
                }
            }
        )

@app.exception_handler(404)
async def not_found_handler(request, exc):
    """Custom 404 handler"""
    return JSONResponse(
        status_code=404,
        content={
            "error": "Not Found",
            "message": "The requested resource was not found",
            "docs": "/docs"
        }
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main_with_bot:app",
        host=config.API_HOST,
        port=config.API_PORT,
        reload=False,
        log_level="info"
    )