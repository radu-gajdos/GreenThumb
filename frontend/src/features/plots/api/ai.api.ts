// src/api/ai.api.ts
import http from "@/api/http";
import { ToastService } from "@/services/toast.service";

/**
 * Response structure from the AI API endpoint
 */
interface AiApiResponse {
  data: {
    result: string;
  };
  statusCode: number;
  message: string;
}

/**
 * Possible HTTP client response wrapper
 */
interface HttpResponse<T> {
  data: T;
  status: number;
  statusText: string;
}

/**
 * Error messages for different languages
 */
const ERROR_MESSAGES = {
  ro: "Nu s-a putut obține răspunsul de la asistentul AI.",
  en: "Could not get response from AI assistant.",
  de: "Die Antwort des KI-Assistenten konnte nicht abgerufen werden.",
} as const;

/**
 * @class AiApi
 * @description
 * Encapsulates all operations for AI queries via HTTP calls.
 * Uses a shared HTTP client and displays toast notifications on errors.
 * 
 * Think of this as a translator between your frontend and the AI service - 
 * it speaks "HTTP" to the backend and returns clean data to your components.
 */
export class AiApi {
  /**
   * Send a query to the AI assistant about a specific plot.
   * 
   * @param plotId - The ID of the plot to query about
   * @param query - The user's question or request
   * @param language - The language code ('en' | 'ro')
   * @returns Promise resolving to the AI response text
   * 
   * @throws {Error} When the API request fails or returns invalid data
   */
  async query(plotId: string, query: string, language: string = 'en'): Promise<string> {
    try {
      const response = await http.post<AiApiResponse>('/ai/query', {
        plotId,
        query,
        language
      });

      const result = this.extractResultFromResponse(response);
      this.validateResult(result);
      
      return result;
    } catch (error) {
      this.handleError(error, language as keyof typeof ERROR_MESSAGES);
      throw error;
    }
  }

  /**
   * Extracts the AI result from the HTTP response, handling different response structures.
   * 
   * @private
   */
  private extractResultFromResponse(response: HttpResponse<AiApiResponse>): string {
    // Handle nested response structure from HTTP client wrapper
    if (response.data?.data?.result) {
      return response.data.data.result;
    }
    
    // Handle direct response structure
    if (response.data?.data.result) {
      return response.data.data.result;
    }
    
    throw new Error('Invalid API response structure - missing result field');
  }

  /**
   * Validates that the AI result is not empty or invalid.
   * 
   * @private
   */
  private validateResult(result: string): void {
    if (!result || typeof result !== 'string' || result.trim() === '') {
      throw new Error('Empty or invalid response from AI service');
    }
  }

  /**
   * Handles errors by logging and showing user-friendly toast messages.
   * 
   * @private
   */
  private handleError(error: unknown, language: keyof typeof ERROR_MESSAGES): void {
    console.error('AI API Error:', error);
    const errorMessage = ERROR_MESSAGES[language] || ERROR_MESSAGES.en;
    ToastService.error(errorMessage);
  }
}

export default AiApi;