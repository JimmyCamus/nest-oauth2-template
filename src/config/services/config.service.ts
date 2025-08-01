import { Injectable } from '@nestjs/common';
import { PinoLogger, InjectPinoLogger } from 'nestjs-pino';
import { ConfigService as NestConfigService } from '@nestjs/config';
import { OauthProvider } from '../types/types';
import { ConfigException } from '../exceptions/config.exceptions';

const DEFAULT_PORT = 8000;
const DEFAULT_CORS_METHODS = ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'];
const DEFAULT_CORS_ORIGIN = ['*'];

@Injectable()
export class ConfigService {
  constructor(
    private readonly nestConfigService: NestConfigService,
    @InjectPinoLogger(ConfigService.name)
    private readonly logger: PinoLogger,
  ) {}

  get nodeEnv(): string {
    const env = this.nestConfigService.get<string>('NODE_ENV') || 'development';
    return env;
  }

  get port(): number {
    const port = this.nestConfigService.get<number>('PORT') || DEFAULT_PORT;
    let parsedPort = Number(port);

    if (isNaN(parsedPort) || parsedPort <= 0 || parsedPort > 65535) {
      this.logger.warn(
        `Invalid port number: ${port}. Using default port 8000.`,
      );
      parsedPort = DEFAULT_PORT;
    }

    return parsedPort;
  }

  get corsConfig(): Record<string, any> {
    const corsOrigin = this.nestConfigService.get<string>('CORS_ORIGIN');

    if (!corsOrigin) {
      this.logger.warn('CORS_ORIGIN is not set. Defaulting to all.');
    }

    const origins =
      corsOrigin?.split(',')?.map((origin) => origin.trim()) ||
      DEFAULT_CORS_ORIGIN;

    const corsMethods = this.nestConfigService.get<string>('CORS_METHODS');

    if (!corsMethods) {
      this.logger.warn(
        'CORS_METHODS is not set. Defaulting to ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"].',
      );
    }

    const methods =
      corsMethods?.split(',')?.map((method) => method.trim().toUpperCase()) ||
      DEFAULT_CORS_METHODS;

    return { origins, methods };
  }

  get googleSecrets(): {
    clientId: string;
    clientSecret: string;
    callbackUrl: string;
  } {
    return this.generateOauthConfig(OauthProvider.GOOGLE);
  }

  get githubSecrets() {
    return this.generateOauthConfig(OauthProvider.GITHUB);
  }

  get authRedirectUrl(): string {
    const redirectUrl =
      this.nestConfigService.get<string>('AUTH_REDIRECT_URL') ?? '';

    return redirectUrl;
  }

  get databaseConfig() {
    const host =
      this.nestConfigService.get<string>('DATABASE_HOST') || 'localhost';
    const port = this.nestConfigService.get<number>('DATABASE_PORT') || 5432;
    const username =
      this.nestConfigService.get<string>('DATABASE_USER') || 'postgres';
    const password =
      this.nestConfigService.get<string>('DATABASE_PASSWORD') || '';
    const database =
      this.nestConfigService.get<string>('DATABASE_NAME') || 'mydatabase';

    return {
      host,
      port,
      username,
      password,
      database,
    };
  }

  get jwtSecret(): string {
    const secret = this.nestConfigService.get<string>('JWT_SECRET');

    if (!secret) {
      this.logger.error('JWT_SECRET is not set. Please configure it.');
      throw ConfigException.jwtSecretNotFound();
    }

    return secret;
  }

  get redisUri(): string {
    const redisHost = this.nestConfigService.get<string>('REDIS_HOST');
    const redisPassword = this.nestConfigService.get<string>('REDIS_PASSWORD');

    if (!redisHost || !redisPassword) {
      this.logger.error('REDIS config is not set. Please configure it.');
      throw ConfigException.redisConfigNotFound();
    }

    const redisUri = `redis://:${redisPassword}@${redisHost}`;

    return redisUri;
  }

  private generateOauthConfig(provider: OauthProvider) {
    const clientId = this.nestConfigService.get<string>(
      `${provider}_CLIENT_ID`,
    );
    const clientSecret = this.nestConfigService.get<string>(
      `${provider}_CLIENT_SECRET`,
    );
    const callbackUrl = this.nestConfigService.get<string>(
      `${provider}_CALLBACK_URL`,
    );

    if (!clientId || !clientSecret || !callbackUrl) {
      this.logger.error(
        `${provider} OAuth configuration is incomplete. Please check your environment variables.`,
      );
      throw ConfigException.oauthConfigNotFound(provider);
    }

    return { clientId, clientSecret, callbackUrl };
  }
}
