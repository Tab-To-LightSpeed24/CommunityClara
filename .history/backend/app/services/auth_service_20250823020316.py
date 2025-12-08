# backend/app/services/auth_service.py
import os
import jwt
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from google.auth.transport import requests
from google.oauth2 import id_token
from sqlalchemy.orm import Session

from app.database.models import User
from app.utils.logger import logger

class AuthService:
    def __init__(self):
        self.google_client_id = os.getenv('GOOGLE_CLIENT_ID')
        self.jwt_secret = os.getenv('JWT_SECRET_KEY')
        self.jwt_algorithm = os.getenv('JWT_ALGORITHM', 'HS256')
        self.jwt_expire_hours = int(os.getenv('JWT_EXPIRE_HOURS', 24))
    
    async def verify_google_token(self, token: str) -> Optional[Dict[str, Any]]:
        """Verify Google ID token and extract user info"""
        try:
            # Verify the token
            idinfo = id_token.verify_oauth2_token(
                token, 
                requests.Request(), 
                self.google_client_id
            )
            
            if idinfo['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
                raise ValueError('Wrong issuer.')
            
            return {
                'google_id': idinfo['sub'],
                'email': idinfo['email'],
                'name': idinfo.get('name', ''),
                'picture': idinfo.get('picture', ''),
                'email_verified': idinfo.get('email_verified', False)
            }
            
        except ValueError as e:
            logger.error(f"❌ Google token verification failed: {e}")
            return None
    
    def create_jwt_token(self, user_data: Dict[str, Any]) -> str:
        """Create JWT token for user session"""
        payload = {
            'user_id': user_data['id'],
            'email': user_data['email'],
            'username': user_data['username'],
            'exp': datetime.utcnow() + timedelta(hours=self.jwt_expire_hours),
            'iat': datetime.utcnow()
        }
        
        return jwt.encode(payload, self.jwt_secret, algorithm=self.jwt_algorithm)
    
    def verify_jwt_token(self, token: str) -> Optional[Dict[str, Any]]:
        """Verify and decode JWT token"""
        try:
            payload = jwt.decode(token, self.jwt_secret, algorithms=[self.jwt_algorithm])
            return payload
        except jwt.ExpiredSignatureError:
            logger.warning("🔒 JWT token expired")
            return None
        except jwt.InvalidTokenError as e:
            logger.warning(f"🔒 Invalid JWT token: {e}")
            return None
    
    async def create_or_update_user(self, google_info: Dict[str, Any], db: Session) -> User:
        """Create new user or update existing user from Google info"""
        try:
            # Check if user exists by Google ID or email
            user = db.query(User).filter(
                (User.google_id == google_info['google_id']) | 
                (User.email == google_info['email'])
            ).first()
            
            if user:
                # Update existing user
                user.google_id = google_info['google_id']
                user.email = google_info['email']
                user.display_name = google_info['name']
                user.avatar_url = google_info['picture']
                user.is_verified = google_info['email_verified']
                user.last_login = datetime.utcnow().isoformat()
                user.updated_at = datetime.utcnow()
                
                logger.info(f"✅ Updated existing user: {user.email}")
            else:
                # Create new user
                user = User(
                    id=f"google_{google_info['google_id']}",  # Unique ID
                    google_id=google_info['google_id'],
                    email=google_info['email'],
                    username=google_info['email'].split('@')[0],  # Use email prefix as username
                    display_name=google_info['name'],
                    avatar_url=google_info['picture'],
                    is_verified=google_info['email_verified'],
                    last_login=datetime.utcnow().isoformat(),
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow()
                )
                db.add(user)
                
                logger.info(f"✅ Created new user: {user.email}")
            
            db.commit()
            return user
            
        except Exception as e:
            logger.error(f"❌ Error creating/updating user: {e}")
            db.rollback()
            raise

# Global auth service instance
auth_service = AuthService()