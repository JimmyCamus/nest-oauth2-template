import { Injectable } from '@nestjs/common';
import { PinoLogger, InjectPinoLogger } from 'nestjs-pino';
import { ConfigService as NestConfigService } from '@nestjs/config';

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

  getPort(): number {
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

  getCorsConfig(): Record<string, any> {
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
}
