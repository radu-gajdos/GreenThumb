import { Controller, Post, Body } from '@nestjs/common';
import { AiService } from '../services/ai.service';

@Controller('ai')
export class AiController {
    constructor(private readonly aiService: AiService) { }

    // Changes to ai.controller.ts
    @Post('query')
    async queryAI(@Body() body: {
        language?: string;
        query: string;  // The question or task
        plotId: string; // Plot ID is now required
    }) {
        const result = await this.aiService.getAIResponseForPlot(body);
        return { result };
    }

}
