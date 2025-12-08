# backend/app/ml/huggingface_analyzer.py
import asyncio
import os
import concurrent.futures
from typing import Dict, Any, Optional
from app.utils.logger import logger
from app.utils.config import config

try:
    from transformers import pipeline
    import torch
    TRANSFORMERS_AVAILABLE = True
    logger.info("🤗 Transformers library available")
except ImportError:
    TRANSFORMERS_AVAILABLE = False
    logger.warning("⚠️ Transformers not installed. Install with: pip install transformers torch")

class HuggingFaceAnalyzer:
    """Free content analyzer using Hugging Face models - Fixed version"""
    
    def __init__(self):
        self.toxicity_classifier = None
        self.initialized = False
        self.executor = concurrent.futures.ThreadPoolExecutor(max_workers=2)
        
        if TRANSFORMERS_AVAILABLE:
            # Don't initialize here - will be initialized when first used
            logger.info("🤗 Hugging Face analyzer ready for initialization")
        else:
            logger.error("❌ Transformers not available. Using fallback analysis.")
    
    async def _run_in_thread(self, func, *args, **kwargs):
        """Python 3.8 compatible version of asyncio.to_thread"""
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(self.executor, func, *args, **kwargs)
    
    async def _initialize_models(self):
        """Initialize Hugging Face models asynchronously"""
        try:
            logger.info("🔄 Loading Hugging Face toxicity model...")
            
            # Load toxicity classifier in thread to avoid blocking
            def load_model():
                return pipeline(
                    "text-classification",
                    model="unitary/toxic-bert",
                    device=-1,  # Use CPU
                    top_k=None  # Fixed: use top_k instead of return_all_scores
                )
            
            self.toxicity_classifier = await self._run_in_thread(load_model)
            
            self.initialized = True
            logger.info("✅ Hugging Face models loaded successfully")
            
        except Exception as e:
            logger.error(f"❌ Error loading Hugging Face models: {e}")
            logger.info("🔄 Falling back to keyword-based analysis")
            self.initialized = False
    
    async def analyze_text(self, text: str) -> Dict[str, Any]:
        """Analyze text using Hugging Face models with keyword adjustments"""
        try:
            # Initialize models on first use if needed
            if not self.initialized and TRANSFORMERS_AVAILABLE:
                await self._initialize_models()
            
            # Wait a bit more if still initializing
            max_wait = 5
            waited = 0
            while not self.initialized and TRANSFORMERS_AVAILABLE and waited < max_wait:
                await asyncio.sleep(0.5)
                waited += 0.5
            
            if not self.initialized or not TRANSFORMERS_AVAILABLE:
                logger.warning("🔄 Using fallback analysis (models not ready)")
                return self._fallback_analysis(text)
            
            # Truncate text if too long (BERT has 512 token limit)
            if len(text) > 400:
                text = text[:400] + "..."
            
            # Run toxicity analysis in thread to avoid blocking
            def run_classifier():
                try:
                    result = self.toxicity_classifier(text)
                    return result
                except Exception as e:
                    logger.error(f"Error in classifier: {e}")
                    return None
            
            toxicity_results = await self._run_in_thread(run_classifier)
            
            if not toxicity_results:
                logger.warning("🔄 Classifier failed, using fallback")
                return self._fallback_analysis(text)
            
            # Process results - format: [[{'label': 'toxic', 'score': 0.989}, ...]]
            scores_dict = {}
            
            try:
                # Extract the nested list
                if isinstance(toxicity_results, list) and len(toxicity_results) > 0:
                    results_list = toxicity_results[0]  # Get the inner list
                    
                    # Convert to dictionary for easy access
                    for item in results_list:
                        if isinstance(item, dict) and 'label' in item and 'score' in item:
                            scores_dict[item['label']] = item['score']
                
                # Extract specific scores
                toxic_score = scores_dict.get('toxic', 0.0)
                insult_score = scores_dict.get('insult', 0.0)
                obscene_score = scores_dict.get('obscene', 0.0)
                severe_toxic_score = scores_dict.get('severe_toxic', 0.0)
                identity_hate_score = scores_dict.get('identity_hate', 0.0)
                threat_score = scores_dict.get('threat', 0.0)
                
                # Determine overall toxicity
                is_toxic = toxic_score > 0.5
                is_severe = severe_toxic_score > 0.3
                is_threatening = threat_score > 0.3
                is_hateful = identity_hate_score > 0.3
                is_insulting = insult_score > 0.7
                is_obscene = obscene_score > 0.5
                
            except Exception as e:
                logger.error(f"Error processing HF results: {e}")
                return self._fallback_analysis(text)
            
            # Enhanced keyword detection for specific categories
            nsfw_detected = self._check_nsfw_keywords(text)
            harassment_detected = self._check_harassment_keywords(text) or is_insulting
            threat_detected = self._check_threat_keywords(text) or is_threatening
            
            # Create OpenAI-compatible response using HF scores
            categories = {
                'harassment': harassment_detected or is_insulting or (is_toxic and toxic_score > 0.6),
                'harassment/threatening': threat_detected or is_threatening,
                'hate': is_hateful or (is_severe and toxic_score > 0.7),
                'hate/threatening': (is_hateful or is_severe) and (threat_detected or is_threatening),
                'self-harm': self._check_self_harm_keywords(text),
                'self-harm/instructions': False,
                'self-harm/intent': self._check_self_harm_keywords(text),
                'sexual': nsfw_detected or is_obscene,
                'sexual/minors': False,
                'violence': threat_detected or is_threatening or (threat_score > 0.5),
                'violence/graphic': False
            }
            
            # Create scores using HF model outputs
            scores = {
                'harassment': max(insult_score, toxic_score * 0.8) if harassment_detected else max(insult_score, 0.1),
                'harassment/threatening': max(threat_score, toxic_score * 0.9) if threat_detected else threat_score,
                'hate': max(identity_hate_score, severe_toxic_score, toxic_score * 0.7),
                'hate/threatening': min((identity_hate_score + threat_score) / 2, 1.0) if (is_hateful and is_threatening) else max(identity_hate_score * 0.5, threat_score * 0.3),
                'self-harm': 0.8 if categories['self-harm'] else 0.05,
                'self-harm/instructions': 0.02,
                'self-harm/intent': 0.8 if categories['self-harm/intent'] else 0.02,
                'sexual': 0.85 if nsfw_detected else max(obscene_score * 0.8, 0.1),
                'sexual/minors': 0.02,
                'violence': max(threat_score, toxic_score * 0.6) if threat_detected else threat_score,
                'violence/graphic': 0.05
            }
            
            # Ensure scores don't exceed 1.0
            scores = {k: min(v, 1.0) for k, v in scores.items()}
            
            # Store original max score for debugging
            original_max_score = max(scores.values())
            
            # ✨ APPLY KEYWORD ADJUSTMENTS - NEW FEATURE
            adjusted_scores = self._apply_keyword_adjustments(scores, text)
            
            flagged = any(v > 0.5 for v in adjusted_scores.values())
            
            analysis = {
                "flagged": flagged,
                "categories": {k: v > 0.5 for k, v in adjusted_scores.items()},
                "scores": adjusted_scores,
                "max_score": max(adjusted_scores.values()),
                "violation_type": self._get_primary_violation({k: v > 0.5 for k, v in adjusted_scores.items()}, adjusted_scores),
                "model_info": {
                    "provider": "Hugging Face",
                    "model": "unitary/toxic-bert",
                    "toxic_score": toxic_score,
                    "insult_score": insult_score,
                    "threat_score": threat_score,
                    "identity_hate_score": identity_hate_score,
                    "obscene_score": obscene_score,
                    "severe_toxic_score": severe_toxic_score,
                    "text_length": len(text),
                    "version": "multi_category_with_adjustments",
                    "original_max_score": original_max_score,
                    "adjustment_applied": original_max_score != max(adjusted_scores.values())
                }
            }
            
            # Enhanced logging with adjustment info
            if original_max_score != max(adjusted_scores.values()):
                logger.info(f"🤗 HF analysis: flagged={flagged}, original={original_max_score:.3f}, adjusted={max(adjusted_scores.values()):.3f}, type={analysis['violation_type']}")
            else:
                logger.info(f"🤗 HF analysis: flagged={flagged}, score={max(adjusted_scores.values()):.3f}, type={analysis['violation_type']}")
            
            return analysis
            
        except Exception as e:
            logger.error(f"❌ Error in Hugging Face analysis: {e}")
            import traceback
            logger.error(f"Full traceback: {traceback.format_exc()}")
            return self._fallback_analysis(text)
    
    def _check_nsfw_keywords(self, text: str) -> bool:
        """Enhanced NSFW keyword detection"""
        nsfw_keywords = [
            'sex', 'porn', 'nude', 'naked', 'sexy', 'hot', 'adult',
            'xxx', 'nsfw', 'explicit', 'erotic', 'sexual', 'dick',
            'pussy', 'cock', 'boobs', 'tits', 'ass', 'horny'
        ]
        text_lower = text.lower()
        return any(keyword in text_lower for keyword in nsfw_keywords)
    
    def _check_harassment_keywords(self, text: str) -> bool:
        """Enhanced harassment detection"""
        harassment_keywords = [
            'stupid', 'idiot', 'moron', 'dumb', 'loser', 'pathetic',
            'worthless', 'ugly', 'fat', 'disgusting', 'retard',
            'bitch', 'slut', 'whore', 'asshole'
        ]
        text_lower = text.lower()
        return any(keyword in text_lower for keyword in harassment_keywords)
    
    def _check_threat_keywords(self, text: str) -> bool:
        """Enhanced threat detection"""
        threat_keywords = [
            'kill you', 'murder you', 'hurt you', 'destroy you',
            'beat you up', 'attack you', 'violence', 'kill',
            'death', 'shoot', 'stab', 'punch', 'fight'
        ]
        text_lower = text.lower()
        return any(keyword in text_lower for keyword in threat_keywords)
    
    def _check_self_harm_keywords(self, text: str) -> bool:
        """Self-harm detection"""
        self_harm_keywords = [
            'suicide', 'kill myself', 'end my life', 'self harm',
            'cut myself', 'want to die', 'hanging myself'
        ]
        text_lower = text.lower()
        return any(keyword in text_lower for keyword in self_harm_keywords)
    
    def _get_primary_violation(self, categories: dict, scores: dict) -> Optional[str]:
        """Determine primary violation type with better logic"""
        if not any(categories.values()):
            return None
        
        # Find category with highest score that's flagged
        flagged_scores = {k: v for k, v in scores.items() if categories.get(k, False)}
        
        if not flagged_scores:
            return None
        
        primary = max(flagged_scores, key=flagged_scores.get)
        max_score = flagged_scores[primary]
        
        # Special handling for sexual content
        if 'sexual' in primary and max_score > 0.7:
            return 'nsfw'
        # Harassment and hate speech  
        elif ('harassment' in primary or 'hate' in primary) and max_score > 0.6:
            return 'toxicity'
        # Violence and threats
        elif 'violence' in primary and max_score > 0.5:
            return 'threats'
        # Self-harm
        elif 'self-harm' in primary:
            return 'self_harm'
        else:
            return primary.replace('/', '_')
    
    def _fallback_analysis(self, text: str) -> Dict[str, Any]:
        """Fallback keyword-based analysis with adjustments"""
        logger.info("🔄 Using fallback keyword analysis with adjustments")
        
        text_lower = text.lower()
        
        # Enhanced keyword detection
        has_toxic = self._check_harassment_keywords(text) or any(word in text_lower for word in ['hate', 'fuck', 'shit', 'damn'])
        has_nsfw = self._check_nsfw_keywords(text)
        has_threats = self._check_threat_keywords(text)
        has_self_harm = self._check_self_harm_keywords(text)
        
        flagged = has_toxic or has_nsfw or has_threats or has_self_harm
        
        categories = {
            'harassment': has_toxic,
            'harassment/threatening': has_threats,
            'hate': has_toxic,
            'hate/threatening': has_threats and has_toxic,
            'self-harm': has_self_harm,
            'self-harm/instructions': False,
            'self-harm/intent': has_self_harm,
            'sexual': has_nsfw,
            'sexual/minors': False,
            'violence': has_threats,
            'violence/graphic': False
        }
        
        scores = {
            'harassment': 0.8 if has_toxic else 0.1,
            'harassment/threatening': 0.9 if has_threats else 0.1,
            'hate': 0.85 if has_toxic else 0.1,
            'hate/threatening': 0.9 if (has_threats and has_toxic) else 0.1,
            'self-harm': 0.9 if has_self_harm else 0.05,
            'self-harm/instructions': 0.05,
            'self-harm/intent': 0.8 if has_self_harm else 0.05,
            'sexual': 0.85 if has_nsfw else 0.1,
            'sexual/minors': 0.02,
            'violence': 0.85 if has_threats else 0.1,
            'violence/graphic': 0.05
        }
        
        # Apply keyword adjustments to fallback scores too
        original_max = max(scores.values()) if flagged else 0.1
        adjusted_scores = self._apply_keyword_adjustments(scores, text)
        
        return {
            "flagged": any(v > 0.5 for v in adjusted_scores.values()),
            "categories": {k: v > 0.5 for k, v in adjusted_scores.items()},
            "scores": adjusted_scores,
            "max_score": max(adjusted_scores.values()),
            "violation_type": self._get_primary_violation({k: v > 0.5 for k, v in adjusted_scores.items()}, adjusted_scores),
            "model_info": {
                "provider": "Fallback Keywords with Adjustments",
                "model": "keyword_based_adjusted",
                "fallback": True,
                "original_max_score": original_max,
                "adjustment_applied": True
            }
        }
    
    async def quick_local_scan(self, text: str) -> float:
        """Quick local pre-filtering to reduce processing load"""
        if not text or len(text.strip()) < 3:
            return 0.0
            
        text_lower = text.lower()
        
        # Combined keyword list for quick scanning
        risk_keywords = [
            'hate', 'kill', 'sex', 'nude', 'fuck', 'shit', 'porn',
            'stupid', 'idiot', 'bitch', 'asshole', 'die', 'murder'
        ]
        
        keyword_matches = sum(1 for keyword in risk_keywords if keyword in text_lower)
        risk_score = min(keyword_matches * 0.25, 1.0)
        
        return risk_score
    
    def _apply_keyword_adjustments(self, scores: dict, text: str) -> dict:
        """Apply custom keyword confidence adjustments with context detection"""
        
        # Define keyword confidence reductions (0.0 = no reduction, 0.9 = 90% reduction)
        keyword_adjustments = {
            'idiot': 0.6,      # Reduce by 60% - "you idiot" becomes ~38%
            'stupid': 0.4,     # Reduce by 40%
            'dumb': 0.5,       # Reduce by 50%
            'annoying': 0.2,   # Reduce by 20%
            'moron': 0.5,      # Reduce by 50%
            'fool': 0.6,       # Reduce by 60%
            'lame': 0.3,       # Reduce by 80%
            'weird': 0.2,      # Reduce by 90%
        }
        
        # Context indicators that reduce toxicity further
        casual_context = [
            'lol', 'haha', 'jk', 'just kidding', '😂', '🤣', 
            'bro', 'dude', 'mate', 'friend', 'buddy'
        ]
        
        text_lower = text.lower()
        adjustment_factor = 1.0
        applied_adjustments = []
        
        # Apply keyword adjustments
        for keyword, reduction in keyword_adjustments.items():
            if keyword in text_lower:
                adjustment_factor = min(adjustment_factor, 1.0 - reduction)
                applied_adjustments.append(f"{keyword}(-{int(reduction*100)}%)")
        
        # Apply additional reduction for casual context
        casual_reduction = 0.0
        for indicator in casual_context:
            if indicator in text_lower:
                casual_reduction = max(casual_reduction, 0.3)  # Additional 30% reduction
                break
        
        if casual_reduction > 0:
            adjustment_factor *= (1.0 - casual_reduction)
            applied_adjustments.append(f"casual_context(-{int(casual_reduction*100)}%)")
        
        # Don't reduce confidence for clearly severe content
        severe_indicators = ['fucking', 'kill', 'hate', 'nazi', 'rape']
        has_severe = any(indicator in text_lower for indicator in severe_indicators)
        
        if has_severe:
            adjustment_factor = max(adjustment_factor, 0.8)  # Keep at least 80% confidence
            applied_adjustments.append("severe_content_protection")
        
        # Apply adjustment to all scores
        adjusted_scores = {}
        for category, score in scores.items():
            adjusted_scores[category] = score * adjustment_factor
        
        # Log adjustments for debugging
        if applied_adjustments:
            logger.info(f"🔧 Applied adjustments: {', '.join(applied_adjustments)} → factor={adjustment_factor:.2f}")
        
        return adjusted_scores
    

    def __del__(self):
        """Cleanup thread executor"""
        try:
            self.executor.shutdown(wait=False)
        except:
            pass

# Global analyzer instance
huggingface_analyzer = HuggingFaceAnalyzer()