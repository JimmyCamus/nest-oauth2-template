import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './controllers/app.controller';
import { AppService } from './services/app.service';
import { ConfigModule } from '.././config/config.module';
import { LoggerModule } from 'nestjs-pino';
import { pinoConfig } from '.././config/lib/pino';
import { throttlerConfig } from '.././config/lib/throttler';
import { AuthModule } from '../auth/auth.module';
import { ConfigService } from '../config/services/config.service';
import { User } from '../auth/entities/user.entity';

@Module({
  imports: [
    LoggerModule.forRoot(pinoConfig),
    ThrottlerModule.forRoot(throttlerConfig),
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        ...configService.databaseConfig,
        type: 'postgres',
        entities: [User],
        synchronize: configService.nodeEnv !== 'production',
      }),
      inject: [ConfigService],
      imports: [ConfigModule],
    }),
    ConfigModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
