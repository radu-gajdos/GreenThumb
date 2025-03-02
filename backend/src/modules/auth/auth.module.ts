import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtStrategy } from './strategies/jwt.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { VerificationToken } from './entities/verificationToken.entity';
import { RefreshToken } from './entities/refreshToken.entity';
import { TwoFactorCode } from './entities/twoFactorCode.entity';
import { ActiveSession } from './entities/activeSession.entity';
import { AuthLog } from './entities/authLog.entity';
import { User } from '../user/entities/user.entity';
import { MailService } from './services/mail.service';
import { AuthService } from './services/auth.service';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { TwoFactorService } from '../two-factor/services/two-factor-service';
import { AuthController } from './controllers/auth.controller';
import { UserService } from '../user/services/user.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      VerificationToken,
      RefreshToken,
      TwoFactorCode,
      ActiveSession,
      AuthLog,
      User,
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: {
          expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN,
        },
      }),
      inject: [ConfigService],
    }),
    PassportModule,
    // UsersModule,
  ],
  providers: [AuthService, JwtStrategy, JwtRefreshStrategy, MailService, TwoFactorService, UserService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}