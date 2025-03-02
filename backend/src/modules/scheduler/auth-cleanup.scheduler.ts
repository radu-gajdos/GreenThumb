import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SecurityService } from '../auth/services/security.service';

@Injectable()
export class AuthCleanupScheduler {
  constructor(private readonly securityService: SecurityService) {}

  @Cron(CronExpression.EVERY_HOUR)
  async handleSessionCleanup() {
    await this.securityService.cleanupExpiredSessions();
    console.log('Expired sessions cleaned up');
  }
}