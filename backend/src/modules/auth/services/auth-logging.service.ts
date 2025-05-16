import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { AuthLog } from '../entities/authLog.entity';

@Injectable()
export class AuthLoggingService {
  constructor(
    @InjectRepository(AuthLog)
    public authLogRepository: Repository<AuthLog>,
  ) {}

  async logActivity(data: {
    userId: string;
    action: string;
    ip: string;
    userAgent: string;
    statusCode: number;
    duration: number;
    additionalInfo?: any;
  }) {
    const log = this.authLogRepository.create({
      ...data,
      additionalInfo: data.additionalInfo ? JSON.stringify(data.additionalInfo) : undefined,
      createdAt: new Date(),
    });

    await this.authLogRepository.save(log);
  }

  async getRecentActivity(userId: string, limit: number = 10) {
    return this.authLogRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async getFailedLoginAttempts(userId: string, minutes: number = 15) {
    const timeAgo = new Date(Date.now() - minutes * 60 * 1000);

    return this.authLogRepository.count({
      where: {
        userId,
        action: 'LOGIN_FAILED',
        createdAt: MoreThan(timeAgo),
      },
    });
  }
}
