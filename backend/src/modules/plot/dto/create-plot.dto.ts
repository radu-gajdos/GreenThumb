import { IsNotEmpty, IsString, IsNumber, IsOptional } from 'class-validator';

export class CreatePlotDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsNumber()
    size: number;

    @IsNotEmpty()
    @IsNumber()
    latitude: number;

    @IsNotEmpty()
    @IsNumber()
    longitude: number;

    @IsOptional()
    @IsString()
    topography?: string;

    @IsOptional()
    @IsString()
    soilType?: string;
}
