# backend/app/ml/community_learner.py
from typing import Dict, Any, Optional
import json
from datetime import datetime, timedelta
from app.utils.logger import logger
from app.database.connection import get_db_session
from app.database.models import Server, Violation, ServerAnalytics

class CommunityLearner:
    """Privacy-preserving community learning system"""
    
    def __init__(self):
        self.learning_rate = 0.1
        self.min_samples = 10  # Minimum samples before adjusting thresholds
    
    async def report_false_positive(self, server_id: str, violation_data: Dict[str, Any]):
        """Report a false positive to improve accuracy"""
        try:
            with get_db_session() as session:
                server = session.query(Server).filter_by(id=server_id).first()
                
                if server:
                    # Increment false positive count
                    server.false_positive_count += 1
                    
                    # Adjust thresholds if we have enough data
                    if server.false_positive_count >= self.min_samples:
                        await self._adjust_sensitivity(server, decrease=True)
                    
                    session.commit()
                    logger.info(f"📚 False positive reported for server {server_id}")
                    
        except Exception as e:
            logger.error(f"Error reporting false positive: {e}")
    
    async def report_true_positive(self, server_id: str, violation_data: Dict[str, Any]):
        """Report a confirmed violation to reinforce accuracy"""
        try:
            with get_db_session() as session:
                server = session.query(Server).filter_by(id=server_id).first()
                
                if server:
                    # Increment true positive count
                    server.true_positive_count += 1
                    
                    # Adjust thresholds if needed
                    if server.true_positive_count >= self.min_samples:
                        await self._adjust_sensitivity(server, decrease=False)
                    
                    session.commit()
                    logger.info(f"✅ True positive confirmed for server {server_id}")
                    
        except Exception as e:
            logger.error(f"Error reporting true positive: {e}")
    
    async def _adjust_sensitivity(self, server: Server, decrease: bool):
        """Adjust server sensitivity based on feedback"""
        try:
            # Calculate adjustment factor
            total_feedback = server.false_positive_count + server.true_positive_count
            false_positive_rate = server.false_positive_count / total_feedback if total_feedback > 0 else 0
            
            if decrease and false_positive_rate > 0.3:  # Too many false positives
                # Increase thresholds (less sensitive)
                adjustment = self.learning_rate * false_positive_rate
                server.toxicity_threshold = min(0.9, server.toxicity_threshold + adjustment)
                server.nsfw_threshold = min(0.9, server.nsfw_threshold + adjustment)
                
                logger.info(f"📉 Decreased sensitivity for server {server.id}: {server.toxicity_threshold:.2f}")
                
            elif not decrease and false_positive_rate < 0.1:  # Very accurate, can be more sensitive
                # Decrease thresholds (more sensitive)
                adjustment = self.learning_rate * (0.1 - false_positive_rate)
                server.toxicity_threshold = max(0.3, server.toxicity_threshold - adjustment)
                server.nsfw_threshold = max(0.3, server.nsfw_threshold - adjustment)
                
                logger.info(f"📈 Increased sensitivity for server {server.id}: {server.toxicity_threshold:.2f}")
                
        except Exception as e:
            logger.error(f"Error adjusting sensitivity: {e}")
    
    async def get_server_insights(self, server_id: str) -> Dict[str, Any]:
        """Get community insights for a server"""
        try:
            with get_db_session() as session:
                server = session.query(Server).filter_by(id=server_id).first()
                
                if not server:
                    return {}
                
                # Get recent violations
                week_ago = datetime.utcnow() - timedelta(days=7)
                recent_violations = session.query(Violation).filter(
                    Violation.server_id == server_id,
                    Violation.created_at >= week_ago
                ).all()
                
                # Calculate metrics
                total_violations = len(recent_violations)
                violation_types = {}
                confidence_scores = []
                
                for violation in recent_violations:
                    violation_types[violation.violation_type] = violation_types.get(violation.violation_type, 0) + 1
                    confidence_scores.append(violation.confidence_score)
                
                # Calculate health score
                health_score = self._calculate_health_score(server, total_violations)
                
                # Calculate trends
                toxicity_trend = self._calculate_toxicity_trend(recent_violations)
                
                insights = {
                    'health_score': health_score,
                    'toxicity_trend': toxicity_trend,
                    'total_violations': total_violations,
                    'violation_types': violation_types,
                    'average_confidence': sum(confidence_scores) / len(confidence_scores) if confidence_scores else 0,
                    'false_positive_rate': server.false_positive_count / max(1, server.false_positive_count + server.true_positive_count),
                    'current_thresholds': {
                        'toxicity': server.toxicity_threshold,
                        'nsfw': server.nsfw_threshold
                    }
                }
                
                return insights
                
        except Exception as e:
            logger.error(f"Error getting server insights: {e}")
            return {}
    
    def _calculate_health_score(self, server: Server, recent_violations: int) -> float:
        """Calculate community health score (0.0 to 1.0)"""
        try:
            # Base health score on violation rate and false positive rate
            if server.total_messages_processed == 0:
                return 1.0
            
            violation_rate = recent_violations / max(1, server.total_messages_processed)
            false_positive_rate = server.false_positive_count / max(1, server.false_positive_count + server.true_positive_count)
            
            # Health score decreases with violations but increases with accuracy
            base_health = max(0, 1 - (violation_rate * 10))  # Scale violation impact
            accuracy_bonus = 1 - false_positive_rate  # Reward accuracy
            
            health_score = (base_health * 0.7) + (accuracy_bonus * 0.3)
            return min(1.0, max(0.0, health_score))
            
        except Exception as e:
            logger.error(f"Error calculating health score: {e}")
            return 0.5
    
    def _calculate_toxicity_trend(self, recent_violations: list) -> float:
        """Calculate toxicity trend (-1.0 to 1.0)"""
        try:
            if len(recent_violations) < 2:
                return 0.0
            
            # Split violations into two halves to compare
            mid_point = len(recent_violations) // 2
            early_violations = recent_violations[:mid_point]
            late_violations = recent_violations[mid_point:]
            
            early_avg = sum(v.confidence_score for v in early_violations) / len(early_violations)
            late_avg = sum(v.confidence_score for v in late_violations) / len(late_violations)
            
            # Return trend (-1 = improving, +1 = worsening)
            trend = (late_avg - early_avg) / max(early_avg, 0.1)
            return min(1.0, max(-1.0, trend))
            
        except Exception as e:
            logger.error(f"Error calculating toxicity trend: {e}")
            return 0.0
    
    async def update_daily_analytics(self, server_id: str):
        """Update daily analytics for a server"""
        try:
            with get_db_session() as session:
                server = session.query(Server).filter_by(id=server_id).first()
                
                if not server:
                    return
                
                # Get today's violations
                today = datetime.utcnow().date()
                today_violations = session.query(Violation).filter(
                    Violation.server_id == server_id,
                    Violation.created_at >= datetime.combine(today, datetime.min.time())
                ).all()
                
                # Calculate metrics
                insights = await self.get_server_insights(server_id)
                
                # Check if analytics for today already exist
                existing_analytics = session.query(ServerAnalytics).filter(
                    ServerAnalytics.server_id == server_id,
                    ServerAnalytics.date >= datetime.combine(today, datetime.min.time())
                ).first()
                
                if existing_analytics:
                    # Update existing record
                    existing_analytics.violations_detected = len(today_violations)
                    existing_analytics.community_health_score = insights.get('health_score', 0.5)
                    existing_analytics.toxicity_trend = insights.get('toxicity_trend', 0.0)
                    existing_analytics.false_positives = sum(1 for v in today_violations if v.false_positive)
                else:
                    # Create new analytics record
                    new_analytics = ServerAnalytics(
                        server_id=server_id,
                        date=datetime.utcnow(),
                        messages_processed=0,  # This would be updated by message handler
                        violations_detected=len(today_violations),
                        false_positives=sum(1 for v in today_violations if v.false_positive),
                        actions_taken=len(today_violations),
                        community_health_score=insights.get('health_score', 0.5),
                        toxicity_trend=insights.get('toxicity_trend', 0.0),
                        engagement_score=1.0  # Placeholder - could be calculated from message activity
                    )
                    session.add(new_analytics)
                
                session.commit()
                logger.info(f"📊 Updated daily analytics for server {server_id}")
                
        except Exception as e:
            logger.error(f"Error updating daily analytics: {e}")
    
    async def get_learning_recommendations(self, server_id: str) -> Dict[str, Any]:
        """Get recommendations for improving moderation"""
        try:
            insights = await self.get_server_insights(server_id)
            recommendations = []
            
            # Analyze false positive rate
            fp_rate = insights.get('false_positive_rate', 0)
            if fp_rate > 0.3:
                recommendations.append({
                    'type': 'threshold',
                    'message': 'Consider increasing sensitivity thresholds to reduce false positives',
                    'action': 'increase_threshold',
                    'priority': 'high'
                })
            elif fp_rate < 0.1 and insights.get('total_violations', 0) > 0:
                recommendations.append({
                    'type': 'threshold',
                    'message': 'Your moderation is very accurate - you could increase sensitivity',
                    'action': 'decrease_threshold',
                    'priority': 'medium'
                })
            
            # Analyze violation patterns
            violation_types = insights.get('violation_types', {})
            if violation_types:
                most_common = max(violation_types, key=violation_types.get)
                recommendations.append({
                    'type': 'pattern',
                    'message': f'Most common violation type: {most_common}. Consider targeted education.',
                    'action': 'education',
                    'priority': 'medium'
                })
            
            # Analyze health trends
            health_score = insights.get('health_score', 0.5)
            if health_score < 0.6:
                recommendations.append({
                    'type': 'health',
                    'message': 'Community health score is below average. Consider reviewing moderation settings.',
                    'action': 'review_settings',
                    'priority': 'high'
                })
            
            return {
                'recommendations': recommendations,
                'insights': insights
            }
            
        except Exception as e:
            logger.error(f"Error generating recommendations: {e}")
            return {'recommendations': [], 'insights': {}}

# Global community learner instance
community_learner = CommunityLearner()