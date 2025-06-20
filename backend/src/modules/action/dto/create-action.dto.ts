import { Type } from 'class-transformer';
import { IsNotEmpty, IsString, IsOptional, IsNumber, IsDate, Min, Max, IsPositive, IsEnum } from 'class-validator';

export class CreateActionDto {
    @IsNotEmpty()
    @IsString()
    type: string;

    @IsNotEmpty()
    @IsDate()
    @Type(() => Date)
    date: Date;

    @IsOptional()
    @IsEnum(['planned', 'in_progress', 'completed', 'cancelled'])
    status?: 'planned' | 'in_progress' | 'completed' | 'cancelled';

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    notes?: string;

    // Fertilizing fields
    @IsOptional()
    @IsString()
    fertilizerType?: string;

    @IsOptional()
    @IsNumber()
    @IsPositive()
    applicationRate?: number;

    @IsOptional()
    @IsString()
    method?: string;

    // Harvesting fields
    @IsOptional()
    @IsNumber()
    @Min(0)
    cropYield?: number;

    @IsOptional()
    @IsString()
    comments?: string;

    // Planting fields
    @IsOptional()
    @IsString()
    cropType?: string;

    @IsOptional()
    @IsString()
    variety?: string;

    @IsOptional()
    @IsString()
    seedingRate?: string;

    // SoilReading fields
    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(14)
    ph?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    nitrogen?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    phosphorus?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    potassium?: number;

    @IsOptional()
    @IsString()
    organicMatter?: string;

    // Treatment fields
    @IsOptional()
    @IsString()
    pesticideType?: string;

    @IsOptional()
    @IsString()
    targetPest?: string;

    @IsOptional()
    @IsNumber()
    @IsPositive()
    dosage?: number;

    @IsOptional()
    @IsString()
    applicationMethod?: string;

    // Watering fields
    @IsOptional()
    @IsString()
    waterSource?: string;

    @IsOptional()
    @IsNumber()
    @Min(0)
    amount?: number;
}