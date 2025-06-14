import httpAi from "@/api/httpAi";
import { ToastService } from "@/services/toast.service";
import { AiPredictionResponse, ConfidenceLevel, PredictionMethod } from "../interfaces/analitics";

export class YieldPredictorApi {
  /**
   * Get full prediction data from AI service
   */
  async predictGlobal(country: string, year: number, crop: string): Promise<AiPredictionResponse | null> {
    try {
      const response = await httpAi.post("/predict-global", {
        country,
        year,
        crop,
      });

      // Validate response structure
      const data = response.data;
      if (!data || typeof data.yield_kg_per_ha !== 'number') {
        throw new Error('Invalid response format from AI service');
      }

      return {
        yield_kg_per_ha: data.yield_kg_per_ha,
        confidence_level: data.confidence_level as ConfidenceLevel,
        prediction_method: data.prediction_method as PredictionMethod,
        country: data.country,
        crop: data.crop,
        year: data.year
      };
    } catch (error) {
      console.error('AI Prediction Error:', error);
      ToastService.error("Nu s-a putut obține predicția AI.");
      return null;
    }
  }

  /**
   * Legacy method - returns only yield value for backwards compatibility
   */
  async predictGlobalYield(country: string, year: number, crop: string): Promise<number | null> {
    const prediction = await this.predictGlobal(country, year, crop);
    return prediction?.yield_kg_per_ha || null;
  }

  /**
   * Get available countries from AI service
   */
  async getAvailableCountries(): Promise<string[]> {
    try {
      const response = await httpAi.get("/countries");
      return response.data.countries || [];
    } catch (error) {
      console.error('Error fetching countries:', error);
      ToastService.error("Nu s-au putut încărca țările disponibile.");
      return [];
    }
  }

  /**
   * Get available crops from AI service
   */
  async getAvailableCrops(): Promise<string[]> {
    try {
      const response = await httpAi.get("/crops");
      return response.data.crops || [];
    } catch (error) {
      console.error('Error fetching crops:', error);
      ToastService.error("Nu s-au putut încărca culturile disponibile.");
      return [];
    }
  }

  /**
   * Get model information
   */
  async getModelInfo(): Promise<any> {
    try {
      const response = await httpAi.get("/model-info");
      return response.data;
    } catch (error) {
      console.error('Error fetching model info:', error);
      return null;
    }
  }

  /**
   * Health check for AI service
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await httpAi.get("/health");
      return response.data.status === 'healthy';
    } catch (error) {
      return false;
    }
  }
}

export const aiApi = new YieldPredictorApi();