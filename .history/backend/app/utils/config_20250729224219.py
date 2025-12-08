import os
from dotenv import load_dotenv
from typing import Optional

load_dotenv()

class Config:
    """Application configuration"""
    
    # Discord Configuration
    DISCORD_BOT_TOKEN: str = os.getenv("DISCORD_BOT_TOKEN", "")
    DISCORD_CLIENT_ID: str = os.getenv("DISCORD_CLIENT_ID", "")
    
    # OpenAI Configuration
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    
    # Database Configuration
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./safespace.db")
    
    # API Configuration
    API_HOST: str = os.getenv("API_HOST", "0.0.0.0")
    API_PORT: int = int(os.getenv("API_PORT", 8000))
    DEBUG: bool = os.getenv("DEBUG", "True").lower() == "true"
    
    # CORS Settings
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:3000")
    
    # ML Model Settings
    NSFW_MODEL_PATH: str = os.getenv("NSFW_MODEL_PATH", "./models/nsfw_model.h5")
    CONFIDENCE_THRESHOLD: float = float(os.getenv("CONFIDENCE_THRESHOLD", 0.7))
    
    CONTENT_ANALYZER: str = os.getenv("CONTENT_ANALYZER", "huggingface")  # huggingface, openai, mock
    HUGGINGFACE_CACHE_DIR: str = os.getenv("HUGGINGFACE_CACHE_DIR", "./models/huggingface")

    @classmethod
    def validate(cls) -> bool:
        """Validate required configuration"""
        required_fields = [
            cls.DISCORD_BOT_TOKEN,
            cls.OPENAI_API_KEY
        ]
        
        missing = [field for field in required_fields if not field]
        if missing:
            raise ValueError(f"Missing required configuration fields: {missing}")
        
        return True

# Global config instance
config = Config()