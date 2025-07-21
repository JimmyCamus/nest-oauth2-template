import { HttpException, HttpStatus } from '@nestjs/common';

export class AuthException extends HttpException {
  constructor(
    message?: string,
    statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR,
    error: string = 'Internal Server Error',
  ) {
    super(
      {
        statusCode,
        error,
        message,
      },
      statusCode,
    );
  }

  static invalidToken() {
    return new AuthException('Invalid token', HttpStatus.UNAUTHORIZED);
  }

  static tokenExpired() {
    return new AuthException('Token expired', HttpStatus.UNAUTHORIZED);
  }

  static authenticationFailed() {
    return new AuthException(
      'Authentication failed',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  static userCreatationFailed(email: string) {
    return new AuthException(
      `User with email ${email} could not be created`,
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  static emailRequired() {
    return new AuthException(`Email is required`, HttpStatus.BAD_REQUEST);
  }
}
