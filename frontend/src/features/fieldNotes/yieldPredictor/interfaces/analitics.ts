// src/interfaces/analytics.ts

export enum ConfidenceLevel {
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM', 
  LOW = 'LOW',
  VERY_LOW = 'VERY_LOW'
}

export enum PredictionMethod {
  HISTORICAL_INTERPOLATION = 'historical_interpolation',
  TREND_EXTRAPOLATION = 'trend_extrapolation',
  LONG_TERM_PROJECTION = 'long_term_projection'
}

/**
 * AI Prediction Response from the API
 */
export interface AiPredictionResponse {
  yield_kg_per_ha: number;
  confidence_level: ConfidenceLevel;
  prediction_method: PredictionMethod;
  country: string;
  crop: string;
  year: number;
}

/**
 * Enhanced yield data point with AI metadata
 */
export interface YieldDataPoint {
  year: number;
  yield: number | null;
  country: string;
  crop: string;
  confidenceLevel?: ConfidenceLevel;
  predictionMethod?: PredictionMethod;
  isHighConfidence?: boolean;
}

/**
 * Complete yield evolution data for chart display
 */
export interface YieldEvolutionData {
  country: string;
  crop: string;
  data: YieldDataPoint[];
  averageYield: number;
  minYield: number;
  maxYield: number;
  totalYearsWithData: number;
  // New AI-specific stats
  highConfidencePoints: number;
  mediumConfidencePoints: number;
  lowConfidencePoints: number;
  veryLowConfidencePoints: number;
}

/**
 * Chart configuration options
 */
export interface ChartConfig {
  showTrend: boolean;
  showAverage: boolean;
  showConfidenceLevels: boolean;
  timeRange: {
    start: number;
    end: number;
  };
}

/**
 * Selection state for country and crop
 */
export interface SelectionState {
  country: string;
  crop: string;
  isValid: boolean;
}

/**
 * Helper functions for confidence levels
 */
export const ConfidenceLevelColors = {
  [ConfidenceLevel.HIGH]: '#22c55e',      // green-500
  [ConfidenceLevel.MEDIUM]: '#eab308',    // yellow-500
  [ConfidenceLevel.LOW]: '#f97316',       // orange-500
  [ConfidenceLevel.VERY_LOW]: '#ef4444'   // red-500
};

export const ConfidenceLevelLabels = {
  [ConfidenceLevel.HIGH]: 'Înaltă',
  [ConfidenceLevel.MEDIUM]: 'Medie',
  [ConfidenceLevel.LOW]: 'Scăzută',
  [ConfidenceLevel.VERY_LOW]: 'Foarte Scăzută'
};

export const PredictionMethodLabels = {
  [PredictionMethod.HISTORICAL_INTERPOLATION]: 'Interpolare Istorică',
  [PredictionMethod.TREND_EXTRAPOLATION]: 'Extrapolarea Trendul',
  [PredictionMethod.LONG_TERM_PROJECTION]: 'Proiecție pe Termen Lung'
};