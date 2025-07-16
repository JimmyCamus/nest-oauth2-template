import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { User } from '../entities/user.entity';
import { UserRepository } from '../repositories/user.repository';
import { JwtService } from '@nestjs/jwt';
import { UserInterface } from '../interfaces/user.interface';
import { CustomRequest } from '../types/request.types';
import { Response } from 'express';
import { ConfigService } from '../../config/services/config.service';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

const AUTH_COOKIE_NAME = 'AUTH_TOKEN';

@Injectable()
export class AuthService {
  constructor(
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
      throw new HttpException(
        `Error finding user with email ${userData.email}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async login(userData: Partial<UserInterface> | undefined) {
    if (!userData || !userData.email) {
      throw new HttpException(`Email is required`, HttpStatus.BAD_REQUEST);
    }

    let user: User | null;

    try {
      user = await this.userRepository.findUserByEmail(userData.email);
    } catch (error) {
      this.logger.error(error, 'Error finding user by email');
      throw new HttpException(
        `Error finding user with email ${userData.email}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    let currentUser: User | null = user;

    if (!user) {
      try {
        currentUser = await this.userRepository.createUser(userData);
      } catch (error) {
        this.logger.error(error, 'Error trying to create user');
        throw new HttpException(
          `Error creating user with email ${userData.email}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }

    if (!currentUser) {
      throw new HttpException(
        `User with email ${userData.email} could not be created`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const token = await this.jwtService.signAsync({
      email: currentUser.email,
      id: currentUser.id,
      name: currentUser.firstName,
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
      throw new HttpException(
        'Authentication failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    res.cookie(AUTH_COOKIE_NAME, token.accessToken, {
      httpOnly: true,
      secure: this.configService.nodeEnv !== 'development',
    });

    res.redirect(`${this.configService.authRedirectUrl}`);
  }
}
