import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { GoogleGuard } from '../guards/google.guard';
import { ConfigService } from '../../config/config.service';
import { CustomRequest } from '../types/request.types';

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
}
