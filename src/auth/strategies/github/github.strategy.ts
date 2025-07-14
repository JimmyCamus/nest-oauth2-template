import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-github2';
import { ConfigService } from '../../../config/services/config.service';
import { Injectable } from '@nestjs/common';
import { UserInterface } from '../../interfaces/user.interface';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.githubSecrets.clientId,
      clientSecret: configService.githubSecrets.clientSecret,
      callbackURL: configService.githubSecrets.callbackUrl,
      scope: ['user:email'],
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
