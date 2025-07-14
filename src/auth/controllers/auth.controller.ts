import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { GoogleGuard } from '../guards/google.guard';
import { ConfigService } from '../../config/services/config.service';
import { CustomRequest } from '../types/request.types';
import { GithubGuard } from '../guards/github.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly configService: ConfigService) {}

  @Get('google')
  @UseGuards(GoogleGuard)
  register() {}

  @Get('google/redirect')
  @UseGuards(GoogleGuard)
  googleAuthRedirect(@Req() req: CustomRequest, @Res() res: Response) {
    // TODO: Handle the user registation or login logic here and create a phantom token for security, you should never expose the provider access token to the frontend
    // For now, we just redirecting to the frontend with the user email
    res.redirect(
      `${this.configService.authRedirectUrl}?auth=${JSON.stringify(req?.user?.email)}`,
    );
  }

  @Get('github')
  @UseGuards(GithubGuard)
  githubRegister() {}

  @Get('github/redirect')
  @UseGuards(GithubGuard)
  githubAuthRedirect(@Req() req: CustomRequest, @Res() res: Response) {
    // TODO: Handle the user registation or login logic here and create a phantom token for security, you should never expose the provider access token to the frontend
    // For now, we just redirecting to the frontend with the user email
    res.redirect(
      `${this.configService.authRedirectUrl}?auth=${JSON.stringify(req?.user?.email)}`,
    );
  }
}
