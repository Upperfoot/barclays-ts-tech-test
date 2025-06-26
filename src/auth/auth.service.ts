
import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserEntity } from '../users/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
  ) { }

  async userExists(userUuid: string) {
    const user = await this.usersService.findOne({
      uuid: userUuid
    });

    return user ? true : false;
  }

  async retrieveUserByCredentials(email: string, password: string): Promise<any> {
    const user = await this.usersService.findOne({
      email
    });

    if (!user) {
      return null;
    }

    const validPassword = await bcrypt.compare(password, user.password)

    if (!validPassword) {
      return null;
    }

    return user;
  }

  createJwtTokens(user: UserEntity) {
    const payload = { email: user.email, sub: user.uuid };

    return {
      accessToken: this.jwtService.sign(payload),
    };
  }
}
