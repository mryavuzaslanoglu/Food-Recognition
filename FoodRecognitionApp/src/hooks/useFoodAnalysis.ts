import { useState } from 'react';
import { foodService } from '@/services/foodService';

interface AnalysisResult {
  foodName: string;
  confidence: number;
  recipe: string;
}

interface UseFoodAnalysisResult {
  analyzeFood: (imageUri: string) => Promise<void>;
  result: AnalysisResult | null;
  loading: boolean;
  error: string | null;
}

export const useFoodAnalysis = (): UseFoodAnalysisResult => {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeFood = async (imageUri: string) => {
    try {
      setLoading(true);
      setError(null);
      const analysisResult = await foodService.analyzeImage(imageUri);
      setResult(analysisResult);
    } catch (err) {
      setError('Yemek analiz edilemedi');
    } finally {
      setLoading(false);
    }
  };

  return { analyzeFood, result, loading, error };
};