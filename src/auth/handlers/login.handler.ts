import { BadRequestException, Injectable } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsStrongPassword } from 'class-validator';
import { AuthService } from '../auth.service';
import {
  mapUser,
  UserResponse,
} from '../../users/handlers/create.user.handler';
import { RequestHandler } from '../../common/interfaces';

export class LoginRequest {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsStrongPassword()
  password: string;
}

export class LoginResponse {
  @ApiProperty()
  @IsString()
  accessToken: string;

  @ApiProperty()
  user: UserResponse;
}

@Injectable()
export class LoginHandler implements RequestHandler {
  constructor(private readonly authService: AuthService) {}

  async handle(request: LoginRequest): Promise<LoginResponse> {
    const validatedUser = await this.authService.retrieveUserByCredentials(
      request.email,
      request.password,
    );

    if (!validatedUser) {
      throw new BadRequestException('Invalid Credentials');
    }

    const accessTokens = this.authService.createJwtTokens(validatedUser);

    return {
      user: mapUser(validatedUser),
      accessToken: accessTokens.accessToken,
    };
  }
}
