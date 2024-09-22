import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { comparePasswordHelper } from 'src/helpers/util';
import { JwtService } from '@nestjs/jwt';

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
}
