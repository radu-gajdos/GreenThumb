import { applyDecorators, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt.guard';
import { TwoFactorGuard } from '../guards/two-factor.guard';

export function Auth() {
  return applyDecorators(
    UseGuards(JwtAuthGuard, TwoFactorGuard)
  );
}