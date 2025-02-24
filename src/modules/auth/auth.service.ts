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
import { IAuthService } from './auth.interface';
import { User } from '../users/schemas/user.schema';
import { authenticator } from 'otplib';
@Injectable()
export class AuthService implements IAuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}
  async signIn(user: any): Promise<{
    user: {
      email: string;
      user_id: string;
      name: string;
      access_token: string;
      refresh_token: string;
    };
  }> {
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

  async validateUser(username: string, password: string): Promise<User> {
    const user = await this.userService.findByEmail(username);
    if (!user) {
      throw new BadRequestException('User not found');
    }
    const isValidPassword = await comparePasswordHelper(
      password,
      user.password,
    );
    if (!isValidPassword || !user) {
      return null;
    }

    return user;
  }

  async register(registerDto: RegisterAuthDto): Promise<{ user_id: string }> {
    return this.userService.handleRegister(registerDto);
  }

  async validateToken(token: string): Promise<User> {
    try {
      if (!token) {
        return null;
      }
      const payload = await this.jwtService.verifyAsync(token);
      const user = await this.userService.findByObjectId(payload.sub); // Lấy thông tin người dùng từ DB bằng ID trong payload
      return user; // Trả về thông tin người dùng
    } catch (error) {
      throw new UnauthorizedException('Token không hợp lệ hoặc đã hết hạn');
    }
  }

  async verify(
    verifyDto: VerifyAuthDto,
  ): Promise<{ access_token: string; refresh_token: string; user_id: string }> {
    try {
      const { id, code_id } = verifyDto;
      const findUser = await this.userService.findOneFilter(id);
      const currentDay = dayjs(); // Lấy thời gian hiện tại bằng dayjs
      if (!findUser) {
        throw new BadRequestException('User not found');
      }
      if (findUser?.code_id !== code_id) {
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
        user_id: user.user_id,
      };
    } catch (error) {
      throw new UnauthorizedException(error.message || 'Lỗi từ server');
    }
  }

  async retryActive(email: string): Promise<{ user_id: string }> {
    return this.userService.retryActive(email);
  }

  async logout(user: any): Promise<boolean> {
    return true;
  }
  async refreshToken(refreshToken: string): Promise<{
    user: {
      email: string;
      user_id: string;
      name: string;
      access_token: string;
      refresh_token: string;
    };
  }> {
    let payload: any;
    try {
      payload = await this.jwtService.verifyAsync(refreshToken);
    } catch (error) {
      throw new BadRequestException('Invalid refresh token111');
    }
    const user = await this.userService.findByObjectId(payload.sub);
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
        user_id: user._id.toString(),
        name: user.full_name,
        access_token: newAccessToken,
        refresh_token: newRefreshToken, // Include new refresh token if applicable
      },
    };
  }
  async forgotPassword(email: string): Promise<any> {
    try {
      const response = await this.userService.sendOtp(email);
      return response;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async verifyOtp(email: string, otp: string): Promise<any> {
    try {
      const response = await this.userService.verifyOtp(email, otp);
      return response;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async resetPasswordWithOtp(email:string,newPassword:string):Promise<any>{
    try {
      const response = await this.userService.resetPasswordWithOtp(email, newPassword);
      return response;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
}
