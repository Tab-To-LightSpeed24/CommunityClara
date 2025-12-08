# backend/app/main_api_only.py

import os
from dotenv import load_dotenv

# Load environment variables FIRST
load_dotenv()

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
from app.utils.config import config
from app.utils.logger import logger
from app.database.connection import create_tables
from app.api.routes import router
from app.api.contact import router as contact_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events - API only"""
    # Startup
    logger.info("🚀 Starting ClaraBot AI API Server")
    
    try:
        # Create database tables
        create_tables()
        logger.info("✅ Database initialized")
        
        logger.info("🎉 ClaraBot AI API is ready!")
        
        yield
        
    except Exception as e:
        logger.error(f"❌ Startup error: {e}")
        raise
    
    # Shutdown
    logger.info("🛑 Shutting down ClaraBot AI API")

# Create FastAPI application
app = FastAPI(
    title="ClaraBot AI API",
    description="Privacy-preserving Discord moderation platform API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(router, prefix="/api/v1", tags=["ClaraBot AI"])

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "ClaraBot AI - Privacy-Preserving Discord Moderation API",
        "version": "1.0.0",
        "status": "operational",
        "docs": "/docs",
        "note": "Discord bot disabled for testing"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        # Test database connection
        from app.database.connection import get_db_session
        from sqlalchemy import text
        
        with get_db_session() as session:
            # Simple query to test connection with proper text() wrapper
            result = session.execute(text("SELECT 1 as test")).fetchone()
            if result and result[0] == 1:
                db_status = "operational"
            else:
                db_status = "error"
        
        return {
            "status": "healthy",
            "timestamp": "2025-07-28T16:17:00Z",
            "services": {
                "database": db_status,
                "discord_bot": "disabled",
                "openai_api": "operational" if config.OPENAI_API_KEY else "disabled"
            }
        }
        
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return JSONResponse(
            status_code=200,  # Return 200 but with error details
            content={
                "status": "degraded",
                "error": str(e),
                "services": {
                    "database": "error",
                    "discord_bot": "disabled",
                    "openai_api": "operational" if config.OPENAI_API_KEY else "disabled"
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
        "app.main_api_only:app",
        host=config.API_HOST,
        port=config.API_PORT,
        reload=config.DEBUG,
        log_level="info"
    )