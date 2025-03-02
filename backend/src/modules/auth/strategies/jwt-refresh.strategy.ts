import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { UserService } from 'src/modules/user/services/user.service';
import { PayloadTokenInterface } from '../interfaces/payload.interface';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('JWT_SECRET'),
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: PayloadTokenInterface) {
    if (!req.get('Authorization')) {
      throw new UnauthorizedException();
    }

    const refreshToken = req.get('Authorization')!.replace('Bearer', '').trim();
    // const user = await this.userService.findById(parseInt(payload.sub));
    const user = await this.userService.getUserForGuards(payload.sub);

    if (!user) {
      throw new UnauthorizedException();
    }

    return {
      ...user,
      refreshToken,
    };
  }
}
