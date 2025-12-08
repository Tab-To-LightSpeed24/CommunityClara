# backend/app/api/models.py
from pydantic import BaseModel
from typing import Dict, List, Optional, Any
from datetime import datetime





class ServerStatsResponse(BaseModel):
    """Server statistics response model - COMPLETE VERSION"""
    server_id: str
    server_name: str
    total_messages: int
    total_violations: int
    false_positives: int
    health_score: float
    toxicity_threshold: float
    nsfw_threshold: float
    spam_threshold: float  # ADD THIS
    harassment_threshold: float  # ADD THIS
    auto_delete: bool
    auto_timeout: bool
    timeout_duration: int  # ADD THIS
    warning_enabled: bool  # ADD THIS
    escalation_enabled: bool  # ADD THIS

    
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

