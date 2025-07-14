import { Module } from '@nestjs/common';
import { AuthController } from './controllers/auth.controller';
import { GoogleStrategy } from './strategies/google/google.strategy';
import { ConfigModule } from '../config/config.module';
import { GithubStrategy } from './strategies/github/github.strategy';

@Module({
  controllers: [AuthController],
  providers: [GoogleStrategy, GithubStrategy],
  imports: [ConfigModule],
})
export class AuthModule {}
