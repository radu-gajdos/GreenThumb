import { Type } from 'class-transformer';
import { IsNotEmpty, IsString, IsOptional, IsNumber, IsDate, Min, Max, IsPositive } from 'class-validator';

export class CreateActionDto {
    @IsNotEmpty()
    @IsString()
    type: string;

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
    @Min(0) // Equivalent to @PositiveOrZero in Java
    cropYield?: number;

    @IsOptional()
    @IsDate()
    @Type(() => Date)
    harvestDate?: Date;

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

    @IsOptional()
    @IsDate()
    @Type(() => Date)
    plantingDate?: Date;

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

