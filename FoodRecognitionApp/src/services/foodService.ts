import { apiService } from './api';
import { CONFIG } from '../constants/config';

interface AnalysisResult {
  foodName: string;
  confidence: number;
  recipe: string;
}

class FoodService {
  async analyzeImage(imageUri: string): Promise<AnalysisResult> {
    try {
      const formData = await apiService.uploadImage(imageUri);
      
      const response = await fetch(`${CONFIG.API_URL}/predict`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!response.ok) {
        throw new Error('Görüntü analizi başarısız oldu');
      }

      const data = await response.json();
      
      return {
        foodName: data.food_name,
        confidence: data.confidence,   recipe: data.recipe,
    };
  } catch (error) {
    console.error('Food Analysis Error:', error);
    throw new Error('Yemek analizi sırasında bir hata oluştu');
  }
}
}

export const foodService = new FoodService();