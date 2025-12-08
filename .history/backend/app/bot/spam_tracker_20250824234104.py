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
            timestamp = datetime.utcnow()
        
        # Add to user's message history
        messages = self.user_messages[user_id]
        messages.append((timestamp, len(content)))
        
        # Track content repetition
        content_lower = content.lower().strip()
        if len(content_lower) > 2:  # Only track meaningful content
            self.user_content[user_id][content_lower] += 1
        
        # Analyze for spam patterns
        return self._analyze_spam_patterns(user_id, content, timestamp)
    
    def _analyze_spam_patterns(self, user_id: str, content: str, timestamp: datetime) -> Dict[str, any]:
        """Analyze message patterns for spam detection"""
        messages = self.user_messages[user_id]
        content_tracker = self.user_content[user_id]
        
        spam_score = 0
        spam_reasons = []
        
        # 1. RAPID FIRE DETECTION (5+ messages in 10 seconds)
        ten_seconds_ago = timestamp - timedelta(seconds=10)
        recent_messages = [msg for msg in messages if msg[0] >= ten_seconds_ago]
        
        if len(recent_messages) >= 5:
            spam_score += 40
            spam_reasons.append(f"rapid fire: {len(recent_messages)} messages in 10s")
        
        # 2. CONTENT REPETITION (same message 3+ times)
        content_lower = content.lower().strip()
        repeat_count = content_tracker.get(content_lower, 0)
        
        if repeat_count >= 3:
            spam_score += 60
            spam_reasons.append(f"repeated content: '{content[:30]}...' x{repeat_count}")
        elif repeat_count >= 2:
            spam_score += 25
            spam_reasons.append(f"duplicate content: '{content[:30]}...' x{repeat_count}")
        
        # 3. VERY SHORT SPAM (1-2 character messages sent rapidly)
        thirty_seconds_ago = timestamp - timedelta(seconds=30)
        very_recent = [msg for msg in messages if msg[0] >= thirty_seconds_ago]
        
        if len(very_recent) >= 3:
            short_messages = [msg for msg in very_recent if msg[1] <= 2]
            if len(short_messages) >= 3:
                spam_score += 35
                spam_reasons.append(f"short spam: {len(short_messages)} messages ≤2 chars")
        
        # 4. HIGH MESSAGE FREQUENCY ANALYSIS
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