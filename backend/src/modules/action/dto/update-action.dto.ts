import { PartialType } from '@nestjs/mapped-types';
import { CreateActionDto } from './create-action.dto';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class UpdateActionDto extends PartialType(CreateActionDto) {
    @IsNotEmpty()
    @IsString()
    id: string;
}
