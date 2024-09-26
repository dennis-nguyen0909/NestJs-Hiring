import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { comparePasswordHelper } from 'src/helpers/util';
import { JwtService } from '@nestjs/jwt';
import { RegisterAuthDto } from './dto/register-auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private UserService: UsersService,
    private jwtService: JwtService,
  ) {}
  async signIn(user: any): Promise<any> {
    const payload = { sub: user._id, username: user.email };
    const access_token = await this.jwtService.signAsync(payload);
    return {
      access_token,
    };
  }

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.UserService.findByEmail(username);
    const isValidPassword = await comparePasswordHelper(
      password,
      user.password,
    );

    if (!isValidPassword || !user) {
      return null;
    }

    return user;
  }

  async register(registerDto: RegisterAuthDto): Promise<any> {
    return this.UserService.handleRegister(registerDto);
  }

  async validateToken(token: string): Promise<any> {
    try {
      if(!token){
        return null;
      }
      const payload = await this.jwtService.verifyAsync(token);
      const user = await this.UserService.findOne(payload.sub); // Lấy thông tin người dùng từ DB bằng ID trong payload
      return user; // Trả về thông tin người dùng
    } catch (error) {
      throw new UnauthorizedException('Token không hợp lệ hoặc đã hết hạn');
    }
  }
}
