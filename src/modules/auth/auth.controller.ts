import {
  Controller,
  Post,
  Request,
  UseGuards,
  Get,
  Body,
  UnauthorizedException,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './passport/local-auth.guard';
import { JwtAuthGuard } from './passport/jwt-auth-guard';
import { Public, ResponseMessage } from 'src/decorator/customize';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { MailerService } from '@nestjs-modules/mailer';
import { ApiTags } from '@nestjs/swagger';
import { VerifyAuthDto } from './dto/verify-auth.dto';
import { Request as RequestExpress, Response } from 'express';
@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private mailService: MailerService,
  ) {}

  @Post('login')
  @Public()
  @ResponseMessage('Success')
  @UseGuards(LocalAuthGuard)
  async signIn(@Request() req, @Res({ passthrough: true }) response: Response) {
    const { user } = await this.authService.signIn(req.user);
    response.cookie('refresh_token', user.refresh_token, {
      httpOnly: true, // Chỉ server mới có thể truy cập cookie này, bảo vệ khỏi XSS
      maxAge: 24 * 60 * 60 * 1000, // Thời hạn 1 ngày (24 giờ)
      secure: true, // Chỉ gửi cookie qua HTTPS (bật trong môi trường production)
      sameSite: 'strict',
    });
    return { user };
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ResponseMessage('Success')
  async getProfile(@Request() req) {
    return await req.user;
  }

  @Public()
  @Post('register')
  @ResponseMessage('Success')
  async register(@Body() registerDto: RegisterAuthDto) {
    return await this.authService.register(registerDto);
  }

  @Get('email')
  @Public()
  @ResponseMessage('Success')
  async testMail() {
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
  async checkToken(@Request() req) {
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
  async verify(@Body() verifyDto: VerifyAuthDto) {
    return await this.authService.verify(verifyDto);
  }

  @Post('retry-active')
  @Public()
  @ResponseMessage('Success')
  async retryActive(@Body('email') email: string) {
    return await this.authService.retryActive(email);
  }

  @Post('refresh-token')
  // @UseGuards(RefreshTokenGuard)
  @ResponseMessage('Success')
  // @Public()
  async refreshToken(@Request() req: RequestExpress, @Request() reqUser) {
    const refresh_token = req.cookies.refresh_token;
    return await this.authService.refreshToken(refresh_token);
  }

  @Post('logout')
  // @Public()
  @UseGuards(JwtAuthGuard)
  @ResponseMessage('Success')
  async logout(@Request() req) {
    return await this.authService.logout(req.user);
  }
}
