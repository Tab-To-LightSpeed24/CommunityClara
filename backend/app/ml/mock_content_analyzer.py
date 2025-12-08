# backend/app/ml/mock_content_analyzer.py
import asyncio
from typing import Dict, Any, Optional
import random
from app.utils.logger import logger

class MockContentAnalyzer:
    """Mock content analyzer for testing and fallback"""
    
    def __init__(self):
        # Keywords for different violation types
        self.toxic_keywords = ['hate', 'kill', 'stupid', 'idiot', 'fuck', 'shit', 'damn', 'asshole', 'bitch']
        self.nsfw_keywords = ['sex', 'nude', 'naked', 'porn', 'sexy', 'hot']
        self.harassment_keywords = ['loser', 'ugly', 'worthless', 'pathetic']
        self.threat_keywords = ['kill you', 'hurt you', 'destroy', 'attack']
        self.self_harm_keywords = ['suicide', 'kill myself', 'end my life', 'want to die']
        
    async def analyze_text(self, text: str) -> Dict[str, Any]:
        """Mock analyze text content"""
        try:
            # Simulate API delay
            await asyncio.sleep(0.1)
            
            text_lower = text.lower()
            
            # Check for different violation types
            has_toxic = any(keyword in text_lower for keyword in self.toxic_keywords)
            has_nsfw = any(keyword in text_lower for keyword in self.nsfw_keywords)
            has_harassment = any(keyword in text_lower for keyword in self.harassment_keywords)
            has_threats = any(keyword in text_lower for keyword in self.threat_keywords)
            has_self_harm = any(keyword in text_lower for keyword in self.self_harm_keywords)
            
            # Determine if flagged
            flagged = has_toxic or has_nsfw or has_harassment or has_threats or has_self_harm
            
            # Create mock scores
            scores = {
                'harassment': 0.8 if has_harassment else random.uniform(0.01, 0.1),
                'harassment/threatening': 0.7 if has_threats else random.uniform(0.01, 0.05),
                'hate': 0.9 if has_toxic else random.uniform(0.01, 0.1),
                'hate/threatening': 0.6 if (has_toxic and has_threats) else random.uniform(0.01, 0.05),
                'self-harm': 0.9 if has_self_harm else random.uniform(0.01, 0.05),
                'self-harm/instructions': random.uniform(0.01, 0.03),
                'self-harm/intent': 0.8 if has_self_harm else random.uniform(0.01, 0.03),
                'sexual': 0.85 if has_nsfw else random.uniform(0.01, 0.1),
                'sexual/minors': random.uniform(0.01, 0.02),
                'violence': 0.75 if has_threats else random.uniform(0.01, 0.1),
                'violence/graphic': random.uniform(0.01, 0.05)
            }
            
            # Create categories (flagged if score > 0.5)
            categories = {k: v > 0.5 for k, v in scores.items()}
            
            analysis = {
                "flagged": flagged,
                "categories": categories,
                "scores": scores,
                "max_score": max(scores.values()),
                "violation_type": self._get_primary_violation(categories, scores),
                "model_info": {
                    "provider": "Mock System",
                    "model": "keyword_based",
                    "fallback": True
                }
            }
            
            logger.info(f"Mock analysis completed: flagged={flagged}, type={analysis['violation_type']}")
            return analysis
            
        except Exception as e:
            logger.error(f"Error in mock analysis: {e}")
            return {
                "flagged": False,
                "error": str(e),
                "categories": {},
                "scores": {},
                "max_score": 0.0,
                "violation_type": None
            }
    
    def _get_primary_violation(self, categories: dict, scores: dict) -> Optional[str]:
        """Determine primary violation type"""
        if not any(categories.values()):
            return None
        
        # Find highest scoring flagged category
        flagged_scores = {k: v for k, v in scores.items() if categories.get(k, False)}
        
        if not flagged_scores:
            return None
        
        primary = max(flagged_scores, key=flagged_scores.get)
        
        # Map to simplified types
        if 'sexual' in primary:
            return 'nsfw'
        elif 'harassment' in primary or 'hate' in primary:
            return 'toxicity'
        elif 'violence' in primary:
            return 'threats'
        elif 'self-harm' in primary:
            return 'self_harm'
        else:
            return primary.replace('/', '_')
    
    async def quick_local_scan(self, text: str) -> float:
        """Mock quick local scan"""
        text_lower = text.lower()
        all_keywords = (self.toxic_keywords + self.nsfw_keywords + 
                       self.harassment_keywords + self.threat_keywords + 
                       self.self_harm_keywords)
        
        keyword_matches = sum(1 for keyword in all_keywords if keyword in text_lower)
        risk_score = min(keyword_matches * 0.3, 1.0)
        
        return risk_score

# Global mock analyzer instance
mock_content_analyzer = MockContentAnalyzer()