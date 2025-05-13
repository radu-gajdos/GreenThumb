// src/modules/plot/dto/create-plot.dto.ts
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  ArrayMinSize,
} from 'class-validator';

class GeoJsonPolygonDto {
  @IsString()
  type: 'Polygon';

  coordinates: number[][][];
}

export class CreatePlotDto {
  @IsNotEmpty() @IsString() name: string;
  @IsNotEmpty() @IsNumber() size: number;

  @IsNotEmpty()
  // transform plain into GeoJsonPolygonDto if you want, but for now:
  boundary: GeoJsonPolygonDto;

  @IsOptional() @IsString() topography?: string;
  @IsOptional() @IsString() soilType?: string;
}
