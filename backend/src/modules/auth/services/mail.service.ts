import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as handlebars from 'handlebars';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({...this.configService.get('email')});
  }

  async sendEmail(to: string, subject: string, template: string, context: any) {
    const templatePath = path.join(__dirname, '../templates', `${template}.hbs`);
    const templateContent = await fs.readFile(templatePath, 'utf-8');
    const compiledTemplate = handlebars.compile(templateContent);
    const html = compiledTemplate(context);

    await this.transporter.sendMail({
      // completeaza from din: this.configService.get('MAIL_FROM_ADDRESS') this.configService.get('MAIL_FROM_NAME')
      from: this.configService.get('MAIL_FROM_ADDRESS'),
      to,
      subject,
      html,
    });
  }

  async sendVerificationEmail(to: string, token: string) {
    const verificationUrl = `${process.env.BACKEND_URL}/auth/verify-email/${token}`;

    await this.sendEmail(to, 'Verify your email', 'email-verification', {
      verificationUrl,
    });
  }

  async sendPasswordResetEmail(to: string, token: string) {
    const resetUrl = `${process.env.BACKEND_URL}/auth/reset-password/${token}`;

    await this.sendEmail(to, 'Reset your password', 'password-reset', {
      resetUrl,
    });
  }

  async send2FACodeEmail(to: string, code: string) {
    await this.sendEmail(to, '2FA Code', '2fa-code', {
      code,
    });
  }
}
