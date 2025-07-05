import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { ConfigService } from './config.service';
import { validate } from './lib/validate';

@Module({
  imports: [NestConfigModule.forRoot({ isGlobal: true, validate })],
  providers: [ConfigService],
  exports: [ConfigService],
})
export class ConfigModule {}
