import { Controller, Post, Body, HttpStatus, HttpCode } from '@nestjs/common';
import {
  LoginHandler,
  LoginRequest,
  LoginResponse,
} from './handlers/login.handler';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { ApiDefaultResponses } from '../common/error-responses.decorator';

@Controller('auth')
@ApiDefaultResponses()
export class AuthController {
  constructor(private loginHandler: LoginHandler) {}

  @Post('login')
  @ApiOperation({
    summary:
      'Accepts email and password to create authentication details for the user',
  })
  @ApiOkResponse({
    description:
      'Returns user details and access token to be used in guarded Bearer Token API calls',
    type: LoginResponse,
  })
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: LoginRequest): Promise<LoginResponse> {
    return this.loginHandler.handle(body);
  }
}
