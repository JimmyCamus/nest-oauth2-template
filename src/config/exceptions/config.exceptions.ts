import { InternalServerErrorException } from '@nestjs/common';

export class ConfigException extends InternalServerErrorException {
  constructor(message: string) {
    super({
      message,
    });
  }

  static jwtSecretNotFound() {
    return new ConfigException('JWT_SECRET is not set. Please configure it.');
  }

  static redisConfigNotFound() {
    return new ConfigException('REDIS config is not set. Please configure it.');
  }

  static oauthConfigNotFound(provider: string) {
    return new ConfigException(
      `${provider} OAuth configuration is incomplete. Please check your environment variables.`,
    );
  }
}
