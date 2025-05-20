export interface Action {
    id: string;
    type: string;
    date: Date;
    
    // Fertilizing fields
    fertilizerType?: string;
    applicationRate?: number;
    method?: string;
    
    // Harvesting fields
    cropYield?: number;
    comments?: string;
    
    // Planting fields
    cropType?: string;
    variety?: string;
    seedingRate?: string;
    
    // SoilReading fields
    ph?: number;
    nitrogen?: number;
    phosphorus?: number;
    potassium?: number;
    organicMatter?: string;
    
    // Treatment fields
    pesticideType?: string;
    targetPest?: string;
    dosage?: number;
    applicationMethod?: string;
    
    // Watering fields
    waterSource?: string;
    amount?: number;

    createdAt?: Date;
}