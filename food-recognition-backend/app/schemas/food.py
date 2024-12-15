from pydantic import BaseModel, Field

class FoodPrediction(BaseModel):
    food_name_en: str = Field(..., description="Yemeğin İngilizce adı")
    food_name_tr: str = Field(..., description="Yemeğin Türkçe adı")
    confidence: float = Field(..., description="Tahmin güven skoru", ge=0, le=1)
    recipe: str = Field(..., description="Yemeğin tarifi")

class HealthCheck(BaseModel):
    status: str