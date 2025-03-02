import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from 'src/modules/user/services/user.service';
import { PayloadTokenInterface } from '../interfaces/payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  async validate(payload: PayloadTokenInterface) {
    const user = await this.userService.getUserForGuards(payload.sub);
    if (!user) {
      throw new UnauthorizedException();
    }

    if(user.passwordResetCount !== payload.passwordResetCount) {
      throw new UnauthorizedException('Password has been reset. Please login again.');
    }

    return {...user, is2FAAuthenticated: payload.is2FAAuthenticated};
  }
}
