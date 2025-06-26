// Controller to handle /accounts endpoints
import { Controller, Post, Body, Get, UseGuards, Delete, Patch, HttpCode, Param } from '@nestjs/common';
import { ApiBadRequestResponse, ApiConflictResponse, ApiCreatedResponse, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { ApiDefaultResponses, BadRequestErrorResponse, ConflictErrorResponse, GuardedApiEndpoints } from '../common/error-responses.decorator';
import { CreateUserHandler, CreateUserRequest, UserResponse } from './handlers/create.user.handler';
import { CurrentUser, JwtUser } from '../common/current-user.decorator';
import { GetUserHandler } from './handlers/get.user.handler';

@ApiDefaultResponses()
@Controller('users')
export class UsersController {
  constructor(
    private readonly createUserHandler: CreateUserHandler,
    private readonly getUserHandler: GetUserHandler,
  ) { }

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiCreatedResponse({ description: 'User has been created successfully', type: UserResponse })
  @ApiConflictResponse({ description: 'User with email already exists', type: ConflictErrorResponse })
  @ApiBadRequestResponse({ description: 'Invalid details supplied', type: BadRequestErrorResponse })
  async createUser(
    @Body() body: CreateUserRequest
  ): Promise<UserResponse> {
    return this.createUserHandler.handle(body);
  }

  @Get('me')
  @ApiOperation({ summary: 'Fetch currently authenticated user' })
  @ApiOkResponse({ description: 'Fetch user', type: [UserResponse] })
  @GuardedApiEndpoints()
  async getUser(@CurrentUser() user: JwtUser): Promise<UserResponse> {
    return this.getUserHandler.handle({ userId: user.id });
  }
}
