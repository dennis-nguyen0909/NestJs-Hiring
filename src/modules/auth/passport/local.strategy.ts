import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '../auth.service';
import { UserNotActiveException } from 'src/exceptions';
import { User } from 'src/modules/users/schemas/User.schema';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super();
  }

  async validate(username: string, password: string): Promise<User> {
    const user = await this.authService.validateUser(username, password);
    if (!user) {
      throw new BadRequestException('Username or password is incorrect');
    }
    if (user?.is_active === false) {
      throw new UserNotActiveException(user._id + '');
    }
    return user;
  }
}
