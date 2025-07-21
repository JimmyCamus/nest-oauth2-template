import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { AUTH_HEADER_NAME } from '../constants/cookie';
import { AuthService } from '../services/auth.service';
import { Request } from 'express';

@Injectable()
export class TokenGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    const sessionId = request.headers?.[AUTH_HEADER_NAME] as string | undefined;

    if (!sessionId) {
      throw new HttpException(
        'There is no session ID provided',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const userInfo = await this.authService.getUserInfo(sessionId);

    request.user = userInfo;

    return true;
  }
}
