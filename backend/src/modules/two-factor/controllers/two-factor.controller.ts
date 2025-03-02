import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { Auth } from 'src/modules/auth/decorators/auth.decorator';
import { TwoFactorService } from '../services/two-factor-service';
import { CurrentUser } from 'src/modules/auth/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt.guard';

@Controller('two-factor')
export class TwoFactorController {
  constructor(private readonly twoFactorService: TwoFactorService) {}

  @Auth()
  @Post('enable')
  enable(@CurrentUser('id') userId: number) {
    return this.twoFactorService.enable(userId);
  }

  @Auth()
  @Post('enableEmail')
  enableEmail(@CurrentUser('id') userId: number) {
    return this.twoFactorService.enableEmail(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('verify-setup')
  verifySetup(
    @CurrentUser('id') userId: number,
    @Body('token') token: string,
  ) {
    return this.twoFactorService.verifySetup(userId, token);
  }

  @Auth()
  @Post('disable')
  disable(@CurrentUser('id') userId: number) {
    return this.twoFactorService.disable(userId);
  }

  @Auth()
  @Post('backup-codes')
  generateNewBackupCodes(@CurrentUser('id') userId: number) {
    return this.twoFactorService.generateNewBackupCodes(userId);
  }
}
