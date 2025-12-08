# backend/app/auth/discord_oauth.py
import requests
import jwt
from datetime import datetime, timedelta
from app.utils.config import config
from app.utils.logger import logger
from typing import Dict, Any

class DiscordOAuth:
    def __init__(self):
        self.client_id = config.DISCORD_CLIENT_ID
        self.client_secret = config.DISCORD_CLIENT_SECRET
        self.redirect_uri = config.DISCORD_REDIRECT_URI
        self.base_url = "https://discord.com/api/v10"
    
    def get_oauth_url(self) -> str:
        """Generate Discord OAuth URL"""
        params = {
            'client_id': self.client_id,
            'redirect_uri': self.redirect_uri,
            'response_type': 'code',
            'scope': 'identify guilds'
        }
        url = f"https://discord.com/oauth2/authorize?" + "&".join([f"{k}={v}" for k, v in params.items()])
        logger.info(f"🔗 Generated OAuth URL: {url}")
        return url
    
    def exchange_code(self, code: str) -> Dict[str, Any]:
        """Exchange OAuth code for access token"""
        try:
            data = {
                'client_id': self.client_id,
                'client_secret': self.client_secret,
                'grant_type': 'authorization_code',
                'code': code,
                'redirect_uri': self.redirect_uri
            }
            
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
            
            response = requests.post(f"{self.base_url}/oauth2/token", data=data, headers=headers)
            
            if response.status_code != 200:
                logger.error(f"❌ Token exchange failed: {response.status_code} - {response.text}")
                raise Exception(f"Token exchange failed: {response.status_code}")
            
            token_data = response.json()
            logger.info("✅ Successfully exchanged OAuth code for token")
            return token_data
            
        except Exception as e:
            logger.error(f"❌ Error exchanging OAuth code: {e}")
            raise
    
    def get_user_info(self, access_token: str) -> Dict[str, Any]:
        """Get user info from Discord"""
        try:
            headers = {'Authorization': f'Bearer {access_token}'}
            response = requests.get(f"{self.base_url}/users/@me", headers=headers)
            
            if response.status_code != 200:
                logger.error(f"❌ Failed to get user info: {response.status_code}")
                raise Exception(f"Failed to get user info: {response.status_code}")
            
            user_data = response.json()
            logger.info(f"✅ Retrieved user info for: {user_data.get('username', 'Unknown')}")
            return user_data
            
        except Exception as e:
            logger.error(f"❌ Error getting user info: {e}")
            raise
    
    def get_user_guilds(self, access_token: str) -> list:
        """Get user's Discord servers"""
        try:
            headers = {'Authorization': f'Bearer {access_token}'}
            response = requests.get(f"{self.base_url}/users/@me/guilds", headers=headers)
            
            if response.status_code != 200:
                logger.error(f"❌ Failed to get user guilds: {response.status_code}")
                raise Exception(f"Failed to get user guilds: {response.status_code}")
            
            guilds = response.json()
            logger.info(f"✅ Retrieved {len(guilds)} guilds for user")
            return guilds
            
        except Exception as e:
            logger.error(f"❌ Error getting user guilds: {e}")
            raise
    
    def create_jwt_token(self, user_data: Dict[str, Any]) -> str:
        """Create JWT token for session management"""
        try:
            payload = {
                'user_id': user_data['id'],
                'username': user_data['username'],
                'discriminator': user_data.get('discriminator', '0000'),
                'avatar': user_data.get('avatar'),
                'email': user_data.get('email'),
                'exp': datetime.utcnow() + timedelta(days=7),
                'iat': datetime.utcnow()
            }
            
            token = jwt.encode(payload, config.JWT_SECRET, algorithm='HS256')
            logger.info(f"✅ Created JWT token for user: {user_data['username']}")
            return token
            
        except Exception as e:
            logger.error(f"❌ Error creating JWT token: {e}")
            raise
    
    def verify_jwt_token(self, token: str) -> Dict[str, Any]:
        """Verify and decode JWT token"""
        try:
            payload = jwt.decode(token, config.JWT_SECRET, algorithms=['HS256'])
            logger.info(f"✅ Verified JWT token for user: {payload.get('username', 'Unknown')}")
            return payload
            
        except jwt.ExpiredSignatureError:
            logger.warning("⚠️ JWT token expired")
            raise Exception("Token expired")
        except jwt.JWTError as e:
            logger.error(f"❌ Invalid JWT token: {e}")
            raise Exception("Invalid token")

# Global OAuth instance
discord_oauth = DiscordOAuth()