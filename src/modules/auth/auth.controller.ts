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
import { Public } from 'src/decorator/customize';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { MailerService } from '@nestjs-modules/mailer';
import { ApiTags } from '@nestjs/swagger';
@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private mailService: MailerService,
  ) {}

  @Post('login')
  @Public()
  @UseGuards(LocalAuthGuard)
  async signIn(@Request() req, @Response() res) {
    const { access_token } = await this.authService.signIn(req.user);
    res.cookie('token', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 3600000,
    });

    return res.status(200).json({ message: 'Login successful' });
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }

  @Public()
  @Post('register')
  register(@Body() registerDto: RegisterAuthDto) {
    return this.authService.register(registerDto);
  }

  @Get('email')
  @Public()
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
  async checkToken(@Request() req) {
    const token = req.cookies.token; // Lấy token từ cookie
    if (!token) {
      throw new UnauthorizedException('Token không được cung cấp');
    }
    const user = await this.authService.validateToken(token); // Gọi hàm validateToken
    return { valid: true, user }; // Trả về thông tin người dùng
  }

}
