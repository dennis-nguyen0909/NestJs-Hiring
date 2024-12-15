import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../../auth.service';
import { UsersService } from 'src/modules/users/users.service';
import { AuthProviderService } from 'src/modules/auth-provider/auth-provider.service';
import { GMAIL } from '../utils';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
    private authProviderService: AuthProviderService,
  ) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL'),
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { name, emails, photos } = profile;
    const authProvider = await this.authProviderService.findDynamic({
      provider_id: GMAIL,
    });
    const user = {
      email: emails[0].value,
      full_name: name.familyName + ' ' + name.givenName,
      avatar: photos[0].value,
      accessToken,
      refreshToken,
      password: '',
      // role: 'USER',
      authProvider: authProvider?._id,
      account_type: authProvider?._id,
    };
    const createUser = await this.usersService.validateGoogleUser(user);
    done(null, createUser);
  }
}
