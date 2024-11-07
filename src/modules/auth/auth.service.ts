import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
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
      expiresIn: '10s',
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
      const findUser = await this.userService.findOne(id);
      const currentDay = dayjs(); // Lấy thời gian hiện tại bằng dayjs
      if (!findUser) {
        throw new BadRequestException('User not found');
      }

      if (findUser.code_id !== code_id) {
        throw new BadRequestException('Code not correct');
      }

      const updateUser = await this.userService.updateAfterVerify(id, true);
      if (!updateUser) {
        throw new BadRequestException('Update user failed');
      }
      // Kiểm tra xem mã đã hết hạn hay chưa
      if (dayjs(findUser.code_expired).isBefore(currentDay)) {
        throw new BadRequestException('Code expired');
      }

      const { user } = await this.signIn(findUser);
      return {
        access_token: user.access_token,
        refresh_token: user.refresh_token,
      };
    } catch (error) {
      throw new UnauthorizedException(error.message || 'Lỗi từ server');
    }
  }

  async retryActive(email: string): Promise<any> {
    return this.userService.retryActive(email);
  }

  async logout(user: any) {
    return true;
  }
  async refreshToken(refreshToken: string) {
    let payload: any;
    console.log("duydeptrai",refreshToken)
    try {
      payload = await this.jwtService.verifyAsync(refreshToken);
    } catch (error) {
      throw new BadRequestException('Invalid refresh token');
    }

    const user = await this.userService.findOne(payload.sub);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Create new access token
    const newAccessToken = await this.jwtService.signAsync(
      { sub: user._id, username: user.email, role: user.role },
      {
        expiresIn: this.configService.get<string>('JWT_ACCESS_TOKEN_EXPIRED'),
      },
    );

    // Optionally, you can create a new refresh token if needed
    const newRefreshToken = await this.jwtService.signAsync(
      { sub: user._id, username: user.email, role: user.role },
      {
        expiresIn: this.configService.get<string>('JWT_REFRESH_TOKEN_EXPIRED'),
      },
    );

    return {
      user: {
        email: user.email,
        user_id: user._id,
        name: user.full_name,
        access_token: newAccessToken,
        refresh_token: newRefreshToken, // Include new refresh token if applicable
      },
    };
  }
}
