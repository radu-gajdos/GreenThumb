import { IsBoolean, IsOptional } from 'class-validator';
import { StringRequiredValidation } from 'src/shared/decorators/customValidators';

export class LoginDto {
  @StringRequiredValidation(255)
  email: string;

  @StringRequiredValidation(255)
  password: string;

  @IsBoolean()
  @IsOptional()
  rememberMe: boolean = false;
}
