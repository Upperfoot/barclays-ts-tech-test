import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserEntity } from '../users/user.entity';

const jwtSecret = crypto.randomUUID();

export function getJwtConfiguration() {
  return {
    secret: jwtSecret,
  };
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: getJwtConfiguration().secret,
    });
  }

  async validate(payload: any): Promise<UserEntity> {
    const user = await this.authService.getUser(payload.sub);
    if (!user) {
      throw new ForbiddenException('User does not exist');
    }

    return user;
  }
}
