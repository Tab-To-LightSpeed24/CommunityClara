# backend/app/api/routes.py
from fastapi import APIRouter, HTTPException, Depends, Query
from fastapi.responses import JSONResponse
from typing import List, Optional
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from pydantic import BaseModel
from fastapi.security import HTTPBearer

from app.api.models import (
    ServerStatsResponse, ViolationResponse, AnalyticsResponse,
    HealthScoreResponse, ConfigUpdateRequest, AnalysisRequest,
    AnalysisResponse, DashboardData, ServerListResponse, LearningInsights,
    FeedbackRequest, ServerSettingsResponse, ServerSettingsUpdateRequest  # Added new imports
)


from app.database.connection import get_db
from app.database.models import Server, User, Violation, ServerAnalytics
from app.ml.content_analyzer import content_analyzer
from app.ml.community_learner import community_learner
from app.utils.logger import logger



router = APIRouter()
class FeedbackRequest(BaseModel):
    is_false_positive: bool

@router.get("/servers", response_model=ServerListResponse)
async def get_servers(db: Session = Depends(get_db)):
    """Get list of all servers"""
    try:
        servers = db.query(Server).all()
        
        server_list = []
        for server in servers:
            server_list.append({
                "id": server.id,
                "name": server.name,
                "total_messages": server.total_messages_processed,
                "health_score": await _calculate_server_health(server.id, db)
            })
        
        return ServerListResponse(
            servers=server_list,
            total_count=len(server_list)
        )
        
    except Exception as e:
        logger.error(f"Error fetching servers: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/servers/{server_id}/stats", response_model=ServerStatsResponse)
async def get_server_stats(server_id: str, db: Session = Depends(get_db)):
    """Get detailed server statistics"""
    try:
        server = db.query(Server).filter_by(id=server_id).first()
        
        if not server:
            raise HTTPException(status_code=404, detail="Server not found")
        
        # Get violation count
        total_violations = db.query(Violation).filter_by(server_id=server_id).count()
        
        # Calculate health score
        if total_violations > 0 and server.total_messages_processed > 0:
            violation_rate = total_violations / server.total_messages_processed
            # Health score inversely related to violation rate
            health_score = max(0.1, min(1.0, 1.0 - (violation_rate * 2)))
        else:
            health_score = 0.85  # Default good health for new servers

        
        return ServerStatsResponse(
            server_id=server.id,
            server_name=server.name,
            total_messages=server.total_messages_processed,
            total_violations=total_violations,
            false_positives=server.false_positive_count,
            health_score=health_score,
            toxicity_threshold=server.toxicity_threshold,
            nsfw_threshold=server.nsfw_threshold,
            spam_threshold=getattr(server, 'spam_threshold', 0.7),  # ADD THIS
            harassment_threshold=getattr(server, 'harassment_threshold', 0.7),  # ADD THIS
            auto_delete=server.auto_delete,
            auto_timeout=server.auto_timeout,
            timeout_duration=server.timeout_duration,  # ADD THIS
            warning_enabled=getattr(server, 'warning_enabled', True),  # ADD THIS
            escalation_enabled=getattr(server, 'escalation_enabled', True)  # ADD THIS
        )

        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching server stats: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/servers/{server_id}/analytics", response_model=List[AnalyticsResponse])
async def get_server_analytics(
    server_id: str,
    days: int = Query(default=7, ge=1, le=30),
    db: Session = Depends(get_db)
):
    """Get server analytics for specified number of days"""
    try:
        # Verify server exists
        server = db.query(Server).filter_by(id=server_id).first()
        if not server:
            raise HTTPException(status_code=404, detail="Server not found")
        
        # Get analytics data
        start_date = datetime.utcnow() - timedelta(days=days)
        analytics = db.query(ServerAnalytics).filter(
            ServerAnalytics.server_id == server_id,
            ServerAnalytics.date >= start_date
        ).order_by(ServerAnalytics.date.desc()).all()
        
        return [
            AnalyticsResponse(
                date=a.date,
                messages_processed=a.messages_processed,
                violations_detected=a.violations_detected,
                false_positives=a.false_positives,
                community_health_score=a.community_health_score,
                toxicity_trend=a.toxicity_trend,
                engagement_score=a.engagement_score
            )
            for a in analytics
        ]
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching analytics: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/servers/{server_id}/violations", response_model=List[ViolationResponse])
async def get_server_violations(
    server_id: str,
    limit: int = Query(default=50, ge=1, le=200),
    db: Session = Depends(get_db)
):
    """Get recent violations with REAL Discord data - UPDATED"""
    try:
        # Verify server exists
        server = db.query(Server).filter_by(id=server_id).first()
        if not server:
            raise HTTPException(status_code=404, detail="Server not found")
        
        # Get recent violations with user data
        violations_query = db.query(Violation, User).join(
            User, Violation.user_id == User.id
        ).filter(
            Violation.server_id == server_id
        ).order_by(
            Violation.created_at.desc()
        ).limit(limit).all()
        
        violations_data = []
        for violation, user in violations_query:
            violations_data.append({
                "id": violation.id,
                "violation_type": violation.violation_type,
                "confidence_score": violation.confidence_score,
                "action_taken": violation.action_taken,
                "false_positive": violation.false_positive,
                "created_at": violation.created_at,
                # ✨ REAL DISCORD DATA FROM DATABASE ✨
                "username": user.username if user else "Unknown User",
                "user_id": violation.user_id,
                "channel_name": violation.channel_name or f"#channel-{violation.channel_id[-4:]}" if violation.channel_id else "#unknown",
                "message_content": violation.message_content or "Content not available"
            })
        
        logger.info(f"📊 Retrieved {len(violations_data)} violations for server {server_id}")
        return violations_data
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching violations: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")
@router.get("/servers/{server_id}/health", response_model=HealthScoreResponse)
async def get_server_health(server_id: str, db: Session = Depends(get_db)):
    """Get server health score and recommendations"""
    try:
        # Verify server exists
        server = db.query(Server).filter_by(id=server_id).first()
        if not server:
            raise HTTPException(status_code=404, detail="Server not found")
        
        # Get health insights
        insights = await community_learner.get_server_insights(server_id)
        recommendations_data = await community_learner.get_learning_recommendations(server_id)
        
        health_score = insights.get('health_score', 0.5)
        trend = insights.get('toxicity_trend', 0.0)
        
        # Determine status
        if health_score >= 0.8:
            status = "excellent"
        elif health_score >= 0.6:
            status = "good"
        elif health_score >= 0.4:
            status = "fair"
        else:
            status = "poor"
        
        # Extract recommendation messages
        recommendations = [
            rec['message'] for rec in recommendations_data.get('recommendations', [])
        ]
        
        return HealthScoreResponse(
            health_score=health_score,
            trend=trend,
            status=status,
            recommendations=recommendations
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching health data: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post("/servers/{server_id}/config")
async def update_server_config(
    server_id: str,
    config: ConfigUpdateRequest,
    db: Session = Depends(get_db)
):
    """Update server configuration with enhanced debugging"""
    try:
        server = db.query(Server).filter_by(id=server_id).first()
        
        if not server:
            raise HTTPException(status_code=404, detail="Server not found")
        
        logger.info(f"🔧 Updating config for server {server_id}")
        logger.info(f"📥 Received config: {config.dict()}")
        
        # Update configuration with explicit type conversion
        changes = []
        
        if config.toxicity_threshold is not None:
            if not 0.1 <= config.toxicity_threshold <= 1.0:
                raise HTTPException(status_code=400, detail="Toxicity threshold must be between 0.1 and 1.0")
            old_val = server.toxicity_threshold
            server.toxicity_threshold = float(config.toxicity_threshold)
            changes.append(f"toxicity: {old_val} → {server.toxicity_threshold}")
        
        if config.nsfw_threshold is not None:
            if not 0.1 <= config.nsfw_threshold <= 1.0:
                raise HTTPException(status_code=400, detail="NSFW threshold must be between 0.1 and 1.0")
            old_val = server.nsfw_threshold
            server.nsfw_threshold = float(config.nsfw_threshold)
            changes.append(f"nsfw: {old_val} → {server.nsfw_threshold}")
        
        if config.spam_threshold is not None:
            if not 0.1 <= config.spam_threshold <= 1.0:
                raise HTTPException(status_code=400, detail="Spam threshold must be between 0.1 and 1.0")
            old_val = getattr(server, 'spam_threshold', 0.7)
            server.spam_threshold = float(config.spam_threshold)
            changes.append(f"spam: {old_val} → {server.spam_threshold}")

        if config.harassment_threshold is not None:
            if not 0.1 <= config.harassment_threshold <= 1.0:
                raise HTTPException(status_code=400, detail="Harassment threshold must be between 0.1 and 1.0")
            old_val = getattr(server, 'harassment_threshold', 0.7)
            server.harassment_threshold = float(config.harassment_threshold)
            changes.append(f"harassment: {old_val} → {server.harassment_threshold}")

        if config.warning_enabled is not None:
            old_val = getattr(server, 'warning_enabled', True)
            server.warning_enabled = bool(config.warning_enabled)
            changes.append(f"warnings: {old_val} → {server.warning_enabled}")

        if config.escalation_enabled is not None:
            old_val = getattr(server, 'escalation_enabled', True)
            server.escalation_enabled = bool(config.escalation_enabled)
            changes.append(f"escalation: {old_val} → {server.escalation_enabled}")

        if config.auto_delete is not None:
            old_val = server.auto_delete
            server.auto_delete = bool(config.auto_delete)
            changes.append(f"auto_delete: {old_val} → {server.auto_delete}")
        
        if config.auto_timeout is not None:
            old_val = server.auto_timeout
            server.auto_timeout = bool(config.auto_timeout)
            changes.append(f"auto_timeout: {old_val} → {server.auto_timeout}")
        
        if config.timeout_duration is not None:
            if not 60 <= config.timeout_duration <= 86400:
                raise HTTPException(status_code=400, detail="Timeout duration must be between 60 and 86400 seconds")
            old_val = server.timeout_duration
            server.timeout_duration = int(config.timeout_duration)
            changes.append(f"timeout_duration: {old_val} → {server.timeout_duration}")
        
        db.commit()
        
        logger.info(f"✅ Config updated successfully: {', '.join(changes)}")
        
        return {"message": "Configuration updated successfully", "changes": changes}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating config: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post("/analyze", response_model=AnalysisResponse)
async def analyze_content(request: AnalysisRequest):
    """Analyze content for violations"""
    try:
        if request.content_type == "text":
            analysis = await content_analyzer.analyze_text(request.content)
            
            # Generate recommendations
            recommendations = []
            if analysis.get('flagged'):
                recommendations.append("Consider revising this message before posting")
                if analysis.get('violation_type'):
                    recommendations.append(f"Primary concern: {analysis.get('violation_type').replace('_', ' ')}")
            else:
                recommendations.append("Content appears appropriate")
            
            return AnalysisResponse(
                flagged=analysis.get('flagged', False),
                confidence=analysis.get('max_score', 0.0),
                violation_type=analysis.get('violation_type'),
                categories=analysis.get('scores', {}),
                recommendations=recommendations
            )
        else:
            raise HTTPException(status_code=400, detail="Image analysis not implemented in MVP")
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error analyzing content: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/servers/{server_id}/dashboard", response_model=DashboardData)
async def get_dashboard_data(server_id: str, db: Session = Depends(get_db)):
    """Get complete dashboard data for a server"""
    try:
        # Get server stats
        server_stats = await get_server_stats(server_id, db)
        
        # Get recent analytics (last 7 days)
        recent_analytics = await get_server_analytics(server_id, days=7, db=db)
        
        # Get recent violations
        recent_violations = await get_server_violations(server_id, limit=20, db=db)
        
        # Get health score
        health_score = await get_server_health(server_id, db)
        
        # Get violation trends
        violations = db.query(Violation).filter_by(server_id=server_id).all()
        violation_trends = {}
        for violation in violations:
            violation_trends[violation.violation_type] = violation_trends.get(violation.violation_type, 0) + 1
        
        return DashboardData(
            server_stats=server_stats,
            recent_analytics=recent_analytics,
            recent_violations=recent_violations,
            health_score=health_score,
            violation_trends=violation_trends
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching dashboard data: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/servers/{server_id}/insights", response_model=LearningInsights)
async def get_learning_insights(server_id: str, db: Session = Depends(get_db)):
    """Get community learning insights"""
    try:
        # Verify server exists
        server = db.query(Server).filter_by(id=server_id).first()
        if not server:
            raise HTTPException(status_code=404, detail="Server not found")
        
        # Get insights from community learner
        insights = await community_learner.get_server_insights(server_id)
        recommendations_data = await community_learner.get_learning_recommendations(server_id)
        
        return LearningInsights(
            health_score=insights.get('health_score', 0.5),
            toxicity_trend=insights.get('toxicity_trend', 0.0),
            total_violations=insights.get('total_violations', 0),
            violation_types=insights.get('violation_types', {}),
            average_confidence=insights.get('average_confidence', 0.0),
            false_positive_rate=insights.get('false_positive_rate', 0.0),
            current_thresholds=insights.get('current_thresholds', {}),
            recommendations=recommendations_data.get('recommendations', [])
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching insights: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post("/servers/{server_id}/violations/{violation_id}/feedback")
async def report_violation_feedback(
    server_id: str,
    violation_id: int,
    feedback: FeedbackRequest,
    db: Session = Depends(get_db)
):
    """Report feedback on a violation - SIMPLIFIED"""
    try:
        logger.info(f"📥 Received feedback: server={server_id}, violation={violation_id}, false_positive={feedback.is_false_positive}")
        
        violation = db.query(Violation).filter_by(
            id=violation_id,
            server_id=server_id
        ).first()
        
        if not violation:
            logger.error(f"❌ Violation not found: {violation_id}")
            raise HTTPException(status_code=404, detail="Violation not found")
        
        # Update violation record
        old_value = violation.false_positive
        violation.false_positive = feedback.is_false_positive
        db.commit()
        
        logger.info(f"✅ Updated violation {violation_id}: false_positive {old_value} → {feedback.is_false_positive}")
        
        # Report to community learner
        violation_data = {
            'violation_type': violation.violation_type,
            'confidence': violation.confidence_score
        }
        
        if feedback.is_false_positive:
            await community_learner.report_false_positive(server_id, violation_data)
            logger.info(f"📚 Reported as false positive")
        else:
            await community_learner.report_true_positive(server_id, violation_data)
            logger.info(f"✅ Confirmed as true positive")
        
        return {
            "message": "Feedback recorded successfully",
            "violation_id": violation_id,
            "is_false_positive": feedback.is_false_positive
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error recording feedback: {e}")
        import traceback
        logger.error(f"Full traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/debug/feedback")
async def debug_feedback(request: dict):
    """Debug endpoint to see what frontend is sending"""
    try:
        logger.info(f"🔍 DEBUG: Received request type: {type(request)}")
        logger.info(f"🔍 DEBUG: Request content: {request}")
        logger.info(f"🔍 DEBUG: Request keys: {list(request.keys()) if isinstance(request, dict) else 'Not a dict'}")
        
        return {
            "received_type": str(type(request)),
            "received_content": request,
            "keys": list(request.keys()) if isinstance(request, dict) else None
        }
        
    except Exception as e:
        logger.error(f"Debug error: {e}")
        return {"error": str(e)}

@router.put("/servers/{server_id}/name")
async def update_server_name(
    server_id: str,
    request: dict,
    db: Session = Depends(get_db)
):
    """Update server display name"""
    try:
        server = db.query(Server).filter_by(id=server_id).first()
        
        if not server:
            raise HTTPException(status_code=404, detail="Server not found")
        
        new_name = request.get("name", "").strip()
        if not new_name or len(new_name) > 100:
            raise HTTPException(status_code=400, detail="Server name must be 1-100 characters")
        
        old_name = server.name
        server.name = new_name
        db.commit()
        
        logger.info(f"📝 Updated server name: {server_id} '{old_name}' -> '{new_name}'")
        
        return {"message": "Server name updated successfully", "name": new_name}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating server name: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

async def _calculate_server_health(server_id: str, db: Session) -> float:
    """Calculate server health score"""
    try:
        server = db.query(Server).filter_by(id=server_id).first()
        if not server:
            return 0.5
        
        # Get recent violations (last 7 days) - simplified query
        week_ago = datetime.utcnow() - timedelta(days=7)
        recent_violations = db.query(Violation).filter(
            Violation.server_id == server_id,
            Violation.created_at >= week_ago
        ).count()
        
        # Calculate health based on violation rate and accuracy
        if server.total_messages_processed == 0:
            return 1.0
        
        violation_rate = recent_violations / max(1, server.total_messages_processed)
        total_feedback = server.false_positive_count + server.true_positive_count
        accuracy = 1 - (server.false_positive_count / max(1, total_feedback))
        
        # Combine violation rate and accuracy
        base_health = max(0, 1 - (violation_rate * 100))
        health_score = (base_health * 0.6) + (accuracy * 0.4)
        
        return min(1.0, max(0.0, health_score))
        
    except Exception as e:
        logger.error(f"Error calculating health score: {e}")
        return 0.5


@router.post("/servers/{server_id}/settings")
async def update_server_settings(
    server_id: str,
    settings: ServerSettingsUpdateRequest,
    db: Session = Depends(get_db)
):
    """Update server settings with proper validation and error handling"""
    try:
        logger.info(f"🏠 Updating server settings for {server_id}")
        logger.info(f"📥 Received settings: {settings.dict(exclude_unset=True)}")
        
        server = db.query(Server).filter_by(id=server_id).first()
        
        if not server:
            logger.error(f"❌ Server not found: {server_id}")
            raise HTTPException(status_code=404, detail="Server not found")
        
        changes = []
        import json
        
        # Update only the fields that are provided (not None)
        if settings.welcome_message is not None:
            old_value = server.welcome_message
            server.welcome_message = settings.welcome_message.strip()
            changes.append(f"welcome_message: '{old_value}' → '{server.welcome_message}'")
        
        if settings.moderation_channels is not None:
            old_value = server.moderation_channels
            # Validate that it's a list of strings
            if not isinstance(settings.moderation_channels, list):
                raise HTTPException(status_code=400, detail="moderation_channels must be a list")
            
            # Filter out empty strings and validate channel names
            valid_channels = []
            for channel in settings.moderation_channels:
                if isinstance(channel, str) and channel.strip():
                    # Remove # if present and validate channel name format
                    clean_channel = channel.strip().lstrip('#')
                    if clean_channel:
                        valid_channels.append(clean_channel)
            
            server.moderation_channels = json.dumps(valid_channels)
            changes.append(f"moderation_channels: {len(valid_channels)} channels")
        
        if settings.exempt_roles is not None:
            old_value = server.exempt_roles
            # Validate that it's a list of strings
            if not isinstance(settings.exempt_roles, list):
                raise HTTPException(status_code=400, detail="exempt_roles must be a list")
            
            # Filter out empty strings and validate role names
            valid_roles = []
            for role in settings.exempt_roles:
                if isinstance(role, str) and role.strip():
                    valid_roles.append(role.strip())
            
            server.exempt_roles = json.dumps(valid_roles)
            changes.append(f"exempt_roles: {len(valid_roles)} roles")
        
        if settings.custom_keywords is not None:
            old_value = server.custom_keywords
            server.custom_keywords = settings.custom_keywords.strip()
            changes.append(f"custom_keywords: '{old_value}' → '{server.custom_keywords}'")
        
        if settings.violation_log_channel is not None:
            old_value = server.violation_log_channel
            # Clean channel name (remove # if present)
            clean_channel = settings.violation_log_channel.strip().lstrip('#')
            server.violation_log_channel = clean_channel
            changes.append(f"violation_log_channel: '{old_value}' → '{server.violation_log_channel}'")
        
        if settings.escalation_threshold is not None:
            if not 1 <= settings.escalation_threshold <= 10:
                raise HTTPException(status_code=400, detail="escalation_threshold must be between 1 and 10")
            old_value = server.escalation_threshold
            server.escalation_threshold = settings.escalation_threshold
            changes.append(f"escalation_threshold: {old_value} → {server.escalation_threshold}")
        
        if settings.learning_enabled is not None:
            old_value = server.learning_enabled
            server.learning_enabled = settings.learning_enabled
            changes.append(f"learning_enabled: {old_value} → {server.learning_enabled}")
        
        if settings.privacy_mode is not None:
            old_value = server.privacy_mode
            server.privacy_mode = settings.privacy_mode
            changes.append(f"privacy_mode: {old_value} → {server.privacy_mode}")
        
        # Update the updated_at timestamp
        server.updated_at = datetime.utcnow()
        
        # Commit all changes
        db.commit()
        
        logger.info(f"✅ Server settings updated successfully. Changes: {', '.join(changes) if changes else 'No changes'}")
        
        return {
            "message": "Server settings updated successfully",
            "server_id": server_id,
            "changes": changes,
            "updated_at": server.updated_at.isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error updating server settings: {e}")
        import traceback
        logger.error(f"Full traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/servers/{server_id}/settings", response_model=ServerSettingsResponse)
async def get_server_settings(server_id: str, db: Session = Depends(get_db)):
    """Get server settings with complete error handling and proper model response"""
    try:
        logger.info(f"🏠 Getting server settings for {server_id}")
        
        server = db.query(Server).filter_by(id=server_id).first()
        
        if not server:
            logger.error(f"❌ Server not found: {server_id}")
            raise HTTPException(status_code=404, detail="Server not found")
        
        logger.info(f"📊 Server found: {server.name}")
        
        import json
        
        # Safely parse JSON fields with error handling
        moderation_channels = []
        exempt_roles = []
        
        try:
            if server.moderation_channels:
                moderation_channels = json.loads(server.moderation_channels)
                if not isinstance(moderation_channels, list):
                    moderation_channels = []
        except (json.JSONDecodeError, TypeError) as e:
            logger.warning(f"⚠️ Invalid JSON in moderation_channels: {server.moderation_channels}, error: {e}")
            moderation_channels = []
        
        try:
            if server.exempt_roles:
                exempt_roles = json.loads(server.exempt_roles)
                if not isinstance(exempt_roles, list):
                    exempt_roles = []
        except (json.JSONDecodeError, TypeError) as e:
            logger.warning(f"⚠️ Invalid JSON in exempt_roles: {server.exempt_roles}, error: {e}")
            exempt_roles = []
        
        # Construct response using Pydantic model
        response = ServerSettingsResponse(
            server_id=server.id,
            server_name=server.name or '',
            welcome_message=server.welcome_message or '',
            moderation_channels=moderation_channels,
            exempt_roles=exempt_roles,
            custom_keywords=server.custom_keywords or '',
            violation_log_channel=server.violation_log_channel or '',
            escalation_threshold=server.escalation_threshold if server.escalation_threshold is not None else 3,
            learning_enabled=server.learning_enabled if server.learning_enabled is not None else True,
            privacy_mode=server.privacy_mode if server.privacy_mode is not None else True
        )
        
        logger.info(f"✅ Successfully retrieved settings for server: {server.name}")
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Unexpected error in get_server_settings: {e}")
        import traceback
        logger.error(f"Full traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Unexpected server error: {str(e)}")

@router.post("/servers/{server_id}/analytics/generate")
async def generate_analytics_data(server_id: str, db: Session = Depends(get_db)):
    """Generate sample analytics data for the last 7 days"""
    try:
        server = db.query(Server).filter_by(id=server_id).first()
        if not server:
            raise HTTPException(status_code=404, detail="Server not found")
        
        # Get violations for calculating realistic analytics
        violations = db.query(Violation).filter_by(server_id=server_id).all()
        
        # Generate analytics for last 7 days
        for i in range(7):
            date = datetime.utcnow() - timedelta(days=i)
            
            # Check if analytics already exist for this date
            existing = db.query(ServerAnalytics).filter(
                ServerAnalytics.server_id == server_id,
                ServerAnalytics.date >= datetime.combine(date.date(), datetime.min.time()),
                ServerAnalytics.date < datetime.combine(date.date() + timedelta(days=1), datetime.min.time())
            ).first()
            
            if not existing:
                # Count violations for this day
                day_violations = [v for v in violations if v.created_at.date() == date.date()]
                
                analytics = ServerAnalytics(
                    server_id=server_id,
                    date=date,
                    messages_processed=max(1, len(day_violations) * 8),  # Estimate 8 messages per violation
                    violations_detected=len(day_violations),
                    false_positives=sum(1 for v in day_violations if v.false_positive),
                    actions_taken=len(day_violations),
                    community_health_score=0.95 - (len(day_violations) * 0.02),  # Realistic health
                    toxicity_trend=-0.1 if len(day_violations) > 0 else 0.0,
                    engagement_score=0.85
                )
                db.add(analytics)
        
        db.commit()
        return {"message": "Analytics data generated successfully"}
        
    except Exception as e:
        logger.error(f"Error generating analytics: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/user/preferences")
async def update_user_preferences(
    preferences: dict,
    db: Session = Depends(get_db)
):
    """Update user notification and privacy preferences"""
    try:
        # For now, just return success
        # In production, you'd save to user preferences table
        logger.info(f"Updated user preferences: {preferences}")
        
        return {
            "message": "Preferences updated successfully",
            "preferences": preferences
        }
        
    except Exception as e:
        logger.error(f"Error updating preferences: {e}")
        raise HTTPException(status_code=500, detail="Failed to update preferences")

@router.get("/user/notifications")
async def get_user_notifications(
    user_id: str = "default_user",  # In production, get from auth
    db: Session = Depends(get_db)
):
    """Get user notifications with real violation data"""
    try:
        logger.info(f"🔔 Getting notifications for user {user_id}")
        
        # Get recent violations for notifications
        recent_violations = db.query(Violation).order_by(
            Violation.created_at.desc()
        ).limit(20).all()
        
        notifications = []
        
        # Create notifications from violations
        for violation in recent_violations:
            server = db.query(Server).filter_by(id=violation.server_id).first()
            server_name = server.name if server else "Unknown Server"
            
            notifications.append({
                "id": f"violation_{violation.id}",
                "type": "violation",
                "title": f"{violation.violation_type.title()} Detected",
                "message": f"Content violation in {violation.channel_name or '#unknown'}",
                "server": server_name,
                "timestamp": violation.created_at.isoformat(),
                "read": False,
                "icon": "🚨",
                "severity": "high" if violation.confidence_score > 0.8 else "medium",
                "content_preview": violation.message_content[:50] + "..." if violation.message_content else "No preview"
            })
        
        # Add some system notifications
        system_notifications = [
            {
                "id": "system_update_1",
                "type": "system_update",
                "title": "System Update",
                "message": "SafeSpace AI detection improved with latest updates",
                "timestamp": datetime.utcnow().isoformat(),
                "read": False,
                "icon": "🔄",
                "severity": "low"
            },
            {
                "id": "daily_report_1", 
                "type": "daily_report",
                "title": "Daily Moderation Report",
                "message": f"Processed {len(recent_violations)} violations today",
                "timestamp": datetime.utcnow().isoformat(),
                "read": False,
                "icon": "📊",
                "severity": "medium"
            }
        ]
        
        notifications.extend(system_notifications)
        
        # Sort by timestamp (newest first)
        notifications.sort(key=lambda x: x['timestamp'], reverse=True)
        
        unread_count = len([n for n in notifications if not n["read"]])
        
        logger.info(f"✅ Returning {len(notifications)} notifications, {unread_count} unread")
        
        return {
            "notifications": notifications,
            "unread_count": unread_count,
            "total_count": len(notifications)
        }
        
    except Exception as e:
        logger.error(f"❌ Error fetching notifications: {e}")
        import traceback
        logger.error(f"Full traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail="Failed to fetch notifications")


@router.put("/servers/{server_id}/name")
async def update_server_name(
    server_id: str,
    request: dict,
    db: Session = Depends(get_db)
):
    """Update server display name"""
    try:
        server = db.query(Server).filter_by(id=server_id).first()
        
        if not server:
            raise HTTPException(status_code=404, detail="Server not found")
        
        new_name = request.get('name', '').strip()
        if not new_name:
            raise HTTPException(status_code=400, detail="Server name cannot be empty")
        
        old_name = server.name
        server.name = new_name
        db.commit()
        
        logger.info(f"🏷️ Server name updated: {old_name} → {new_name}")
        
        return {
            "message": "Server name updated successfully",
            "old_name": old_name,
            "new_name": new_name
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating server name: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")
    

@router.get("/user/notifications")
async def get_user_notifications(
    user_id: str = "default_user",  # In production, get from auth
    db: Session = Depends(get_db)
):
    """Get user notifications with real data"""
    try:
        # Get recent violations for notifications
        recent_violations = db.query(Violation).order_by(
            Violation.created_at.desc()
        ).limit(10).all()
        
        notifications = []
        for violation in recent_violations:
            notifications.append({
                "id": violation.id,
                "type": "violation",
                "title": f"{violation.violation_type.title()} Detected",
                "message": f"Violation in #{violation.channel_name or 'unknown'} channel",
                "server": "Your Server",
                "timestamp": violation.created_at.isoformat(),
                "read": False,
                "icon": "🚨",
                "severity": "high" if violation.confidence_score > 0.8 else "medium"
            })
        
        # Add system notifications
        notifications.extend([
            {
                "id": "system_1",
                "type": "system_update",
                "title": "System Update",
                "message": "SafeSpace AI has been updated with improved detection",
                "timestamp": datetime.utcnow().isoformat(),
                "read": False,
                "icon": "🔄",
                "severity": "low"
            }
        ])
        
        return {
            "notifications": notifications,
            "unread_count": len([n for n in notifications if not n["read"]])
        }
        
    except Exception as e:
        logger.error(f"Error fetching notifications: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch notifications")

@router.put("/user/notifications/{notification_id}/read")
async def mark_notification_read(
    notification_id: str,
    db: Session = Depends(get_db)
):
    """Mark notification as read"""
    try:
        logger.info(f"📖 Marking notification {notification_id} as read")
        
        # In a real implementation, you'd store notification read status in database
        # For now, we'll simulate success and log the action
        
        return {
            "message": "Notification marked as read",
            "notification_id": notification_id,
            "read": True,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"❌ Error marking notification as read: {e}")
        raise HTTPException(status_code=500, detail="Failed to mark notification as read")


@router.delete("/user/notifications/{notification_id}")
async def delete_notification(
    notification_id: str,
    db: Session = Depends(get_db)
):
    """Delete notification"""
    try:
        logger.info(f"🗑️ Deleting notification {notification_id}")
        
        # In a real implementation, you'd delete from database
        # For now, we'll simulate success
        
        return {
            "message": "Notification deleted successfully",
            "notification_id": notification_id,
            "deleted": True,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"❌ Error deleting notification: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete notification")


@router.put("/user/notifications/mark-all-read")
async def mark_all_notifications_read(
    user_id: str = "default_user",
    db: Session = Depends(get_db)
):
    """Mark all notifications as read"""
    try:
        logger.info(f"📖 Marking all notifications as read for user {user_id}")
        
        # In a real implementation, you'd update all user notifications in database
        # For now, we'll simulate success with a count
        
        # Get current notification count for realistic response
        recent_violations = db.query(Violation).count()
        total_notifications = min(recent_violations + 2, 25)  # violations + system notifications
        
        return {
            "message": "All notifications marked as read",
            "user_id": user_id,
            "updated_count": total_notifications,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"❌ Error marking all notifications as read: {e}")
        raise HTTPException(status_code=500, detail="Failed to mark all notifications as read")


