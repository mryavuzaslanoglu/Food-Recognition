from fastapi import APIRouter, File, UploadFile, HTTPException
from app.schemas.food import FoodPrediction, HealthCheck
from app.services.model_service import model_service

router = APIRouter()

@router.post("/predict", response_model=FoodPrediction)
async def predict_food(file: UploadFile = File(...)):
    """Yemek fotoğrafını analiz et"""
    try:
        # Dosya içeriğini oku
        image_data = await file.read()
        
        # Tahmin yap
        food_name_en, food_name_tr, confidence, recipe = await model_service.predict(image_data)
        
        return FoodPrediction(
            food_name_en=food_name_en,
            food_name_tr=food_name_tr,
            confidence=confidence,
            recipe=recipe
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@router.get("/health", response_model=HealthCheck)
async def health_check():
    """API sağlık kontrolü"""
    return {"status": "healthy"}