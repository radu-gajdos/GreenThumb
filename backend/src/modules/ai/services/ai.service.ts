import { Injectable } from '@nestjs/common';
import axios from 'axios';

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

}
