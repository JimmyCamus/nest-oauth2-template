import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { ConfigService } from './config/config.service';
import { Logger } from 'nestjs-pino';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  const configService = app.get(ConfigService);

  app.enableCors(configService.getCorsConfig());

  app.useLogger(app.get(Logger));

  const logger = app.get(Logger);

  app.use(helmet());

  const port = configService.getPort();

  logger.log(`Application is running on port: ${port}`, 'Bootstrap');
  await app.listen(port);
}
// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
