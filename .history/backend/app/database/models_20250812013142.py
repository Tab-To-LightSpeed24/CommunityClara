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
    
    # Configuration
    nsfw_threshold = Column(Float, default=0.7)
    toxicity_threshold = Column(Float, default=0.7)
    auto_delete = Column(Boolean, default=True)
    auto_timeout = Column(Boolean, default=False)
    timeout_duration = Column(Integer, default=300)  # seconds
    
    # Extended server settings - ADD THESE NEW FIELDS
    welcome_message = Column(Text, default='')
    moderation_channels = Column(Text, default='[]')  # JSON array as string
    exempt_roles = Column(Text, default='[]')  # JSON array as string
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

class User(Base):
    """User information (minimal, privacy-focused)"""
    __tablename__ = "users"
    
    id = Column(String, primary_key=True)  # Discord user ID
    username = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Privacy-preserving behavioral data (aggregated only)
    total_violations = Column(Integer, default=0)
    total_messages = Column(Integer, default=0)
    reputation_score = Column(Float, default=1.0)  # 0.0 to 1.0
    
    # Relationships
    violations = relationship("Violation", back_populates="user")

class Violation(Base):
    """Content violations (anonymized)"""
    __tablename__ = "violations"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    server_id = Column(String, ForeignKey("servers.id"), nullable=False)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    channel_id = Column(String, nullable=False)
    
    # Violation details (no actual content stored)
    violation_type = Column(String, nullable=False)  # nsfw, toxicity, spam
    confidence_score = Column(Float, nullable=False)
    action_taken = Column(String, nullable=False)  # delete, warn, timeout
    
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