import { RegisterAuthDto } from './dto/register-auth.dto';
import { VerifyAuthDto } from './dto/verify-auth.dto';
import { User } from '../users/schemas/User.schema';

export interface IAuthService {
  signIn(user: any): Promise<{
    user: {
      email: string;
      user_id: string;
      name: string;
      access_token: string;
      refresh_token: string;
    };
  }>;
  validateUser(username: string, password: string): Promise<User>;
  register(registerDto: RegisterAuthDto): Promise<any>;
  validateToken(token: string): Promise<User | null>;
  verify(verifyDto: VerifyAuthDto): Promise<any>;
  retryActive(email: string): Promise<{ user_id: string }>;
  logout(user: any): Promise<boolean>;
  refreshToken(refreshToken: string): Promise<any>;
}
