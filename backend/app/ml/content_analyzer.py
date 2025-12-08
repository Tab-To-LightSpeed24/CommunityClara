# backend/app/ml/content_analyzer.py
"""
Content analyzer with support for multiple backends
"""
from app.utils.config import config
from app.utils.logger import logger

def get_content_analyzer():
    """Get the appropriate content analyzer based on configuration"""
    
    analyzer_type = config.CONTENT_ANALYZER.lower()
    logger.info(f"🔧 Initializing content analyzer: {analyzer_type}")
    
    if analyzer_type == "huggingface" or analyzer_type == "hf":
        try:
            from app.ml.huggingface_analyzer import huggingface_analyzer
            logger.info("🤗 Using Hugging Face Transformers for content analysis")
            return huggingface_analyzer
        except ImportError as e:
            logger.error(f"❌ Failed to import Hugging Face analyzer: {e}")
            logger.info("🔄 Falling back to mock analyzer")
            from app.ml.mock_content_analyzer import mock_content_analyzer
            return mock_content_analyzer
        except Exception as e:
            logger.error(f"❌ Error initializing Hugging Face analyzer: {e}")
            logger.info("🔄 Falling back to mock analyzer")
            from app.ml.mock_content_analyzer import mock_content_analyzer
            return mock_content_analyzer

    elif analyzer_type == "openai":
        try:
            from openai import OpenAI
            
            class OpenAIAnalyzer:
                def __init__(self):
                    self.client = OpenAI(api_key=config.OPENAI_API_KEY) if config.OPENAI_API_KEY else None
                
                async def analyze_text(self, text: str):
                    if not self.client:
                        logger.error("OpenAI client not configured")
                        from app.ml.mock_content_analyzer import mock_content_analyzer
                        return await mock_content_analyzer.analyze_text(text)
                    
                    try:
                        import asyncio
                        response = await asyncio.to_thread(
                            self.client.moderations.create,
                            input=text
                        )
                        
                        result = response.results[0]
                        
                        categories_dict = {
                            'harassment': result.categories.harassment,
                            'harassment/threatening': result.categories.harassment_threatening,
                            'hate': result.categories.hate,
                            'hate/threatening': result.categories.hate_threatening,
                            'self-harm': result.categories.self_harm,
                            'self-harm/instructions': result.categories.self_harm_instructions,
                            'self-harm/intent': result.categories.self_harm_intent,
                            'sexual': result.categories.sexual,
                            'sexual/minors': result.categories.sexual_minors,
                            'violence': result.categories.violence,
                            'violence/graphic': result.categories.violence_graphic
                        }
                        
                        scores_dict = {
                            'harassment': result.category_scores.harassment,
                            'harassment/threatening': result.category_scores.harassment_threatening,
                            'hate': result.category_scores.hate,
                            'hate/threatening': result.category_scores.hate_threatening,
                            'self-harm': result.category_scores.self_harm,
                            'self-harm/instructions': result.category_scores.self_harm_instructions,
                            'self-harm/intent': result.category_scores.self_harm_intent,
                            'sexual': result.category_scores.sexual,
                            'sexual/minors': result.category_scores.sexual_minors,
                            'violence': result.category_scores.violence,
                            'violence/graphic': result.category_scores.violence_graphic
                        }
                        
                        return {
                            "flagged": result.flagged,
                            "categories": categories_dict,
                            "scores": scores_dict,
                            "max_score": max(scores_dict.values()),
                            "violation_type": self._get_primary_violation(categories_dict, scores_dict),
                            "model_info": {"provider": "OpenAI", "model": "text-moderation-latest"}
                        }
                        
                    except Exception as e:
                        logger.error(f"OpenAI API error: {e}")
                        from app.ml.mock_content_analyzer import mock_content_analyzer
                        return await mock_content_analyzer.analyze_text(text)
                
                def _get_primary_violation(self, categories: dict, scores: dict):
                    if not any(categories.values()):
                        return None
                    
                    flagged_scores = {k: v for k, v in scores.items() if categories.get(k, False)}
                    
                    if not flagged_scores:
                        return None
                    
                    primary_violation = max(flagged_scores, key=flagged_scores.get)
                    
                    if 'sexual' in primary_violation:
                        return 'nsfw'
                    elif 'harassment' in primary_violation or 'hate' in primary_violation:
                        return 'toxicity'
                    elif 'violence' in primary_violation:
                        return 'threats'
                    elif 'self-harm' in primary_violation:
                        return 'self_harm'
                    else:
                        return primary_violation.replace('/', '_')
                
                async def quick_local_scan(self, text: str) -> float:
                    """Quick local pre-filtering to reduce processing load - ENHANCED"""
                    if not text or len(text.strip()) < 3:
                        return 0.0
                        
                    text_lower = text.lower()
                    
                    # ENHANCED keyword list for quick scanning
                    risk_keywords = [
                        # Sexual violence
                        'rape', 'raping', 'rapist', 'molest', 'assault',
                        # Violence/threats  
                        'kill', 'murder', 'die', 'death', 'shoot', 'stab',
                        # Hate speech
                        'nazi', 'hitler', 'jew', 'nigger', 'faggot', 'retard',
                        # General toxicity
                        'hate', 'fuck', 'shit', 'bitch', 'asshole', 'cunt',
                        # NSFW
                        'sex', 'nude', 'naked', 'porn', 'dick', 'pussy', 'cock',
                        # Harassment
                        'stupid', 'idiot', 'moron', 'loser', 'worthless'
                    ]
                    
                    keyword_matches = sum(1 for keyword in risk_keywords if keyword in text_lower)
                    risk_score = min(keyword_matches * 0.4, 1.0)  # Increased multiplier
                    
                    logger.info(f"⚡ Quick scan: '{text[:30]}...' → {keyword_matches} matches → {risk_score:.3f} risk")
                    
                    return risk_score

            
            logger.info("🔗 Using OpenAI API for content analysis")
            return OpenAIAnalyzer()
            
        except ImportError as e:
            logger.error(f"❌ OpenAI not available: {e}")
            logger.info("🔄 Falling back to mock analyzer")
            from app.ml.mock_content_analyzer import mock_content_analyzer
            return mock_content_analyzer

    else:
        # Default to mock for any other configuration
        logger.info("🧪 Using Mock analyzer for content analysis")
        from app.ml.mock_content_analyzer import mock_content_analyzer
        return mock_content_analyzer

# Initialize the content analyzer
try:
    content_analyzer = get_content_analyzer()
    logger.info("✅ Content analyzer initialized successfully")
except Exception as e:
    logger.error(f"❌ Critical error initializing content analyzer: {e}")
    logger.info("🆘 Using emergency fallback analyzer")
    
    # Emergency fallback
    class EmergencyAnalyzer:
        async def analyze_text(self, text: str):
            return {
                "flagged": False,
                "categories": {},
                "scores": {},
                "max_score": 0.0,
                "violation_type": None,
                "error": "Analyzer initialization failed",
                "model_info": {"provider": "Emergency Fallback"}
            }
        
        async def quick_local_scan(self, text: str) -> float:
            return 0.0
    
    content_analyzer = EmergencyAnalyzer()

# Export the analyzer
__all__ = ['content_analyzer']