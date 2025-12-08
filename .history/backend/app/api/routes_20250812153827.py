# backend/app/api/routes.py
from fastapi import APIRouter, HTTPException, Depends, Query
from fastapi.responses import JSONResponse
from typing import List, Optional
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.auth.discord_oauth import discord_oauth
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
        health_score = await _calculate_server_health(server_id, db)
        
        return ServerStatsResponse(
            server_id=server.id,
            server_name=server.name,
            total_messages=server.total_messages_processed,
            total_violations=total_violations,
            false_positives=server.false_positive_count,
            health_score=health_score,
            toxicity_threshold=server.toxicity_threshold,
            nsfw_threshold=server.nsfw_threshold,
            auto_delete=server.auto_delete,
            auto_timeout=server.auto_timeout
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
    """Get recent violations with REAL Discord data - FIXED"""
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
            # Generate channel name from channel_id for display
            channel_name = f"#channel-{violation.channel_id[-2:]}" if violation.channel_id else "#unknown"
            
            violations_data.append({
                "id": violation.id,
                "violation_type": violation.violation_type,
                "confidence_score": violation.confidence_score,
                "action_taken": violation.action_taken,
                "false_positive": violation.false_positive,
                "created_at": violation.created_at,
                # REAL DISCORD DATA
                "username": user.username if user else "Unknown User",
                "user_id": violation.user_id,
                "channel_name": channel_name,
                "message_content": "Content not stored for privacy"
            })
        
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
    settings: dict,
    db: Session = Depends(get_db)
):
    """Update server settings"""
    try:
        server = db.query(Server).filter_by(id=server_id).first()
        
        if not server:
            raise HTTPException(status_code=404, detail="Server not found")
        
        logger.info(f"🏠 Updating server settings for {server_id}")
        logger.info(f"📥 Received settings: {settings}")
        
        # Update settings fields
        if 'welcome_message' in settings:
            server.welcome_message = settings['welcome_message']
        if 'moderation_channels' in settings:
            import json
            server.moderation_channels = json.dumps(settings['moderation_channels'])
        if 'exempt_roles' in settings:
            import json
            server.exempt_roles = json.dumps(settings['exempt_roles'])
        if 'custom_keywords' in settings:
            server.custom_keywords = settings['custom_keywords']
        if 'violation_log_channel' in settings:
            server.violation_log_channel = settings['violation_log_channel']
        if 'escalation_threshold' in settings:
            server.escalation_threshold = int(settings['escalation_threshold'])
        if 'learning_enabled' in settings:
            server.learning_enabled = bool(settings['learning_enabled'])
        if 'privacy_mode' in settings:
            server.privacy_mode = bool(settings['privacy_mode'])
        
        db.commit()
        
        logger.info(f"✅ Server settings updated successfully")
        
        return {"message": "Server settings updated successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating server settings: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/servers/{server_id}/settings")
async def get_server_settings(server_id: str, db: Session = Depends(get_db)):
    """Get server settings with enhanced error handling"""
    try:
        logger.info(f"🏠 Getting server settings for {server_id}")
        
        server = db.query(Server).filter_by(id=server_id).first()
        
        if not server:
            logger.error(f"❌ Server not found: {server_id}")
            raise HTTPException(status_code=404, detail="Server not found")
        
        logger.info(f"📊 Server found: {server.name}")
        
        import json
        
        try:
            # Safely parse JSON fields with error handling
            moderation_channels = []
            if server.moderation_channels:
                try:
                    moderation_channels = json.loads(server.moderation_channels)
                except json.JSONDecodeError as e:
                    logger.warning(f"⚠️ Invalid JSON in moderation_channels: {server.moderation_channels}, error: {e}")
                    moderation_channels = []
            
            exempt_roles = []
            if server.exempt_roles:
                try:
                    exempt_roles = json.loads(server.exempt_roles)
                except json.JSONDecodeError as e:
                    logger.warning(f"⚠️ Invalid JSON in exempt_roles: {server.exempt_roles}, error: {e}")
                    exempt_roles = []
            
            settings = {
                'server_name': server.name or '',
                'welcome_message': server.welcome_message or '',
                'moderation_channels': moderation_channels,
                'exempt_roles': exempt_roles,
                'custom_keywords': server.custom_keywords or '',
                'violation_log_channel': server.violation_log_channel or '',
                'escalation_threshold': server.escalation_threshold if server.escalation_threshold is not None else 3,
                'learning_enabled': server.learning_enabled if server.learning_enabled is not None else True,
                'privacy_mode': server.privacy_mode if server.privacy_mode is not None else True
            }
            
            logger.info(f"✅ Successfully constructed settings: {settings}")
            return settings
            
        except Exception as json_error:
            logger.error(f"❌ Error constructing settings: {json_error}")
            import traceback
            logger.error(f"Full traceback: {traceback.format_exc()}")
            raise HTTPException(status_code=500, detail=f"Error processing server settings: {str(json_error)}")
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Unexpected error in get_server_settings: {e}")
        import traceback
        logger.error(f"Full traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Unexpected server error: {str(e)}")