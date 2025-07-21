import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { LoggerModule } from 'nestjs-pino';
import { createKeyv } from '@keyv/redis';

import { AppController } from './controllers/app.controller';
import { AppService } from './services/app.service';
import { ConfigModule } from '.././config/config.module';
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
    CacheModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        stores: [createKeyv(configService.redisUri)],
      }),
      inject: [ConfigService],
      imports: [ConfigModule],
      isGlobal: true,
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
