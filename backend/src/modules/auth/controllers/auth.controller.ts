import { Controller, Post, Body, UseGuards, Headers, Ip, Get, Param, UseInterceptors, ClassSerializerInterceptor, SerializeOptions } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { JwtAuthGuard } from '../guards/jwt.guard';
import { Verify2FADto } from '../dto/verify-2fa.dto';
import { CurrentUser } from '../decorators/current-user.decorator';
import { JwtRefreshGuard } from '../guards/jwt-refresh.guard';
import { User } from 'src/modules/user/entities/user.entity';
import { Auth } from '../decorators/auth.decorator';
import { ResetPasswordDto } from '../dto/reset-password.dto';


@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Headers('user-agent') userAgent: string,
    @Ip() ipAddress: string,
  ) {
    return this.authService.login(loginDto, userAgent, ipAddress);
  }

  @Post('verify-2fa')
  @UseGuards(JwtAuthGuard)
  async verify2FA(
    @Body() verify2FADto: Verify2FADto,
    @CurrentUser('id') userId: number,
    @Headers('user-agent') userAgent: string,
    @Ip() ipAddress: string,
  ) {
    const response = await this.authService.verify2FA(verify2FADto, userId, userAgent, ipAddress);
    return response;
  }

  @Post('refresh')
  @UseGuards(JwtRefreshGuard)
  async refresh(
    @CurrentUser('refreshToken') refreshToken: string,
    @Headers('user-agent') userAgent: string,
    @Ip() ipAddress: string,
  ) {
    return this.authService.refreshToken(refreshToken, userAgent, ipAddress);
  }

  @Post('forgot-password')
  async forgotPassword(@Body('email') email: string) {
    return this.authService.forgotPassword(email);
  }

  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Get('verify-email/:token')
  async verifyEmail(@Param('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  @Post('test')
  @Auth()
  async test(@CurrentUser() user : User) {
    return user;
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({
      groups: ['relation', 'user'] // sau alt grup în funcție de context
  })
  @Auth()
  @Post('me')
  async getProfile(@CurrentUser() user: User) {
    const userDetails = await this.authService.findUserById(user.id);
    return userDetails;
  }
}
