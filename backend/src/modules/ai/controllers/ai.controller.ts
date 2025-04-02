import { Controller, Post, Body } from '@nestjs/common';
import { AiService } from '../services/ai.service';

@Controller('ai')
export class AiController {
    constructor(private readonly aiService: AiService) { }

    @Post('recommend')
    async recommend(@Body() body: {
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
