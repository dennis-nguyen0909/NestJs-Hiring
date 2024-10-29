import {
  Controller,
  Post,
  Request,
  UseGuards,
  Get,
  Body,
  UnauthorizedException,
  Response,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './passport/local-auth.guard';
import { JwtAuthGuard } from './passport/jwt-auth-guard';
import { Public, ResponseMessage } from 'src/decorator/customize';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { MailerService } from '@nestjs-modules/mailer';
import { ApiTags } from '@nestjs/swagger';
import { VerifyAuthDto } from './dto/verify-auth.dto';
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
  signIn(@Request() req) {
    return this.authService.signIn(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ResponseMessage('Success')
  getProfile(@Request() req) {
    return req.user;
  }

  @Public()
  @Post('register')
  @ResponseMessage('Success')
  register(@Body() registerDto: RegisterAuthDto) {
    return this.authService.register(registerDto);
  }

  @Get('email')
  @Public()
  @ResponseMessage('Success')
  testMail() {
    this.mailService.sendMail({
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
  verify(@Body() verifyDto: VerifyAuthDto) {
    return this.authService.verify(verifyDto);
  }

  @Post('retry-active')
  @Public()
  @ResponseMessage('Success')
  retryActive(@Body('email') email: string) {
    return this.authService.retryActive(email);
  }

  @Post('refresh-token')
  @UseGuards(JwtAuthGuard)
  @ResponseMessage('Success')
  async refreshToken(@Request() req) {
    const authHeader = req.headers['authorization'];
    const user = req.user;
    if (!authHeader) {
      throw new UnauthorizedException('No authorization header provided');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('Invalid authorization header');
    }
    console.log('authHeader', authHeader);

    // Gọi service để làm mới token
    return this.authService.refreshToken(token);
  }

  @Post('logout')
  // @Public()
  @UseGuards(JwtAuthGuard)
  @ResponseMessage('Success')
  async logout(@Request() req) {
    return this.authService.logout(req.user);
  }
}
