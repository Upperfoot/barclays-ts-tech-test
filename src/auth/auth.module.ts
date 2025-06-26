
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { getJwtConfiguration, JwtStrategy } from './jwt.strategy';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { LoginHandler } from './handlers/login.handler';
import { AuthController } from './auth.controller';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret: getJwtConfiguration().secret,
      signOptions: { expiresIn: '60s' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, LoginHandler],
  exports: [AuthService],
})
export class AuthModule {}
