// src/api/ai.api.ts
import http from "@/api/http";
import { ToastService } from "@/services/toast.service";

/**
 * @class AiApi
 * @description
 * Encapsulates all operations for AI queries via HTTP calls.
 * Uses a shared HTTP client and displays toast notifications on errors/success.
 */
export class AiApi {
  /**
   * Send a query to the AI assistant about a specific plot.
   * @param plotId - The ID of the plot
   * @param query - The user's question or request
   * @param language - The language code (en or ro)
   * @returns Promise resolving to the AI response text.
   */
  async query(plotId: string, query: string, language: string = 'en'): Promise<string> {
    try {
      const response = await http.post('/ai/query', {
        plotId,
        query,
        language
      });
      
      return response.data.result;
    } catch (error) {
      console.error('Error querying AI:', error);
      
      // Display user-friendly error message
      if (language === 'ro') {
        ToastService.error("Nu s-a putut obține răspunsul de la asistentul AI.");
      } else {
        ToastService.error("Could not get response from AI assistant.");
      }
      
      // Rethrow for component handling
      throw error;
    }
  }
}

export default AiApi;