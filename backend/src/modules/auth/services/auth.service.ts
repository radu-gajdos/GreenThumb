import { Injectable, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, MoreThan, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { UserService } from 'src/modules/user/services/user.service';
import { MailService } from './mail.service';
import { TwoFactorService } from 'src/modules/two-factor/services/two-factor-service';
import { VerificationToken } from '../entities/verificationToken.entity';
import { RefreshToken } from '../entities/refreshToken.entity';
import { TwoFactorCode } from '../entities/twoFactorCode.entity';
import { ActiveSession } from '../entities/activeSession.entity';
import { AuthLog } from '../entities/authLog.entity';
import { User } from 'src/modules/user/entities/user.entity';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { Verify2FADto } from '../dto/verify-2fa.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { PayloadTokenInterface } from '../interfaces/payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly mailService: MailService,
    private readonly jwtService: JwtService,
    private readonly twoFactorService: TwoFactorService,
    @InjectRepository(VerificationToken)
    private verificationTokensRepository: Repository<VerificationToken>,
    @InjectRepository(RefreshToken)
    private refreshTokensRepository: Repository<RefreshToken>,
    @InjectRepository(TwoFactorCode)
    private twoFactorCodesRepository: Repository<TwoFactorCode>,
    @InjectRepository(ActiveSession)
    private activeSessionsRepository: Repository<ActiveSession>,
    @InjectRepository(AuthLog)
    private authLogRepository: Repository<AuthLog>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) { }

  async register(registerDto: RegisterDto) {
    // Check if user exists
    const existingUser = await this.userService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new BadRequestException('User already exists');
    }

    const user = await this.userService.create(registerDto);

    // Generate email verification token
    const verificationToken = await this.createVerificationToken(user.id, 'email');

    // Send verification email
    await this.mailService.sendVerificationEmail(user.email, verificationToken.token);
    return { message: 'Registration successful. Please verify your email.' };
  }

  async login(loginDto: LoginDto, userAgent: string, ipAddress: string) {
    const user = await this.validateUser(loginDto.email, loginDto.password);

    if (!user.emailVerified) {
      throw new UnauthorizedException('Please verify your email first.');
    }

    // Generate tokens direct – fără 2FA
    const newTokens = await this.generateTokens(user.id, true, loginDto.rememberMe);

    // Creăm sesiune activă doar pentru login-ul complet
    await this.createActiveSession(
      user.id,
      newTokens.refreshTokenId,
      userAgent,
      ipAddress
    );

    return {
      accessToken: newTokens.accessToken,
      refreshToken: newTokens.refreshToken,
    };
  }


  async verify2FA(verify2FADto: Verify2FADto, userId: string, userAgent: string, ipAddress: string) {
    const user = await this.userService.findById(userId);

    if (!user.twoFactorEnabled) {
      throw new BadRequestException('2FA is not enabled');
    }

    let isCodeValid = false;
    if (user.twoFactorType === 'app') {
      isCodeValid = await this.twoFactorService.verifyCode(user, verify2FADto.token);
    } else {
      const hashedCode = crypto.createHash('md5').update(verify2FADto.token).digest('hex');
      const code = await this.twoFactorCodesRepository.findOne({
        where: {
          userId,
          code: hashedCode,
          usedAt: IsNull(),
          expiresAt: MoreThan(new Date()),
        },
      });

      if (code) {
        code.usedAt = new Date();
        await this.twoFactorCodesRepository.save(code);
        isCodeValid = true;
      }
    }

    if (!isCodeValid) {
      throw new UnauthorizedException('Invalid 2FA code');
    }

    const tokens = await this.generateTokens(userId, true, verify2FADto.rememberMe);

    // Creăm sesiune activă după verificarea 2FA
    await this.createActiveSession(
      userId,
      tokens.refreshTokenId,
      userAgent,
      ipAddress
    );

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async refreshToken(refreshToken: string, userAgent: string, ipAddress: string) {
    const decoded = this.jwtService.verify(refreshToken);
    const storedToken = await this.refreshTokensRepository.findOne({
      where: {
        userId: decoded.sub,
        token: refreshToken,
        revokedAt: IsNull(),
        expiresAt: MoreThan(new Date()),
      },
    });

    if (!storedToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Generăm tokenuri noi, păstrând is2FAAuthenticated și isRememberMe
    const {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      refreshTokenId: newRefreshTokenId
    } = await this.generateTokens(
      decoded.sub,
      decoded.is2FAAuthenticated, // păstrăm starea 2FA
      storedToken.isRememberMe    // păstrăm remember me
    );

    // Revocăm vechiul token
    storedToken.revokedAt = new Date();
    storedToken.replacedByToken = newRefreshToken;
    await this.refreshTokensRepository.save(storedToken);

    // Actualizăm sesiunea activă
    await this.activeSessionsRepository.update(
      { refreshTokenId: storedToken.id },
      {
        refreshTokenId: newRefreshTokenId,
        lastActivityAt: new Date(),
      },
    );

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  private async generateTokens(
    userId: string,
    is2FAAuthenticated: boolean,
    rememberMe: boolean
  ): Promise<{ accessToken: string; refreshToken: string; refreshTokenId: number; }> {
    const user = await this.userService.findById(userId);

    const payload: PayloadTokenInterface = {
      sub: userId,
      is2FAAuthenticated,
      passwordResetCount: user.passwordResetCount,
    };

    const [accessToken, refreshToken] = await Promise.all([
      // Access token - scurt termen (15 minute)
      this.jwtService.signAsync(payload, {
        expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN,
      }),
      // Refresh token - termen lung bazat pe rememberMe
      this.jwtService.signAsync(
        { ...payload, tokenType: 'refresh' },
        {
          expiresIn: rememberMe ? process.env.JWT_REFRESH_TOKEN_EXPIRES_IN_REMEMBER : process.env.JWT_REFRESH_TOKEN_EXPIRES_IN, // 9 months or 2 days
        }
      ),
    ]);

    // Salvăm refresh token-ul în baza de date
    const refreshTokenEntity = await this.refreshTokensRepository.save({
      userId,
      token: refreshToken,
      expiresAt: new Date(Date.now() + (rememberMe ? parseInt(process.env.JWT_REFRESH_TOKEN_EXPIRES_IN_SECONDS_REMEMBER!) : parseInt(process.env.JWT_REFRESH_TOKEN_EXPIRES_IN_SECONDS!))),
      isRememberMe: rememberMe,
    });

    return { accessToken, refreshToken, refreshTokenId: refreshTokenEntity.id };
  }

  private async createActiveSession(
    userId: string,
    refreshTokenId: number,
    userAgent: string,
    ipAddress: string,
  ) {
    const session = this.activeSessionsRepository.create({
      userId,
      refreshTokenId,
      userAgent,
      ipAddress,
      lastActivityAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    });

    return await this.activeSessionsRepository.save(session);
  }

  private async createVerificationToken(userId: string, type: 'email' | 'reset') {
    const token = crypto.randomBytes(32).toString('hex');
    const hashedCode = crypto.createHash('md5').update(token).digest('hex');

    const verificationToken = this.verificationTokensRepository.create({
      userId,
      token: hashedCode,
      type,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    });

    await this.verificationTokensRepository.save(verificationToken);
    return { token };
  }

  async forgotPassword(email: string) {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      // Return success even if user doesn't exist to prevent email enumeration
      return { message: 'If an account exists with this email, a password reset link has been sent.' };
    }

    const { token } = await this.createVerificationToken(user.id, 'reset');
    await this.mailService.sendPasswordResetEmail(user.email, token);

    return { message: 'Password reset email sent successfully.' };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const hashedToken = crypto.createHash('md5').update(resetPasswordDto.token).digest('hex');
    const verificationToken = await this.verificationTokensRepository.findOne({
      where: {
        token: hashedToken,
        type: 'reset',
        usedAt: IsNull(),
        expiresAt: MoreThan(new Date()),
      },
      relations: ['user'],
    });

    if (!verificationToken) {
      throw new BadRequestException('Invalid or expired token');
    }

    await this.userService.updateWithRedis(verificationToken.userId, {
      password: resetPasswordDto.password,
      passwordChangedAt: new Date(),
      passwordResetCount: verificationToken.user.passwordResetCount + 1,
    });

    verificationToken.usedAt = new Date();
    await this.verificationTokensRepository.save(verificationToken);

    // Revoke all refresh tokens
    await this.refreshTokensRepository.update(
      { userId: verificationToken.userId, revokedAt: IsNull() },
      { revokedAt: new Date() },
    );

    // Delete all active sessions
    await this.activeSessionsRepository.delete({ userId: verificationToken.userId });
    return { message: 'Password reset successful. Please login with your new password.' };
  }

  async verifyEmail(token: string) {
    const hashedToken = crypto.createHash('md5').update(token).digest('hex');

    const verificationToken = await this.verificationTokensRepository.findOne({
      where: {
        token: hashedToken,
        type: 'email',
        usedAt: IsNull(),
        expiresAt: MoreThan(new Date()),
      },
      relations: ['user'],
    });

    if (!verificationToken) {
      throw new BadRequestException('Invalid or expired token');
    }

    await this.userService.update(verificationToken.userId, {
      emailVerified: new Date(),
    });

    verificationToken.usedAt = new Date();
    await this.verificationTokensRepository.save(verificationToken);

    return { message: 'Email verified successfully.' };
  }

  async validateUser(email: string, password: string) {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Wrong email or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Wrong email or password');
    }

    return user;
  }

  async logout(userId: string, refreshToken: string) {
    const token = await this.refreshTokensRepository.findOne({
      where: { userId: userId, token: refreshToken, revokedAt: IsNull() },
    });

    if (token) {
      token.revokedAt = new Date();
      await this.refreshTokensRepository.save(token);
      await this.activeSessionsRepository.delete({ refreshTokenId: token.id });
    }

    return { message: 'Logged out successfully' };
  }

  async logoutFromAllDevices(userId: string) {
    await this.refreshTokensRepository.update(
      { userId, revokedAt: IsNull() },
      { revokedAt: new Date() }
    );

    await this.activeSessionsRepository.delete({ userId });

    return { message: 'Logged out from all devices' };
  }

  async getActiveSessions(userId: string) {
    return this.activeSessionsRepository.find({
      where: { userId },
      select: ['id', 'userAgent', 'ipAddress', 'lastActivityAt', 'createdAt'],
    });
  }

  private async generateTwoFactorCode(userId: string): Promise<string> {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedCode = crypto.createHash('md5').update(code).digest('hex');

    await this.twoFactorCodesRepository.save({
      userId,
      code: hashedCode,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    });

    return code;
  }

  private async sendTwoFactorCodeEmail(user: User) {
    const code = await this.generateTwoFactorCode(user.id);
    await this.mailService.send2FACodeEmail(user.email, code);
  }

  async logActivity(data: {
    userId: string;
    action: string;
    ip: string;
    userAgent: string;
    statusCode: number;
    duration: number;
  }): Promise<void> {
    const log = this.authLogRepository.create(data);
    await this.authLogRepository.save(log);
  }

  async findUserById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}