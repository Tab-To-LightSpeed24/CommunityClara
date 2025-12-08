# backend/app/api/models.py
from pydantic import BaseModel
from typing import Dict, List, Optional, Any
from datetime import datetime
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
    
    # ✨ ADD THESE NEW FIELDS ✨
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


class ServerStatsResponse(BaseModel):
    """Server statistics response model"""
    server_id: str
    server_name: str
    total_messages: int
    total_violations: int
    false_positives: int
    health_score: float
    toxicity_threshold: float
    nsfw_threshold: float
    auto_delete: bool
    auto_timeout: bool

class ViolationResponse(BaseModel):
    """Violation record response model with real content"""
    id: int
    violation_type: str
    confidence_score: float
    action_taken: str
    false_positive: Optional[bool]
    created_at: datetime
    
    # REAL DATA FIELDS
    message_content: Optional[str] = None
    username: Optional[str] = None
    channel_name: Optional[str] = None
    user_id: Optional[str] = None

class AnalyticsResponse(BaseModel):
    """Analytics data response model"""
    date: datetime
    messages_processed: int
    violations_detected: int
    false_positives: int
    community_health_score: float
    toxicity_trend: float
    engagement_score: float

class HealthScoreResponse(BaseModel):
    """Health score response model"""
    health_score: float
    trend: float
    status: str  # "excellent", "good", "fair", "poor"
    recommendations: List[str]

class ConfigUpdateRequest(BaseModel):
    """Configuration update request model - COMPLETE VERSION"""
    toxicity_threshold: Optional[float] = None
    nsfw_threshold: Optional[float] = None
    spam_threshold: Optional[float] = None  # ADD THIS
    harassment_threshold: Optional[float] = None  # ADD THIS
    auto_delete: Optional[bool] = None
    auto_timeout: Optional[bool] = None
    timeout_duration: Optional[int] = None
    warning_enabled: Optional[bool] = None  # ADD THIS
    escalation_enabled: Optional[bool] = None  # ADD THIS


class AnalysisRequest(BaseModel):
    """Content analysis request model"""
    content: str
    content_type: str = "text"  # "text" or "image"

class AnalysisResponse(BaseModel):
    """Content analysis response model"""
    flagged: bool
    confidence: float
    violation_type: Optional[str]
    categories: Dict[str, float]
    recommendations: List[str]

class DashboardData(BaseModel):
    """Complete dashboard data model"""
    server_stats: ServerStatsResponse
    recent_analytics: List[AnalyticsResponse]
    recent_violations: List[ViolationResponse]
    health_score: HealthScoreResponse
    violation_trends: Dict[str, int]

class ServerListResponse(BaseModel):
    """Server list response model"""
    servers: List[Dict[str, Any]]
    total_count: int

class LearningInsights(BaseModel):
    """Community learning insights model"""
    health_score: float
    toxicity_trend: float
    total_violations: int
    violation_types: Dict[str, int]
    average_confidence: float
    false_positive_rate: float
    current_thresholds: Dict[str, float]
    recommendations: List[Dict[str, Any]]

# FIXED: Feedback request model for violation feedback
class FeedbackRequest(BaseModel):
    """Feedback request for violations"""
    is_false_positive: bool


class ServerSettingsUpdateRequest(BaseModel):
    """Server settings update request model"""
    welcome_message: Optional[str] = None
    moderation_channels: Optional[List[str]] = None
    exempt_roles: Optional[List[str]] = None
    custom_keywords: Optional[str] = None
    violation_log_channel: Optional[str] = None
    escalation_threshold: Optional[int] = None
    learning_enabled: Optional[bool] = None
    privacy_mode: Optional[bool] = None

class ServerSettingsResponse(BaseModel):
    """Server settings response model"""
    server_id: str
    server_name: str
    welcome_message: str
    moderation_channels: List[str]
    exempt_roles: List[str]
    custom_keywords: str
    violation_log_channel: str
    escalation_threshold: int
    learning_enabled: bool
    privacy_mode: bool

