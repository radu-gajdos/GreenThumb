import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, LessThan } from 'typeorm';
import { RefreshToken } from '../entities/refreshToken.entity';
import { ActiveSession } from '../entities/activeSession.entity';
import { AuthLog } from '../entities/authLog.entity';
import { AuthLoggingService } from './auth-logging.service';

@Injectable()
export class SecurityService {
  constructor(
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
    @InjectRepository(ActiveSession)
    private activeSessionRepository: Repository<ActiveSession>,
    @InjectRepository(AuthLog)
    private authLogRepository: Repository<AuthLog>,
    private authLoggingService: AuthLoggingService,
  ) {}

  async detectSuspiciousActivity(userId: string) {
    const suspiciousPatterns = await Promise.all([
      this.checkMultipleFailedLogins(userId),
      this.checkMultipleDevices(userId),
      this.checkUnusualLocations(userId),
      this.checkBruteForceAttempts(userId),
    ]);

    return suspiciousPatterns.some(pattern => pattern);
  }

  private async checkMultipleFailedLogins(userId: string): Promise<boolean> {
    const failedAttempts = await this.authLoggingService.getFailedLoginAttempts(userId);
    return failedAttempts > 5;
  }

  private async checkMultipleDevices(userId: string): Promise<boolean> {
    const activeSessions = await this.activeSessionRepository.find({
      where: { userId },
    });

    const uniqueDevices = new Set(activeSessions.map(session => session.userAgent));
    return uniqueDevices.size > 5;
  }

  private async checkUnusualLocations(userId: string): Promise<boolean> {
    const recentLogs = await this.authLoggingService.getRecentActivity(userId, 10);
    const uniqueIPs = new Set(recentLogs.map(log => log.ip));
    return uniqueIPs.size > 3;
  }

  private async checkBruteForceAttempts(userId: string): Promise<boolean> {
    const timeWindow = new Date(Date.now() - 5 * 60 * 1000); // 5 minutes

    const attempts = await this.authLoggingService.authLogRepository.count({
      where: {
        userId,
        action: 'LOGIN_ATTEMPT',
        createdAt: MoreThan(timeWindow),
      },
    });

    return attempts > 20;
  }

  async enforcePasswordPolicies(password: string): Promise<{
    isValid: boolean;
    errors: string[]
  }> {
    const errors: string[] = [];

    if (password.length < 12) {
      errors.push('Password must be at least 12 characters long');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  async cleanupExpiredSessions() {
    const now = new Date();

    await Promise.all([
      this.refreshTokenRepository.delete({
        expiresAt: LessThan(now),
      }),
      this.activeSessionRepository.delete({
        expiresAt: LessThan(now),
      }),
    ]);
  }
}
