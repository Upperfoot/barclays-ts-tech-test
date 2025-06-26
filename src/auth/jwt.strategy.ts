
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { JwtUser } from '../common/current-user.decorator';

const jwtSecret = crypto.randomUUID();

export function getJwtConfiguration() {
    return {
        secret: jwtSecret
    }
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: getJwtConfiguration().secret,
    });
  }

  async validate(payload: any): Promise<JwtUser> {
    return { id: payload.sub, email: payload.email };
  }
}
