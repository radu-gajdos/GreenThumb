import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { authenticator } from 'otplib';
import * as QRCode from 'qrcode';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';
import { UserService } from 'src/modules/user/services/user.service';
import { User } from 'src/modules/user/entities/user.entity';

@Injectable()
export class TwoFactorService {
  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {
    authenticator.options = {
      window: 1,
      step: 30
    };
  }

  // enable email method
  async enableEmail(userId: string) {
    const user = await this.userService.findById(userId);
    if (user.twoFactorEnabled && user.twoFactorType === 'email') {
      throw new BadRequestException('2FA este deja activat cu mailul.');
    }
    await this.userService.updateWithRedis(userId, {
      twoFactorSecret: undefined,
      twoFactorEnabled: true,
      twoFactorType: 'email'
    });
    return { message: '2FA a fost activat cu succes.' };
  }

  // enable google authentificator method
  async enable(userId: string) {
    const user = await this.userService.findById(userId);

    const secret = authenticator.generateSecret();
    const appName = process.env.TWO_FACTOR_APP_NAME || 'NestJS 2FA';
    const otpauthUrl = authenticator.keyuri(user.email, appName, secret);
    const qrCode = await QRCode.toDataURL(otpauthUrl);

    await this.userService.updateWithRedis(userId, {
      twoFactorSecret: secret,
      twoFactorEnabled: false,
      twoFactorType: 'app'
    });

    return {
      qrCode
    };
  }

  // verify setup method
  async verifySetup(userId: string, token: string) {
    const user = await this.userService.findById(userId);

    if (!user.twoFactorSecret) {
      throw new BadRequestException('2FA nu a fost inițializat');
    }

    if (user.twoFactorEnabled && user.twoFactorType === 'app') {
      throw new BadRequestException('2FA este deja activat');
    }

    const isValid = authenticator.verify({
      token,
      secret: user.twoFactorSecret
    });

    if (!isValid) {
      throw new UnauthorizedException('Codul introdus este invalid');
    }

    const backupCodes = this.generateBackupCodes();
    const hashedBackupCodes = await this.hashBackupCodes(backupCodes);

    await this.userService.updateWithRedis(userId, {
      twoFactorEnabled: true,
      twoFactorType: 'app',
      twoFactorRecoveryCodes: JSON.stringify(hashedBackupCodes)
    });

    return {
      message: '2FA a fost activat cu succes',
      backupCodes
    };
  }

  // functie care verifica codul de 2FA din aplicatia google authenticator
  async verifyCode(user: User, token: string) {
    if(!user.twoFactorSecret){
      throw new BadRequestException('2FA nu a fost inițializat');
    }
    const isValid = authenticator.verify({
      token,
      secret: user.twoFactorSecret
    });

    if (!isValid && user.twoFactorRecoveryCodes) {
      return await this.verifyBackupCode(user, token);
    }

    return isValid;
  }

  // functie care dezactiveaza 2FA
  async disable(userId: string) {
    const user = await this.userService.findById(userId);

    if (!user.twoFactorEnabled) {
      throw new BadRequestException('2FA nu este activat');
    }

    await this.userService.updateWithRedis(userId, {
      twoFactorEnabled: false,
      twoFactorSecret: undefined,
      twoFactorRecoveryCodes: undefined
    });

    return { message: '2FA a fost dezactivat cu succes' };
  }

  // functie care genereaza noi coduri de backup
  async generateNewBackupCodes(userId: string) {
    const user = await this.userService.findById(userId);

    if (!user.twoFactorEnabled) {
      throw new BadRequestException('2FA nu este activat');
    }

    const backupCodes = this.generateBackupCodes();
    const hashedBackupCodes = await this.hashBackupCodes(backupCodes);

    await this.userService.updateWithRedis(userId, {
      twoFactorRecoveryCodes: JSON.stringify(hashedBackupCodes)
    });

    return {
      message: 'Noi coduri de backup au fost generate',
      backupCodes
    };
  }

  // functie care genereaza coduri de backup
  private generateBackupCodes(): string[] {
    return Array.from({ length: 10 }, () =>
      crypto.randomBytes(4).toString('hex')
    );
  }

  // functie care hashuieste codurile de backup
  private async hashBackupCodes(codes: string[]): Promise<string[]> {
    return Promise.all(
      codes.map(code => bcrypt.hash(code, 12))
    );
  }

  // functie care verifica codul de backup
  private async verifyBackupCode(user: User, token: string): Promise<boolean> {
    const backupCodes = JSON.parse(user.twoFactorRecoveryCodes ? user.twoFactorRecoveryCodes : '[]');

    for (let i = 0; i < backupCodes.length; i++) {
      const isBackupValid = await bcrypt.compare(token, backupCodes[i]);
      if (isBackupValid) {
        backupCodes.splice(i, 1);
        await this.userService.updateWithRedis(user.id, {
          twoFactorRecoveryCodes: JSON.stringify(backupCodes)
        });
        return true;
      }
    }

    return false;
  }
}
