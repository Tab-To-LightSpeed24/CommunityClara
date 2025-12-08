# backend/app/database/models.py
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime

Base = declarative_base()

class Server(Base):
    """Discord server configuration and statistics"""
    __tablename__ = "servers"
    
    id = Column(String, primary_key=True)  # Discord server ID
    name = Column(String, nullable=False)
    owner_id = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Core thresholds
    nsfw_threshold = Column(Float, default=0.7)
    toxicity_threshold = Column(Float, default=0.7)
    spam_threshold = Column(Float, default=0.7)
    harassment_threshold = Column(Float, default=0.7)
    
    # Action settings
    auto_delete = Column(Boolean, default=True)
    auto_timeout = Column(Boolean, default=False)
    timeout_duration = Column(Integer, default=300)
    warning_enabled = Column(Boolean, default=True)
    escalation_enabled = Column(Boolean, default=True)
    
    # Extended server settings
    welcome_message = Column(Text, default='')
    moderation_channels = Column(Text, default='[]')
    exempt_roles = Column(Text, default='[]')
    custom_keywords = Column(Text, default='')
    violation_log_channel = Column(String, default='')
    escalation_threshold = Column(Integer, default=3)
    learning_enabled = Column(Boolean, default=True)
    privacy_mode = Column(Boolean, default=True)
    
    # Privacy-preserving learning data
    false_positive_count = Column(Integer, default=0)
    true_positive_count = Column(Integer, default=0)
    total_messages_processed = Column(Integer, default=0)
    
    # Relationships
    violations = relationship("Violation", back_populates="server")
    analytics = relationship("ServerAnalytics", back_populates="server")

# Update the User class in backend/app/database/models.py
class User(Base):
    """Enhanced User model with Google OAuth support"""
    __tablename__ = "users"
    
    id = Column(String, primary_key=True)  # Discord user ID (keep for compatibility)
    username = Column(String, nullable=False)
    
    # Google OAuth fields
    email = Column(String, unique=True, nullable=True)  # Google email
    google_id = Column(String, unique=True, nullable=True)  # Google user ID
    display_name = Column(String, nullable=True)  # Full name from Google
    avatar_url = Column(String, nullable=True)  # Profile picture URL
    
    # Authentication fields
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    last_login = Column(String, nullable=True)  # Store as string for SQLite compatibility
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # User preferences
    theme = Column(String, default='system')  # 'light', 'dark', 'system'
    timezone = Column(String, default='UTC')
    language = Column(String, default='en')
    notification_preferences = Column(Text, default='{}')  # JSON string
    
    # Privacy-preserving behavioral data (aggregated only)
    total_violations = Column(Integer, default=0)
    total_messages = Column(Integer, default=0)
    reputation_score = Column(Float, default=1.0)  # 0.0 to 1.0
    
    # Relationships - FIXED: Remove user_servers relationship for now
    violations = relationship("Violation", back_populates="user")

class UserServer(Base):
    """Association between users and servers they have access to"""
    __tablename__ = "user_servers"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    server_id = Column(String, ForeignKey("servers.id"), nullable=False)
    role = Column(String, default='member')  # 'owner', 'admin', 'moderator', 'member'
    joined_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="user_servers")
    server = relationship("Server")

class Violation(Base):
    """Content violations with actual message content for dashboard"""
    __tablename__ = "violations"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    server_id = Column(String, ForeignKey("servers.id"), nullable=False)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    channel_id = Column(String, nullable=False)
    
    # Violation details
    violation_type = Column(String, nullable=False)  # nsfw, toxicity, spam
    confidence_score = Column(Float, nullable=False)
    action_taken = Column(String, nullable=False)  # delete, warn, timeout
    
    # ✨ REAL CONTENT FIELDS FOR DASHBOARD ✨
    message_content = Column(Text, nullable=True)  # Store actual violation content
    channel_name = Column(String, nullable=True)   # Store channel name for dashboard
    
    # Learning feedback
    false_positive = Column(Boolean, default=None)  # None = not reviewed
    appealed = Column(Boolean, default=False)
    appeal_successful = Column(Boolean, default=None)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    server = relationship("Server", back_populates="violations")
    user = relationship("User", back_populates="violations")

class ServerAnalytics(Base):
    """Daily aggregated analytics per server"""
    __tablename__ = "server_analytics"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    server_id = Column(String, ForeignKey("servers.id"), nullable=False)
    date = Column(DateTime, nullable=False)
    
    # Daily metrics
    messages_processed = Column(Integer, default=0)
    violations_detected = Column(Integer, default=0)
    false_positives = Column(Integer, default=0)
    actions_taken = Column(Integer, default=0)
    
    # Health metrics
    community_health_score = Column(Float, default=1.0)  # 0.0 to 1.0
    toxicity_trend = Column(Float, default=0.0)  # -1.0 to 1.0
    engagement_score = Column(Float, default=1.0)  # 0.0 to 1.0
    
    # Relationships
    server = relationship("Server", back_populates="analytics")