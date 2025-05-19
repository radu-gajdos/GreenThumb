export interface Action {
    id?: number;
    type: string;
    
    // Fertilizing fields
    fertilizerType?: string;
    applicationRate?: number;
    method?: string;
    
    // Harvesting fields
    cropYield?: number;
    harvestDate?: Date;
    comments?: string;
    
    // Planting fields
    cropType?: string;
    variety?: string;
    seedingRate?: string;
    plantingDate?: Date;
    
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
}