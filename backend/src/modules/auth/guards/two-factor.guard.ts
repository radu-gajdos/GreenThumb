import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { UserService } from 'src/modules/user/services/user.service';

@Injectable()
export class TwoFactorGuard implements CanActivate {
  constructor(private readonly userService: UserService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('Authentication required');
    }

    const userDetails = await this.userService.getUserForGuards(user.id);
    if (!userDetails.twoFactorEnabled) {
      return true;
    }

    if (!user.is2FAAuthenticated) {
      throw new UnauthorizedException('2FA required');
    }

    return true;
  }
}
