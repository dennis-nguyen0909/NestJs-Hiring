import {
  Controller,
  Post,
  Request,
  UseGuards,
  Get,
  Body,
  UnauthorizedException,
  Res,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './passport/local-auth.guard';
import { JwtAuthGuard } from './passport/jwt-auth-guard';
import { Public, ResponseMessage } from 'src/decorator/customize';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { MailerService } from '@nestjs-modules/mailer';
import { ApiTags } from '@nestjs/swagger';
import { VerifyAuthDto } from './dto/verify-auth.dto';
import { Response } from 'express';
import { GoogleAuthGuard } from './passport/google-auth/google-auth-guard';
import { FacebookAuthGuard } from './passport/facebook-auth/facebook-auth-guard';
import { User } from '../users/schemas/user.schema';
import { ConfigService } from '@nestjs/config';
@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private mailService: MailerService,
    private configService: ConfigService,
  ) {}

  @Post('login')
  @Public()
  @ResponseMessage('Success')
  @UseGuards(LocalAuthGuard)
  async signIn(
    @Request() req,
    @Res({ passthrough: true }) response: Response,
  ): Promise<{
    user: {
      email: string;
      user_id: string;
      name: string;
      access_token: string;
      refresh_token: string;
    };
  }> {
    console.log('req', req);
    const { user } = await this.authService.signIn(req.user);

    response.cookie('refresh_token', user.refresh_token, {
      httpOnly: true, // Chỉ server mới có thể truy cập cookie này, bảo vệ khỏi XSS
      maxAge: 24 * 60 * 60 * 1000, // Thời hạn 1 ngày (24 giờ)
      sameSite: 'none',
      secure: true,
      priority: 'high',
      path: '/',
      domain: 'hire-dev.online',
    });

    return { user };
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ResponseMessage('Success')
  async getProfile(@Request() req): Promise<any> {
    return await req.user;
  }

  @Public()
  @Post('register')
  @ResponseMessage('Success')
  async register(
    @Body() registerDto: RegisterAuthDto,
  ): Promise<{ user_id: string }> {
    return await this.authService.register(registerDto);
  }

  @Get('email')
  @Public()
  @ResponseMessage('Success')
  async testMail(): Promise<string> {
    await this.mailService.sendMail({
      to: 'dennis.nguyen0909@gmail.com', // list of receivers
      subject: 'Testing Nest MailerModule ✔', // Subject line
      text: 'welcome', // plaintext body
      template: 'template',
      context: {
        name: 'dennis 123123131',
        activationCode: 1231231,
      },
    });
    return 'ok';
  }
  @Get('check-token')
  @Public()
  @ResponseMessage('Success')
  async checkToken(@Request() req): Promise<{ valid: boolean; user: User }> {
    const token = req.cookies.token; // Lấy token từ cookie
    if (!token) {
      throw new UnauthorizedException('Token không được cung cấp');
    }
    const user = await this.authService.validateToken(token); // Gọi hàm validateToken
    return { valid: true, user }; // Trả về thông tin người dùng
  }

  @Post('verify')
  @Public()
  @ResponseMessage('Success')
  async verify(
    @Body() verifyDto: VerifyAuthDto,
  ): Promise<{ access_token: string; refresh_token: string; user_id: string }> {
    return await this.authService.verify(verifyDto);
  }

  @Post('retry-active')
  @Public()
  @ResponseMessage('Success')
  async retryActive(
    @Body('email') email: string,
  ): Promise<{ user_id: string }> {
    return await this.authService.retryActive(email);
  }

  @Post('refresh-token')
  @Public()
  async refreshToken(@Body('refresh_token') refreshToken: string): Promise<{
    user: {
      email: string;
      user_id: string;
      name: string;
      access_token: string;
      refresh_token: string;
    };
  }> {
    return await this.authService.refreshToken(refreshToken);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ResponseMessage('Success')
  async logout(@Request() req): Promise<boolean> {
    return await this.authService.logout(req.user);
  }

  @Public()
  @Get('google/login')
  @UseGuards(GoogleAuthGuard)
  async googleAuth(@Req() req) {
    // Route này sẽ redirect tới Google để login
  }
  @Public()
  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleAuthRedirect(@Req() req, @Res() res) {
    const response = await this.authService.signIn(req.user);
    res.redirect(
      `${this.configService.get<string>('URL_REDIRECT')}${response.user.access_token}&refresh_token=${response.user.refresh_token}`,
    );
  }

  @Public()
  @Get('facebook/login')
  @UseGuards(FacebookAuthGuard)
  async facebookAuth(@Req() req) {
    // Route này sẽ redirect tới Facebook để login
  }
  @Public()
  @Get('facebook/callback')
  @UseGuards(FacebookAuthGuard)
  async facebookAuthRedirect(@Req() req, @Res() res) {
    const response = await this.authService.signIn(req.user);
    res.redirect(
      `${this.configService.get<string>('URL_REDIRECT')}${response.user.access_token}&refresh_token=${response.user.refresh_token}`,
    );
  }

  @Post('forgot-password')
  @Public()
  @ResponseMessage('Success')
  async forgotPassword(@Body('email') email: string): Promise<any> {
    return await this.authService.forgotPassword(email);
  }

  @Post('verify-otp')
  @Public()
  @ResponseMessage('Success')
  async verifyOtp(
    @Body('email') email: string,
    @Body('otp') otp: string,
  ): Promise<any> {
    return await this.authService.verifyOtp(email, otp);
  }

  @Post('reset-new-password')
  @Public()
  @ResponseMessage('Success')
  async resetPasswordWithOtp(
    @Body('email') email: string,
    @Body('new_password') newPassword: string,
  ): Promise<any> {
    return await this.authService.resetPasswordWithOtp(email, newPassword);
  }
}
