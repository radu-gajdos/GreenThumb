export interface Action {
  id: string;
  type: string;
  plotId: string;
  date: Date;
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
  description?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Fertilizing specific fields
  fertilizerType?: string;
  applicationRate?: number;
  method?: string;
  
  // Harvesting specific fields
  cropYield?: number;
  comments?: string;
  
  // Planting specific fields
  cropType?: string;
  variety?: string;
  seedingRate?: string;
  
  // Soil reading specific fields
  ph?: number;
  nitrogen?: number;
  phosphorus?: number;
  potassium?: number;
  organicMatter?: string;
  
  // Treatment specific fields
  pesticideType?: string;
  targetPest?: string;
  dosage?: number;
  applicationMethod?: string;
  
  // Watering specific fields
  waterSource?: string;
  amount?: number;
}