// src/shared/validators/validator.module.ts
import { Module } from '@nestjs/common';
import { IsEntityExistConstraint } from '../decorators/isEntityExistConstraint';

@Module({
  providers: [IsEntityExistConstraint],
  exports: [IsEntityExistConstraint],
})
export class ValidatorModule {}