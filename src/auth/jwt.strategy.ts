
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { JwtUser } from '../common/current-user.decorator';
import { AuthService } from './auth.service';

const jwtSecret = crypto.randomUUID();

export function getJwtConfiguration() {
    return {
        secret: jwtSecret
    }
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly authService: AuthService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: getJwtConfiguration().secret,
    });
  }

  async validate(payload: any): Promise<JwtUser> {
    const userExists = await this.authService.userExists(payload.sub);
    if(!userExists) {
        throw new ForbiddenException('User does not exist');
    }
    return { id: payload.sub, email: payload.email };
  }
}
