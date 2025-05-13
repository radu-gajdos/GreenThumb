import { PartialType } from '@nestjs/mapped-types';
import { CreatePlotDto } from './create-plot.dto';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class UpdatePlotDto extends PartialType(CreatePlotDto) {
    @IsNotEmpty()
    @IsString()
    id: string;
}
