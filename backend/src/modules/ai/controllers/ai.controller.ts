import { Controller, Post, Body } from '@nestjs/common';
import { AiService } from '../services/ai.service';

interface ConversationMessage {
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

@Controller('ai')
export class AiController {
    constructor(private readonly aiService: AiService) { }

    /**
     * Enhanced AI query endpoint with conversation context support
     * Backwards compatible - conversationHistory is optional
     */
    @Post('query')
    async queryAI(@Body() body: {
        language?: string;
        query: string;  // The question or task
        plotId: string; // Plot ID is required
        conversationHistory?: ConversationMessage[]; // NEW: Optional conversation context
    }) {
        console.log('AI Query received:', {
            plotId: body.plotId,
            query: body.query,
            language: body.language,
            historyLength: body.conversationHistory?.length || 0
        });

        const result = await this.aiService.getAIResponseForPlot({
            query: body.query,
            plotId: body.plotId,
            language: body.language,
            conversationHistory: body.conversationHistory // Pass conversation history to service
        });

        console.log('AI Response generated:', {
            responseLength: result.length,
            firstWords: result.substring(0, 50) + '...'
        });

        return { result };
    }

    /**
     * Legacy endpoint for field data recommendations
     * Kept for backwards compatibility
     */
    @Post('recommend')
    async getRecommendation(@Body() body: {
        language?: string;
        crop: string;
        soil: string;
        weather: string;
        recentActions: string;
        goal: string;
        plotId?: string;
        coordinates?: string;
    }) {
        const result = await this.aiService.getRecommendationFromFieldData(body);
        return { result };
    }
}