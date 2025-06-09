import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios from 'axios';
import { Plot } from 'src/modules/plot/entities/plot.entity';
import { Action } from 'src/modules/action/entities/action.entity';
import { Polygon } from 'geojson';

interface FieldData {
  language?: string;
  crop: string;
  soil: string;
  weather: string;
  recentActions: string;
  goal: string;
  plotId?: string;
  coordinates?: string;
}

interface ConversationMessage {
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

@Injectable()
export class AiService {
  constructor(
    @InjectRepository(Plot)
    private readonly plotRepository: Repository<Plot>,
  ) {}

  async getRecommendationFromFieldData(data: FieldData): Promise<string> {
    const prompt = this.buildPrompt(data);

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      },
    );

    return response.data.choices[0].message.content.trim();
  }

  async getAIResponseForPlot(data: {
    language?: string;
    query: string;
    plotId: string;
    conversationHistory?: ConversationMessage[];
  }): Promise<string> {
    const plot = await this.plotRepository.findOne({
      where: { id: data.plotId },
      relations: ['actions'],
    });

    if (!plot) {
      throw new Error(`Plot with ID ${data.plotId} not found`);
    }

    const recentActions = plot.actions
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);

    const coordinates = this.extractCentroidCoordinates(plot.boundary);

    const messages = this.buildConversationMessages(
      plot,
      recentActions,
      data.query,
      data.language,
      data.conversationHistory,
      coordinates
    );

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: messages,
        temperature: 0.7,
        max_tokens: 500,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      },
    );

    return response.data.choices[0].message.content.trim();
  }

  private buildPrompt(data: FieldData & { language?: string }): string {
    const isRomanian = data.language === 'ro';

    const intro = isRomanian
      ? 'Ești un asistent agricol inteligent. Pe baza următoarelor date, oferă sugestii personalizate și utile pentru a ajuta fermierul să îmbunătățească sănătatea culturilor, să mărească randamentul sau să gestioneze mai bine resursele.'
      : 'You are an intelligent agriculture assistant. Based on the following field data, provide relevant and personalized suggestions to help the farmer improve crop health, maximize yield, or manage resources effectively.';

    const instruction = isRomanian
      ? 'Răspunde cu sfaturi clare, practice și acționabile în limba română, în funcție de situația actuală a parcelei.'
      : 'Return clear, practical, and actionable advice based on the current situation of the field.';

    return `
${intro}

Field ID: ${data.plotId || 'N/A'}
Crop: ${data.crop}
Soil Type: ${data.soil}
Location Coordinates: ${data.coordinates || 'N/A'}
Weather Forecast: ${data.weather}
Recent Actions: ${data.recentActions}
Farmer's Goal: ${data.goal}

${instruction}
`.trim();
  }

  private buildConversationMessages(
    plot: Plot,
    recentActions: Action[],
    currentQuery: string,
    language?: string,
    conversationHistory?: ConversationMessage[],
    coordinates?: string
  ): any[] {
    const isRomanian = language === 'ro';

    const systemPrompt = this.buildSystemPrompt(plot, recentActions, language, coordinates);

    const messages = [
      {
        role: 'system',
        content: systemPrompt,
      },
    ];

    if (conversationHistory && conversationHistory.length > 0) {
      const recentHistory = conversationHistory.slice(-7);
      recentHistory.forEach((msg) => {
        messages.push({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.text,
        });
      });
    }

    messages.push({
      role: 'user',
      content: currentQuery,
    });

    return messages;
  }

  private buildSystemPrompt(
    plot: Plot,
    recentActions: Action[],
    language?: string,
    coordinates?: string
  ): string {
    const isRomanian = language === 'ro';

    const intro = isRomanian
      ? 'Ești un asistent agricol inteligent specializat în monitorizarea și gestionarea parcelelor agricole. Ai acces la informații despre această parcelă și istoricul conversațiilor.'
      : 'You are an intelligent agriculture assistant specialized in monitoring and managing agricultural plots. You have access to information about this plot and conversation history.';

    const actionDetails = recentActions.map((action) => {
      const date = new Date(action.date).toLocaleDateString();
      let details = `Type: ${action.type}, Date: ${date}`;

      if (action.type === 'harvesting') {
        const harvesting = action as any;
        details += `, Yield: ${harvesting.cropYield} ${harvesting.comments ? `, Comments: ${harvesting.comments}` : ''}`;
      } else if (action.type === 'treatment') {
        const treatment = action as any;
        details += `, Pesticide: ${treatment.pesticideType}, Target: ${treatment.targetPest}, Dosage: ${treatment.dosage}, Method: ${treatment.applicationMethod}`;
      }

      return details;
    }).join('\n');

    const guidelines = isRomanian
      ? `
Instrucțiuni importante:
- Folosește informațiile despre parcelă și conversațiile anterioare pentru a oferi răspunsuri personalizate
- Dacă utilizatorul se referă la ceva menționat anterior, recunoaște contextul
- Oferă sfaturi practice și acționabile specifice pentru cultura și condițiile parcelei
- Răspunde în limba română
- Păstrează un ton prietenos și profesional`
      : `
Important guidelines:
- Use the plot information and previous conversations to provide personalized responses
- If the user refers to something mentioned earlier, acknowledge the context
- Provide practical and actionable advice specific to the crop and plot conditions
- Maintain a friendly and professional tone`;

    return `
${intro}

PLOT DETAILS:
Plot ID: ${plot.id}
Plot Name: ${plot.name}
Size: ${plot.size} hectares
Soil Type: ${plot.soilType || 'Unknown'}
Topography: ${plot.topography || 'Unknown'}
Coordinates (approx.): ${coordinates || 'Unknown'}

RECENT ACTIONS (Last 5):
${actionDetails || 'No recent actions recorded.'}

${guidelines}
`.trim();
  }

  private extractCentroidCoordinates(boundary: Polygon): string {
    if (!boundary?.coordinates?.length) return 'Unknown';

    const allCoords = boundary.coordinates[0];
    const n = allCoords.length;
    const avgLat = allCoords.reduce((sum, c) => sum + c[1], 0) / n;
    const avgLng = allCoords.reduce((sum, c) => sum + c[0], 0) / n;

    return `${avgLat.toFixed(6)}, ${avgLng.toFixed(6)}`;
  }
}
