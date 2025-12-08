# backend/app/auth/discord_oauth.py
import requests
import jwt
from datetime import datetime, timedelta
from app.utils.config import config
from app.utils.logger import logger
from typing import Dict, Any, Optional

class DiscordOAuth:
    """Handle Discord OAuth2 authentication"""
    
    def __init__(self):
        self.client_id = config.DISCORD_CLIENT_ID
        self.client_secret = config.DISCORD_CLIENT_SECRET
        self.redirect_uri = config.DISCORD_REDIRECT_URI
        self.oauth_url = "https://discord.com/api/oauth2/authorize"
        self.token_url = "https://discord.com/api/oauth2/token"
        self.api_base = "https://discord.com/api/v10"
        
    def get_oauth_url(self) -> str:
        """Generate Discord OAuth URL"""
        params = {
            'client_id': self.client_id,
            'redirect_uri': self.redirect_uri,
            'response_type': 'code',
            'scope': 'identify guilds'
        }
        
        param_string = '&'.join([f"{k}={v}" for k, v in params.items()])
        return f"{self.oauth_url}?{param_string}"
    
    def exchange_code(self, code: str) -> Dict[str, Any]:
        """Exchange authorization code for access token"""
        try:
            data = {
                'client_id': self.client_id,
                'client_secret': self.client_secret,
                'grant_type': 'authorization_code',
                'code': code,
                'redirect_uri': self.redirect_uri
            }
            
            headers = {'Content-Type': 'application/x-www-form-urlencoded'}
            
            response = requests.post(self.token_url, data=data, headers=headers)
            response.raise_for_status()
            
            return response.json()
            
        except Exception as e:
            logger.error(f"Error exchanging Discord code: {e}")
            raise
    
    def get_user_info(self, access_token: str) -> Dict[str, Any]:
        """Get Discord user information"""
        try:
            headers = {'Authorization': f'Bearer {access_token}'}
            
            response = requests.get(f"{self.api_base}/users/@me", headers=headers)
            response.raise_for_status()
            
            return response.json()
            
        except Exception as e:
            logger.error(f"Error getting Discord user info: {e}")
            raise
    
    def get_user_guilds(self, access_token: str) -> list:
        """Get Discord user's guilds"""
        try:
            headers = {'Authorization': f'Bearer {access_token}'}
            
            response = requests.get(f"{self.api_base}/users/@me/guilds", headers=headers)
            response.raise_for_status()
            
            return response.json()
            
        except Exception as e:
            logger.error(f"Error getting Discord user guilds: {e}")
            raise
    
    def create_jwt_token(self, user_info: Dict[str, Any]) -> str:
        """Create JWT token for user"""
        try:
            payload = {
                'user_id': user_info['id'],
                'username': user_info['username'],
                'discriminator': user_info.get('discriminator'),
                'avatar': user_info.get('avatar'),
                'exp': datetime.utcnow() + timedelta(days=7)
            }
            
            return jwt.encode(payload, config.JWT_SECRET, algorithm='HS256')
            
        except Exception as e:
            logger.error(f"Error creating JWT token: {e}")
            raise

# Global instance
discord_oauth = DiscordOAuth()