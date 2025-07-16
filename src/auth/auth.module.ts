import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';

import { AuthController } from './controllers/auth.controller';
import { GoogleStrategy } from './strategies/google/google.strategy';
import { ConfigModule } from '../config/config.module';
import { GithubStrategy } from './strategies/github/github.strategy';
import { User } from './entities/user.entity';
import { AuthService } from './services/auth.service';
import { ConfigService } from '../config/services/config.service';
import { UserRepository } from './repositories/user.repository';

@Module({
  controllers: [AuthController],
  providers: [GoogleStrategy, GithubStrategy, AuthService, UserRepository],
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([User]),
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        global: true,
        secret: configService.jwtSecret,
        signOptions: { expiresIn: '15m' },
      }),
      inject: [ConfigService],
      imports: [ConfigModule],
    }),
  ],
})
export class AuthModule {}
