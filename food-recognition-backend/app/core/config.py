from pydantic_settings import BaseSettings
from typing import Optional
from functools import lru_cache

class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Food Recognition API"
    
    # Model ayarları
    MODEL_PATH: str = "app/models/food101_model_quantized.tflite"
    CLASS_NAMES_PATH: str = "app/models/class_names.txt"
    
    # Gemini API
    GEMINI_API_KEY: Optional[str] = None
    
    class Config:
        env_file = ".env"
        case_sensitive = True

@lru_cache()
def get_settings():
    return Settings()

settings = get_settings()