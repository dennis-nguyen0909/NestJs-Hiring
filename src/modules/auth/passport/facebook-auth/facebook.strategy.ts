import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-facebook';
import { UsersService } from 'src/modules/users/users.service';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    super({
      clientID: configService.get<string>('FACEBOOK_CLIENT_ID'),
      clientSecret: configService.get<string>('FACEBOOK_CLIENT_SECRET'),
      callbackURL: configService.get<string>('FACEBOOK_CALLBACK_URL'),
      scope: ['public_profile', 'email'],
      profileFields: ['id', 'emails', 'name', 'picture'], // Đảm bảo lấy thông tin email
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: (err: any, user: any, info?: any) => void,
  ): Promise<any> {
    console.log('Facebook Profile:', profile); // In thông tin profile ra để kiểm tra

    const { name, emails } = profile;
    const email = emails && emails[0] ? emails[0].value : null;

    if (!email) {
      return done(new Error('No email found'), null); // Trả về lỗi nếu không có email
    }
    const avatar =
      profile.photos && profile.photos[0] ? profile.photos[0].value : null;
    const user = {
      email: profile._json.email,
      full_name: profile._json.last_name + '' + profile._json.first_name,
      avatar: avatar || profile._json.picture.data.url,
      accessToken,
      refreshToken,
      password: '',
      role: 'USER',
    };
    console.log();
    const createUser = await this.usersService.validateFacebookUser(user);
    done(null, createUser); // Trả về payload chứa thông tin người dùng
  }
}
