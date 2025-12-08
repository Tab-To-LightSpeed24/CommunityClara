# backend/app/bot/spam_tracker.py
from collections import defaultdict, deque
from datetime import datetime, timedelta
from typing import Dict, List, Tuple
import asyncio

class SpamTracker:
    """Track message frequency and patterns for spam detection"""
    
    def __init__(self):
        # User message history: user_id -> deque of (timestamp, message_length)
        self.user_messages: Dict[str, deque] = defaultdict(lambda: deque(maxlen=20))
        # User repeated content: user_id -> {content: count}
        self.user_content: Dict[str, Dict[str, int]] = defaultdict(lambda: defaultdict(int))
        # Cleanup task
        self._cleanup_task = None
        
    async def start_cleanup(self):
        """Start background cleanup of old data"""
        if self._cleanup_task is None:
            self._cleanup_task = asyncio.create_task(self._periodic_cleanup())
    
    async def _periodic_cleanup(self):
        """Clean up old message data every 5 minutes"""
        while True:
            try:
                await asyncio.sleep(300)  # 5 minutes
                cutoff_time = datetime.now() - timedelta(minutes=10)
                
                # Clean old messages
                for user_id, messages in self.user_messages.items():
                    # Remove messages older than 10 minutes
                    while messages and messages[0][0] < cutoff_time:
                        messages.popleft()
                
                # Clean empty content trackers
                empty_users = [uid for uid, content in self.user_content.items() if not content]
                for uid in empty_users:
                    del self.user_content[uid]
                    
            except Exception as e:
                print(f"Cleanup error: {e}")
    
    def add_message(self, user_id: str, content: str, timestamp: datetime = None) -> Dict[str, any]:
        """Add message and return spam analysis"""
        if timestamp is None:
            timestamp = datetime.now()
            
        user_id = str(user_id)
        message_length = len(content.strip())
        
        # Add to message history
        self.user_messages[user_id].append((timestamp, message_length))
        
        # Track content repetition
        content_key = content.lower().strip()[:50]  # First 50 chars
        self.user_content[user_id][content_key] += 1
        
        # Analyze spam patterns
        return self._analyze_spam_patterns(user_id, content, timestamp)
    
    def _analyze_spam_patterns(self, user_id: str, content: str, timestamp: datetime) -> Dict[str, any]:
        """Analyze user's recent messages for spam patterns"""
        messages = self.user_messages[user_id]
        content_counts = self.user_content[user_id]
        
        spam_score = 0
        spam_reasons = []
        
        if len(messages) < 2:
            return {"spam_score": 0, "reasons": [], "is_spam": False}
        
        # 1. RAPID FIRE DETECTION (multiple messages in short time)
        recent_messages = [msg for msg in messages if timestamp - msg[0] <= timedelta(seconds=10)]
        if len(recent_messages) >= 5:  # 5+ messages in 10 seconds
            spam_score += 60
            spam_reasons.append(f"rapid fire: {len(recent_messages)} messages in 10s")
        elif len(recent_messages) >= 3:  # 3+ messages in 10 seconds
            spam_score += 35
            spam_reasons.append(f"fast messaging: {len(recent_messages)} messages in 10s")
        
        # 2. SHORT MESSAGE SPAM (many very short messages)
        very_recent = [msg for msg in messages if timestamp - msg[0] <= timedelta(seconds=30)]
        short_messages = [msg for msg in very_recent if msg[1] <= 3]  # 3 chars or less
        if len(short_messages) >= 4:
            spam_score += 45
            spam_reasons.append(f"short message spam: {len(short_messages)} short messages")
        
        # 3. CONTENT REPETITION
        content_key = content.lower().strip()[:50]
        repeat_count = content_counts[content_key]
        if repeat_count >= 4:  # Same content 4+ times
            spam_score += 70
            spam_reasons.append(f"content repetition: '{content_key[:20]}...' repeated {repeat_count}x")
        elif repeat_count >= 2:
            spam_score += 25
            spam_reasons.append(f"repeated content: '{content_key[:20]}...' x{repeat_count}")
        
        # 4. MESSAGE FREQUENCY ANALYSIS
        minute_ago = timestamp - timedelta(minutes=1)
        recent_minute = [msg for msg in messages if msg[0] >= minute_ago]
        if len(recent_minute) >= 8:  # 8+ messages per minute
            spam_score += 50
            spam_reasons.append(f"high frequency: {len(recent_minute)} messages/minute")
        
        # 5. CONSISTENT SHORT MESSAGES (all recent messages are very short)
        if len(very_recent) >= 3:
            avg_length = sum(msg[1] for msg in very_recent) / len(very_recent)
            if avg_length <= 2:  # Average 2 chars or less
                spam_score += 30
                spam_reasons.append(f"consistent short messages: avg {avg_length:.1f} chars")
        
        is_spam = spam_score >= 50
        
        return {
            "spam_score": spam_score,
            "reasons": spam_reasons,
            "is_spam": is_spam,
            "message_count_10s": len(recent_messages),
            "repeat_count": repeat_count,
            "recent_messages": len(very_recent)
        }

# Global spam tracker instance
spam_tracker = SpamTracker()