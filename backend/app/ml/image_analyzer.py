from PIL import Image
from transformers import pipeline
import requests
import io
import torch
from app.utils.logger import logger

class ImageAnalyzer:
    """
    Local image analysis using Hugging Face Transformers.
    Uses 'Falconsai/nsfw_image_detection' (efficient 20MB model).
    """
    
    def __init__(self):
        self.pipeline = None
        self._initialize_model()

    def _initialize_model(self):
        try:
            logger.info("🖼️ Loading local NSFW image detection model...")
            # Use a smaller, faster model optimized for CPU
            self.pipeline = pipeline(
                "image-classification", 
                model="Falconsai/nsfw_image_detection",
                device=-1 # CPU
            )
            logger.info("✅ NSFW Image model loaded successfully")
        except Exception as e:
            logger.error(f"❌ Failed to load image model: {e}")

    async def analyze_image(self, url: str) -> dict:
        """Download and analyze an image from a URL"""
        if not self.pipeline:
            return None

        try:
            # Download image
            response = requests.get(url, timeout=5)
            if response.status_code != 200:
                return None
            
            image = Image.open(io.BytesIO(response.content)).convert("RGB")
            
            # Run inference
            results = self.pipeline(image)
            # Result format: [{'label': 'nsfw', 'score': 0.98}, {'label': 'normal', 'score': 0.02}]
            
            nsfw_score = 0.0
            for res in results:
                if res['label'] == 'nsfw':
                    nsfw_score = res['score']
                    break
            
            return {
                "is_nsfw": nsfw_score > 0.8, # Strict threshold
                "score": nsfw_score,
                "label": "nsfw" if nsfw_score > 0.8 else "safe"
            }
            
        except Exception as e:
            logger.error(f"Error analyzing image: {e}")
            return None

# Singleton instance
image_analyzer = ImageAnalyzer()
