import { Inject, Injectable } from '@nestjs/common';
import { User } from '../entities/user.entity';
import { UserRepository } from '../repositories/user.repository';
import { JwtService } from '@nestjs/jwt';
import { UserInterface } from '../interfaces/user.interface';
import { CustomRequest } from '../types/request.types';
import { Response } from 'express';
import { ConfigService } from '../../config/services/config.service';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { v4 as uuidv4 } from 'uuid';
import { AUTH_COOKIE_NAME } from '../constants/cookie';
import { AuthException } from '../exceptions/auth.exception';

@Injectable()
export class AuthService {
  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
    @InjectPinoLogger(AuthService.name)
    private readonly logger: PinoLogger,
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async createUser(userData: Partial<User>): Promise<User> {
    try {
      const user = this.userRepository.createUser(userData);

      return user;
    } catch (error) {
      this.logger.error(error, 'Error finding user by email');
      throw new AuthException();
    }
  }

  async login(userData: Partial<UserInterface> | undefined) {
    if (!userData || !userData.email) {
      throw AuthException.emailRequired();
    }

    let user: User | null;

    try {
      user = await this.userRepository.findUserByEmail(userData.email);
    } catch (error) {
      this.logger.error(error, 'Error finding user by email');
      throw new AuthException();
    }

    let currentUser: User | null = user;

    if (!user) {
      try {
        currentUser = await this.userRepository.createUser(userData);
      } catch (error) {
        this.logger.error(error, 'Error trying to create user');
        throw new AuthException();
      }
    }

    if (!currentUser) {
      throw AuthException.userCreatationFailed(userData.email);
    }

    const token = await this.jwtService.signAsync({
      email: currentUser.email,
      id: currentUser.id,
      firstName: currentUser.firstName,
      lastName: currentUser.lastName,
      picture: currentUser.picture,
    });

    return { accessToken: token };
  }

  async redirectToAuthUrl(req: CustomRequest, res: Response) {
    let token: { accessToken: string };

    try {
      token = await this.login(req?.user);
    } catch (error) {
      this.logger.error(error, 'Error during login');
      throw AuthException.authenticationFailed();
    }

    const uuid = uuidv4();
    await this.cacheManager.set(uuid, token.accessToken);

    res.cookie(AUTH_COOKIE_NAME, uuid, {
      httpOnly: true,
      secure: this.configService.nodeEnv !== 'development',
    });

    res.redirect(`${this.configService.authRedirectUrl}`);
  }

  async getUserInfo(sessionId: string): Promise<Partial<UserInterface>> {
    const userToken = await this.cacheManager.get<string>(sessionId);

    if (!userToken) {
      throw AuthException.invalidToken();
    }

    try {
      const userInfo = await this.jwtService.verifyAsync<
        Partial<UserInterface>
      >(userToken, {
        secret: this.configService.jwtSecret,
      });

      if (!userInfo || !userInfo.email) {
        throw AuthException.invalidToken();
      }

      return {
        email: userInfo.email,
        firstName: userInfo.firstName,
        lastName: userInfo.lastName,
        picture: userInfo.picture,
      };
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (error?.name === 'TokenExpiredError') {
        await this.cacheManager.del(sessionId);
        throw AuthException.tokenExpired();
      }

      throw AuthException.invalidToken();
    }
  }
}
