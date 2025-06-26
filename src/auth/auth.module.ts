
import { Module } from '@nestjs/common';
import { getJwtConfiguration, JwtStrategy } from './jwt.strategy';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret: getJwtConfiguration().secret,
      signOptions: { expiresIn: '60s' },
    }),
  ],
  controllers: [],
  providers: [JwtStrategy],
  exports: [],
})
export class AuthModule {}
