import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { ConfigService } from '../../config/services/config.service';
import { Response } from 'express';
import { UserInterface } from '../interfaces/user.interface';
import { CustomRequest } from '../types/request.types';
import { AuthService } from '../services/auth.service';

describe('auth/controllers/auth-controller', () => {
  let controller: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const mockConfigService = {
      authRedirectUrl: 'http://localhost:3000/redirect',
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: ConfigService, useValue: mockConfigService },
        {
          provide: AuthService,
          useValue: {
            redirectToAuthUrl: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('googleAuthRedirect', () => {
    it('should redirect with user email', async () => {
      const mockUser: UserInterface = {
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        picture: 'pic.jpg',
      };
      const req = { user: mockUser } as CustomRequest;
      const res = {
        redirect: jest.fn(),
      } as unknown as Response;

      await controller.googleAuthRedirect(req, res);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(authService.redirectToAuthUrl).toHaveBeenCalledWith(req, res);
    });

    it('should redirect with undefined if user is missing', async () => {
      const req = { user: undefined } as CustomRequest;
      const res = {
        redirect: jest.fn(),
      } as unknown as Response;

      await controller.googleAuthRedirect(req, res);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(authService.redirectToAuthUrl).toHaveBeenCalledWith(req, res);
    });
  });
});
