import { Module } from '@nestjs/common';
import { AuthController } from './controllers/auth.controller';
import { GoogleStrategy } from './strategies/google.strategy';
import { ConfigModule } from '../config/config.module';

@Module({
  controllers: [AuthController],
  providers: [GoogleStrategy],
  imports: [ConfigModule],
})
export class AuthModule {}
