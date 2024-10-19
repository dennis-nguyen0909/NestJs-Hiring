import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { comparePasswordHelper } from 'src/helpers/util';
import { JwtService } from '@nestjs/jwt';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { VerifyAuthDto } from './dto/verify-auth.dto';
import * as dayjs from 'dayjs';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}
  async signIn(user: any): Promise<any> {
    const payload = { sub: user._id, username: user.email, role: user.role };
    const access_token = await this.jwtService.signAsync(payload, {
      expiresIn: this.configService.get<string>('JWT_ACCESS_TOKEN_EXPIRED'),
    });
    const refresh_token = await this.jwtService.signAsync(payload, {
      expiresIn: this.configService.get<string>('JWT_REFRESH_TOKEN_EXPIRED'),
    });
    if (user.error_code === 400) {
      return user;
    }
    return {
      user: {
        email: user.email,
        user_id: user._id,
        name: user.name,
        access_token,
        refresh_token,
      },
    };
  }

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.userService.findByEmail(username);
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
    return this.userService.handleRegister(registerDto);
  }

  async validateToken(token: string): Promise<any> {
    try {
      if (!token) {
        return null;
      }
      const payload = await this.jwtService.verifyAsync(token);
      const user = await this.userService.findOne(payload.sub); // Lấy thông tin người dùng từ DB bằng ID trong payload
      return user; // Trả về thông tin người dùng
    } catch (error) {
      throw new UnauthorizedException('Token không hợp lệ hoặc đã hết hạn');
    }
  }

  async verify(verifyDto: VerifyAuthDto): Promise<any> {
    try {
      const { id, code_id } = verifyDto;
      const user = await this.userService.findOne(id);
      const currentDay = dayjs(); // Lấy thời gian hiện tại bằng dayjs
      if (!user) {
        return {
          message: ['User not found'],
          error_code: 400,
          data: [],
        };
      }

      if (user.code_id !== code_id) {
        return {
          message: ['Code not correct'],
          error_code: 400,
          data: [],
        };
      }

      const updateUser = await this.userService.updateAfterVerify(id, true);
      if (!updateUser) {
        return {
          message: ['Update user failed'],
          error_code: 400,
          data: [],
        };
      }
      // Kiểm tra xem mã đã hết hạn hay chưa
      if (dayjs(user.code_expired).isBefore(currentDay)) {
        return {
          message: ['Code expired'],
          error_code: 400,
          data: [],
        };
      }

      const { access_token, refresh_token } = await this.signIn(user);
      return {
        message: ['Success'],
        error_code: 0,
        data: {
          access_token,
          refresh_token,
        },
      };
    } catch (error) {
      throw new UnauthorizedException(error.message || 'Lỗi từ server');
    }
  }

  async retryActive(email: string): Promise<any> {
    return this.userService.retryActive(email);
  }
}
