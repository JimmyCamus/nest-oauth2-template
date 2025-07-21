import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';

import { GoogleGuard } from '../guards/google.guard';
import { CustomRequest } from '../types/request.types';
import { GithubGuard } from '../guards/github.guard';
import { AuthService } from '../services/auth.service';
import { TokenGuard } from '../guards/token.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('google')
  @UseGuards(GoogleGuard)
  register() {}

  @Get('google/redirect')
  @UseGuards(GoogleGuard)
  googleAuthRedirect(@Req() req: CustomRequest, @Res() res: Response) {
    return this.authService.redirectToAuthUrl(req, res);
  }

  @Get('github')
  @UseGuards(GithubGuard)
  githubRegister() {}

  @Get('github/redirect')
  @UseGuards(GithubGuard)
  githubAuthRedirect(@Req() req: CustomRequest, @Res() res: Response) {
    return this.authService.redirectToAuthUrl(req, res);
  }

  @Get('profile')
  @UseGuards(TokenGuard)
  profile(@Req() req: CustomRequest) {
    return req.user;
  }
}
