import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super();
  }

  async validate(username: string, password: string): Promise<any> {
    const user = await this.authService.validateUser(username, password);
    if (!user) {
      // throw new BadRequestException('Username or password is incorrect');
      return {
        message: ['Username or password is incorrect'],
        error_code: 400,
      }
    }

    if (user.is_active === false) {
      throw new BadRequestException('User not active');
      // return {
      //   messages: ['User is not active'],
      //   error_code: 400,
      //   data: [],
      // };
    }
    return user;
  }
}
