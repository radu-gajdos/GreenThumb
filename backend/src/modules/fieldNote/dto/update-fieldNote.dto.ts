import { PartialType } from '@nestjs/mapped-types';
import { CreateFieldNoteDto } from './create-fieldNote.dto';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateFieldNoteDto extends PartialType(CreateFieldNoteDto) {
  @IsNotEmpty()
  @IsString()
  id: string;
}
