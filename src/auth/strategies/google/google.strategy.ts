import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-google-oauth20';
import { ConfigService } from '../../../config/services/config.service';
import { UserInterface } from '../../interfaces/user.interface';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.googleSecrets.clientId,
      clientSecret: configService.googleSecrets.clientSecret,
      callbackURL: configService.googleSecrets.callbackUrl,
      scope: ['email', 'profile'],
    });
  }

  validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: (error: any, user?: UserInterface) => void,
  ) {
    const { name, emails, photos } = profile;

    const user: UserInterface = {
      email: emails?.[0].value,
      firstName: name?.givenName,
      lastName: name?.familyName,
      picture: photos?.[0].value,
      accessToken,
      refreshToken,
    };

    done(null, user);
  }
}
