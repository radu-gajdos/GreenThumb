import { Expose, Type } from 'class-transformer';
import { IsEmail, IsString, MinLength, IsNotEmpty, IsOptional, MaxLength, IsIn, IsArray, ValidateNested } from 'class-validator';
import { IntRequiredValidation, StringRequiredValidation } from 'src/shared/decorators/customValidators';

export class RegisterDto {
  @StringRequiredValidation(255)
  name: string;

  @StringRequiredValidation(255)
  email: string;

  @StringRequiredValidation(255)
  phone: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  @MaxLength(80)
  password: string;
  
}