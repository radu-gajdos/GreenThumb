import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
  } from '@nestjs/common';
  import { Observable } from 'rxjs';
  import { tap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

  @Injectable()
  export class AuthLoggingInterceptor implements NestInterceptor {
    constructor(private readonly authService: AuthService) {}

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
      const request = context.switchToHttp().getRequest();
      const { ip, method, path: url } = request;
      const userAgent = request.get('user-agent') || '';
      const now = Date.now();

      return next.handle().pipe(
        tap(async () => {
          const response = context.switchToHttp().getResponse();
          const statusCode = response.statusCode;

          if (request.user && ['POST', 'PATCH', 'DELETE'].includes(method)) {
            await this.authService.logActivity({
              userId: request.user.id,
              action: `${method} ${url}`,
              ip,
              userAgent,
              statusCode,
              duration: Date.now() - now,
            });
          }
        }),
      );
    }
  }

