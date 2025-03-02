import { Injectable, NestMiddleware, Inject } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import { Redis } from 'ioredis';

@Injectable()
export class RateLimiterMiddleware implements NestMiddleware {
  private limiter: any;

  constructor(@Inject('REDIS_CLIENT') private readonly redis: Redis) {
    this.limiter = rateLimit({
      store: new RedisStore({
        sendCommand: async (command: string, ...args: string[]): Promise<any> =>
          this.redis.call(command, ...args),
        prefix: 'rl:'
      }),
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // Limit each IP to 100 requests per windowMs
      message: 'Too many requests from this IP, please try again later',
      standardHeaders: true,
      legacyHeaders: false,
    });
  }

  use(req: Request, res: Response, next: NextFunction) {
    this.limiter(req, res, next);
  }
}
