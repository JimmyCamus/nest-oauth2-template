import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { ConfigService } from '../../config/services/config.service';
import { Response } from 'express';
import { UserInterface } from '../interfaces/user.interface';
import { CustomRequest } from '../types/request.types';

describe('auth/controllers/auth-controller', () => {
  let controller: AuthController;
  let configService: ConfigService;

  beforeEach(async () => {
    const mockConfigService = {
      authRedirectUrl: 'http://localhost:3000/redirect',
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: ConfigService, useValue: mockConfigService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should be defined and not throw', () => {
      expect(() => controller.register()).not.toThrow();
    });
  });

  describe('googleAuthRedirect', () => {
    it('should redirect with user email', () => {
      const mockUser: UserInterface = {
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        picture: 'pic.jpg',
        accessToken: 'token',
        refreshToken: 'refresh',
      };
      const req = { user: mockUser } as CustomRequest;
      const res = {
        redirect: jest.fn(),
      } as unknown as Response;

      controller.googleAuthRedirect(req, res);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(res.redirect).toHaveBeenCalledWith(
        `${configService.authRedirectUrl}?auth=${JSON.stringify(mockUser.email)}`,
      );
    });

    it('should redirect with undefined if user is missing', () => {
      const req = { user: undefined } as CustomRequest;
      const res = {
        redirect: jest.fn(),
      } as unknown as Response;

      controller.googleAuthRedirect(req, res);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(res.redirect).toHaveBeenCalledWith(
        `${configService.authRedirectUrl}?auth=${JSON.stringify(undefined)}`,
      );
    });
  });
});
