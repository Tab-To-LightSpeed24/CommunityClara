# backend/app/auth/discord_oauth.py
import requests
import jwt
from datetime import datetime, timedelta
from app.utils.config import config
from app.utils.logger import logger

class DiscordOAuth:
    def __init__(self):
        self.client_id = config.DISCORD_CLIENT_ID
        self.client_secret = config.DISCORD_CLIENT_SECRET
        self.redirect_uri = config.DISCORD_REDIRECT_URI
        self.base_url = "https://discord.com/api/v10"
    
    def get_oauth_url(self):
        """Generate Discord OAuth URL"""
        params = {
            'client_id': self.client_id,
            'redirect_uri': self.redirect_uri,
            'response_type': 'code',
            'scope': 'identify guilds'
        }
        url = f"https://discord.com/oauth2/authorize?" + "&".join([f"{k}={v}" for k, v in params.items()])
        return url
    
    def exchange_code(self, code):
        """Exchange OAuth code for access token"""
        data = {
            'client_id': self.client_id,
            'client_secret': self.client_secret,
            'grant_type': 'authorization_code',
            'code': code,
            'redirect_uri': self.redirect_uri
        }
        
        response = requests.post(f"{self.base_url}/oauth2/token", data=data)
        return response.json()
    
    def get_user_info(self, access_token):
        """Get user info from Discord"""
        headers = {'Authorization': f'Bearer {access_token}'}
        response = requests.get(f"{self.base_url}/users/@me", headers=headers)
        return response.json()
    
    def get_user_guilds(self, access_token):
        """Get user's Discord servers"""
        headers = {'Authorization': f'Bearer {access_token}'}
        response = requests.get(f"{self.base_url}/users/@me/guilds", headers=headers)
        return response.json()
    
    def create_jwt_token(self, user_data):
        """Create JWT token for session management"""
        payload = {
            'user_id': user_data['id'],
            'username': user_data['username'],
            'exp': datetime.utcnow() + timedelta(days=7)
        }
        return jwt.encode(payload, config.JWT_SECRET, algorithm='HS256')

discord_oauth = DiscordOAuth()