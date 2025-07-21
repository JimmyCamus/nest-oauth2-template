import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { ConfigService } from '../../config/services/config.service';
import { JwtService } from '@nestjs/jwt';
import { UserRepository } from '../repositories/user.repository';
import { PinoLogger } from 'nestjs-pino';
import { User } from '../entities/user.entity';
import { HttpException } from '@nestjs/common';
import { Response } from 'express';
import { Cache } from 'cache-manager';

describe('auth/services/auth-service', () => {
  let service: AuthService;
  let userRepository: jest.Mocked<UserRepository>;
  let logger: jest.Mocked<PinoLogger>;
  let cacheManager: jest.Mocked<Cache>;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(async () => {
    const mockConfigService = {
      nodeEnv: 'test',
      authRedirectUrl: 'http://localhost:3000/redirect',
    };

    logger = {
      error: jest.fn(),
      info: jest.fn(),
      debug: jest.fn(),
      warn: jest.fn(),
    } as unknown as jest.Mocked<PinoLogger>;

    const mockJwtService = {
      signAsync: jest.fn().mockResolvedValue('mocked.jwt.token'),
      verifyAsync: jest.fn(),
    };

    const mockUserRepository = {
      findUserByEmail: jest.fn().mockResolvedValue(null),
      createUser: jest.fn(),
    };

    const mockCacheManager = {
      get: jest.fn(),
      set: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: ConfigService, useValue: mockConfigService },
        { provide: 'PinoLogger:AuthService', useValue: logger },
        { provide: JwtService, useValue: mockJwtService },
        { provide: UserRepository, useValue: mockUserRepository },
        { provide: 'CACHE_MANAGER', useValue: mockCacheManager },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get(UserRepository);
    cacheManager = module.get('CACHE_MANAGER');
    jwtService = module.get(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createUser', () => {
    it('should create a user', async () => {
      const userData = { email: 'test@test.com' };
      const user = { id: 1, ...userData } as unknown as User;

      userRepository.createUser.mockResolvedValueOnce(user);

      const result = await service.createUser(userData);
      expect(result).toBe(user);
    });

    it('should throw if createUser fails', async () => {
      const userData = { email: 'fail@test.com' };
      userRepository.createUser.mockImplementationOnce(() => {
        throw new Error('fail');
      });

      await expect(service.createUser(userData)).rejects.toThrow(HttpException);
    });
  });

  describe('login', () => {
    it('should log in a existing user', async () => {
      const userData = { email: 'test@test.com' };
      const user = { id: 1, ...userData } as unknown as User;

      userRepository.findUserByEmail.mockImplementationOnce(() =>
        Promise.resolve(user),
      );

      const result = await service.login(userData);

      expect(result).toStrictEqual({ accessToken: 'mocked.jwt.token' });
    });

    it('should throw an error when fails to get a user', async () => {
      const userData = { email: 'test@test.com' };

      userRepository.findUserByEmail.mockImplementationOnce(() => {
        throw new Error('fail');
      });

      await expect(service.login(userData)).rejects.toThrow(HttpException);
    });

    it('should throw an error when a user is not found', async () => {
      const userData = { email: 'test@test.com' };

      userRepository.findUserByEmail.mockImplementationOnce(() =>
        Promise.resolve(null),
      );

      await expect(service.login(userData)).rejects.toThrow(HttpException);
    });

    it('should throw an error when the user data is not provided', async () => {
      await expect(service.login(undefined)).rejects.toThrow(HttpException);
    });
  });

  describe('redirectToAuthUrl', () => {
    it('should set cookie and redirect', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const req = { user: { email: 'test@test.com' } } as any;
      const res = {
        cookie: jest.fn(),
        redirect: jest.fn(),
      } as unknown as Response;
      jest
        .spyOn(service, 'login')
        .mockResolvedValue({ accessToken: 'jwt-token' });

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      await service.redirectToAuthUrl(req, res);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(res.cookie).toHaveBeenCalledWith(
        'AUTH_TOKEN',
        expect.any(String),
        expect.objectContaining({
          httpOnly: true,
          secure: true,
        }),
      );
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(res.redirect).toHaveBeenCalledWith(
        'http://localhost:3000/redirect',
      );
    });

    it('should throw if login fails', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const req = { user: { email: 'fail@test.com' } } as any;
      const res = {
        cookie: jest.fn(),
        redirect: jest.fn(),
      } as unknown as Response;
      jest.spyOn(service, 'login').mockRejectedValue(new Error('fail'));

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      await expect(service.redirectToAuthUrl(req, res)).rejects.toThrow(
        HttpException,
      );
    });
  });

  describe('getUserInfo', () => {
    const sessionId = 'session-id';

    const userInfo = {
      email: 'test@test.com',
      firstName: 'test',
      lastName: 'user',
      picture: 'http://example.com/picture.jpg',
    };

    it('should return user info from cache', async () => {
      cacheManager.get.mockResolvedValueOnce('mocked.jwt.token');
      jwtService.verifyAsync.mockResolvedValueOnce(userInfo);

      const result = await service.getUserInfo(sessionId);

      expect(result).toEqual(userInfo);
    });

    it('should throw if token is invalid in the verify process', async () => {
      cacheManager.get.mockResolvedValueOnce('invalid.token');
      jwtService.verifyAsync.mockRejectedValueOnce(new Error('Invalid token'));
      await expect(service.getUserInfo(sessionId)).rejects.toThrow(
        HttpException,
      );
    });

    it('should throw if token have invalid user info', async () => {
      cacheManager.get.mockResolvedValueOnce('invalid.token');
      jwtService.verifyAsync.mockResolvedValueOnce({
        ...userInfo,
        email: undefined,
      });
      await expect(service.getUserInfo(sessionId)).rejects.toThrow(
        HttpException,
      );
    });

    it('should throw if token is expired', async () => {
      cacheManager.get.mockResolvedValueOnce('invalid.token');
      jwtService.verifyAsync.mockRejectedValueOnce(
        new Error('TokenExpiredError'),
      );
      await expect(service.getUserInfo(sessionId)).rejects.toThrow(
        HttpException,
      );
    });
  });
});
