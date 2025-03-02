import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThan } from 'typeorm';
import { AuthLog } from '../entities/authLog.entity';
import { RefreshToken } from '../entities/refreshToken.entity';
import { ActiveSession } from '../entities/activeSession.entity';

@Injectable()
export class AuthMonitoringService {
  constructor(
    @InjectRepository(AuthLog)
    private authLogRepository: Repository<AuthLog>,
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
    @InjectRepository(ActiveSession)
    private activeSessionRepository: Repository<ActiveSession>,
  ) {}

  async getLoginStats(timeframe: { start: Date; end: Date }) {
    const [
      totalLogins,
      failedLogins,
      uniqueUsers,
      averageLoginDuration,
    ] = await Promise.all([
      this.authLogRepository.count({
        where: {
          action: 'LOGIN_SUCCESS',
          createdAt: Between(timeframe.start, timeframe.end),
        },
      }),
      this.authLogRepository.count({
        where: {
          action: 'LOGIN_FAILED',
          createdAt: Between(timeframe.start, timeframe.end),
        },
      }),
      this.authLogRepository
        .createQueryBuilder('log')
        .select('COUNT(DISTINCT log.userId)', 'count')
        .where('log.action = :action', { action: 'LOGIN_SUCCESS' })
        .andWhere('log.createdAt BETWEEN :start AND :end', timeframe)
        .getRawOne(),
      this.authLogRepository
        .createQueryBuilder('log')
        .select('AVG(log.duration)', 'average')
        .where('log.action = :action', { action: 'LOGIN_SUCCESS' })
        .andWhere('log.createdAt BETWEEN :start AND :end', timeframe)
        .getRawOne(),
    ]);

    return {
      totalLogins,
      failedLogins,
      uniqueUsers: Number(uniqueUsers?.count || 0),
      averageLoginDuration: Number(averageLoginDuration?.average || 0),
      successRate: totalLogins / (totalLogins + failedLogins) * 100,
    };
  }

  async getActiveSessionsStats() {
    const [
      totalActiveSessions,
      sessionsPerUser,
      oldestSession,
    ] = await Promise.all([
      this.activeSessionRepository.count(),
      this.activeSessionRepository
        .createQueryBuilder('session')
        .select('userId')
        .addSelect('COUNT(*)', 'count')
        .groupBy('userId')
        .getRawMany(),
      this.activeSessionRepository.findOne({
        order: { createdAt: 'ASC' },
      }),
    ]);

    const averageSessionsPerUser = sessionsPerUser.reduce(
      (acc, curr) => acc + Number(curr.count),
      0,
    ) / sessionsPerUser.length;

    return {
      totalActiveSessions,
      averageSessionsPerUser,
      oldestSessionAge: oldestSession
        ? Date.now() - oldestSession.createdAt.getTime()
        : 0,
      usersWithMultipleSessions: sessionsPerUser.filter(
        s => Number(s.count) > 1,
      ).length,
    };
  }

  async get2FAStats(timeframe: { start: Date; end: Date }) {
    const logs = await this.authLogRepository.find({
      where: {
        action: 'TWO_FACTOR_ATTEMPT',
        createdAt: Between(timeframe.start, timeframe.end),
      },
    });

    const successfulAttempts = logs.filter(
      log => JSON.parse(log.additionalInfo || '{}').success,
    ).length;

    return {
      totalAttempts: logs.length,
      successfulAttempts,
      failedAttempts: logs.length - successfulAttempts,
      successRate: (successfulAttempts / logs.length) * 100,
    };
  }

  async getSecurityAlerts() {
    const alerts : any[] = [];

    // Check for brute force attempts
    const bruteForceThreshold = 10;
    const recentFailedLogins = await this.authLogRepository.find({
      where: {
        action: 'LOGIN_FAILED',
        createdAt: MoreThan(new Date(Date.now() - 15 * 60 * 1000)), // last 15 minutes
      },
    });

    const failedLoginsByIp: { [key: string]: number } = recentFailedLogins.reduce((acc, log) => {
        if(log.ip){
            acc[log.ip] = (acc[log.ip] || 0) + 1;
        }
        return acc;
    }, {});

    for (const [ip, count] of Object.entries(failedLoginsByIp)) {
      if (count >= bruteForceThreshold) {
        alerts.push({
          type: 'BRUTE_FORCE_ATTEMPT',
          severity: 'HIGH',
          details: `Multiple failed login attempts from IP: ${ip}`,
          timestamp: new Date(),
        });
      }
    }

    // Check for suspicious location changes
    const recentLogins = await this.authLogRepository.find({
      where: {
        action: 'LOGIN_SUCCESS',
        createdAt: MoreThan(new Date(Date.now() - 24 * 60 * 60 * 1000)), // last 24 hours
      },
      order: { createdAt: 'DESC' },
    });

    const loginsByUser: { [key: string]: AuthLog[] } = {};
    for (const login of recentLogins) {
      if (!loginsByUser[login.userId]) {
        loginsByUser[login.userId] = [];
      }
      loginsByUser[login.userId].push(login);
    }

    for (const [userId, userLogins] of Object.entries(loginsByUser)) {
      if (userLogins.length >= 2) {
        const uniqueIps = new Set(userLogins.map(login => login.ip));
        if (uniqueIps.size > 3) {
          alerts.push({
            type: 'SUSPICIOUS_LOCATION_CHANGES',
            severity: 'MEDIUM',
            details: `User ${userId} logged in from multiple locations`,
            timestamp: new Date(),
          });
        }
      }
    }

    return alerts;
  }
}

