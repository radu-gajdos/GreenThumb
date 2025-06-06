import { IsNotEmpty, IsString } from 'class-validator';

export class CreateFieldNoteDto {
  @IsNotEmpty()
  @IsString()
  message: string;
  
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  plotId: string;
}
