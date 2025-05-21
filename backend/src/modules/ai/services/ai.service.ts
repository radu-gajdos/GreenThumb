import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios from 'axios';
import { Plot } from 'src/modules/plot/entities/plot.entity';
import { Action } from 'src/modules/action/entities/action.entity';

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

@Injectable()
export class AiService {
  constructor(
    @InjectRepository(Plot)
    private readonly plotRepository: Repository<Plot>,
  ) { }

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
  }): Promise<string> {
    // Fetch the plot with its actions
    const plot = await this.plotRepository.findOne({
      where: { id: data.plotId },
      relations: ['actions']
    });

    if (!plot) {
      throw new Error(`Plot with ID ${data.plotId} not found`);
    }

    // Get the last 5 actions sorted by date
    const recentActions = plot.actions
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);

    const prompt = this.buildAIPrompt(plot, recentActions, data.query, data.language);

    console.log('Prompt:', prompt); // Debugging line

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

  private buildAIPrompt(
    plot: Plot,
    recentActions: Action[],
    query: string,
    language?: string
  ): string {
    const isRomanian = language === 'ro';

    const intro = isRomanian
      ? 'Ești un asistent agricol inteligent specializat în monitorizarea și gestionarea parcelelor agricole.'
      : 'You are an intelligent agriculture assistant specialized in monitoring and managing agricultural plots.';

    const actionDetails = recentActions.map(action => {
      const date = new Date(action.date).toLocaleDateString();
      let details = `Type: ${action.type}, Date: ${date}`;

      // Add specific details based on action type
      if (action.type === 'harvesting') {
        const harvesting = action as any; // Type assertion for accessing property
        details += `, Yield: ${harvesting.cropYield} ${harvesting.comments ? `, Comments: ${harvesting.comments}` : ''}`;
      } else if (action.type === 'treatment') {
        const treatment = action as any; // Type assertion for accessing property
        details += `, Pesticide: ${treatment.pesticideType}, Target: ${treatment.targetPest}, Dosage: ${treatment.dosage}, Method: ${treatment.applicationMethod}`;
      }

      return details;
    }).join('\n');

    return `
${intro}

PLOT DETAILS:
Plot ID: ${plot.id}
Plot Name: ${plot.name}
Size: ${plot.size} hectares
Soil Type: ${plot.soilType || 'Unknown'}
Topography: ${plot.topography || 'Unknown'} 

RECENT ACTIONS (Last 5):
${actionDetails || 'No recent actions recorded.'}

USER QUERY:
${query}

${isRomanian
        ? 'Folosește informațiile de mai sus despre parcelă și acțiunile recente pentru a răspunde la întrebarea utilizatorului. Oferă un răspuns clar, detaliat și personalizat în limba română.'
        : 'Use the above information about the plot and recent actions to respond to the user query. Provide a clear, detailed, and personalized response.'}
`.trim();
  }
}