# backend/app/services/adaptive_learning.py
from datetime import datetime, timedelta
from app.database.connection import get_db_session
from app.database.models import Server, Violation
from app.utils.logger import logger

class AdaptiveLearningService:
    """
    Service to adjust moderation thresholds based on community feedback.
    Implements the 'Culture Adaptation' feature.
    """
    
    def __init__(self):
        self.TARGET_FP_RATE = 0.10  # Target max 10% false positive rate
        self.ADJUSTMENT_STEP = 0.05 # How much to change threshold by
        self.MIN_THRESHOLD = 0.40   # Never go below this (too sensitive)
        self.MAX_THRESHOLD = 0.95   # Never go above this (basically off)
        self.MIN_FEEDBACK_ITEMS = 5 # Minimum feedback items needed to adjust

    async def process_server_learning(self, server_id: str):
        """Analyze feedback and adjust thresholds for a specific server"""
        try:
            with get_db_session() as session:
                server = session.query(Server).filter_by(id=server_id).first()
                if not server or not server.learning_enabled:
                    return
                
                # Get recent violations with feedback (last 30 days)
                thirty_days_ago = datetime.utcnow() - timedelta(days=30)
                
                feedback_stats = session.query(Violation).filter(
                    Violation.server_id == server_id,
                    Violation.false_positive.isnot(None), # Only where feedback exists
                    Violation.created_at >= thirty_days_ago
                ).all()
                
                total_feedback = len(feedback_stats)
                if total_feedback < self.MIN_FEEDBACK_ITEMS:
                    logger.info(f"🧠 Not enough data to map culture for server {server.name} ({total_feedback}/{self.MIN_FEEDBACK_ITEMS})")
                    return

                # Calculate False Positive Rate
                false_positives = sum(1 for v in feedback_stats if v.false_positive)
                fp_rate = false_positives / total_feedback
                
                current_threshold = server.toxicity_threshold
                new_threshold = current_threshold
                
                # Logic: Adjust based on FP rate
                if fp_rate > self.TARGET_FP_RATE:
                    # Too many false alarms -> Increase threshold (be less sensitive)
                    new_threshold = min(current_threshold + self.ADJUSTMENT_STEP, self.MAX_THRESHOLD)
                    logger.info(f"🧠 Culture Shift: Too many false positives ({fp_rate:.1%}). Raising threshold for {server.name}: {current_threshold:.2f} -> {new_threshold:.2f}")
                
                elif fp_rate < (self.TARGET_FP_RATE / 2) and total_feedback > 20:
                    # Very few false alarms & lots of data -> Decrease threshold (catch more)
                    # Only do this if we have significant data (>20 items)
                    new_threshold = max(current_threshold - self.ADJUSTMENT_STEP, self.MIN_THRESHOLD)
                    logger.info(f"🧠 Culture Shift: High accuracy ({fp_rate:.1%}). Tightening threshold for {server.name}: {current_threshold:.2f} -> {new_threshold:.2f}")
                
                # Apply change if needed
                if new_threshold != current_threshold:
                    server.toxicity_threshold = new_threshold
                    session.commit()
                    logger.info(f"✅ Adapted culture settings for {server.name}")
                    
        except Exception as e:
            logger.error(f"Error in Server Learning: {e}")

learning_service = AdaptiveLearningService()
