// Controller to handle /accounts endpoints
import { Controller, Post, Body, Get, Delete, Patch, HttpCode } from '@nestjs/common';
import { ApiBadRequestResponse, ApiConflictResponse, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ApiDefaultResponses, BadRequestErrorResponse, ConflictErrorResponse, GuardedApiEndpoints } from '../common/error-responses.decorator';
import { CreateUserHandler, CreateUserRequest, UserResponse } from './handlers/create.user.handler';
import { CurrentUser } from '../common/current-user.decorator';
import { GetUserHandler } from './handlers/get.user.handler';
import { DeleteUserHandler } from './handlers/delete.user.handler';
import { PatchUserHandler, PatchUserRequest } from './handlers/patch.user.handler';
import { UserEntity } from './user.entity';

@ApiDefaultResponses()
@Controller('users')
export class UsersController {
  constructor(
    private readonly createUserHandler: CreateUserHandler,
    private readonly getUserHandler: GetUserHandler,
    private readonly patchUserHandler: PatchUserHandler,
    private readonly deleteUserHandler: DeleteUserHandler,
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
  async getUser(@CurrentUser() user: UserEntity): Promise<UserResponse> {
    return this.getUserHandler.handle({ userId: user.uuid });
  }

  @Patch('me')
  @ApiOperation({ summary: 'Patch currently authenticated user' })
  @ApiOkResponse({ description: 'Patch user', type: [UserResponse] })
  @GuardedApiEndpoints()
  async patchUser(
    @CurrentUser() user: UserEntity,
    @Body() body: PatchUserRequest
  ): Promise<UserResponse> {
    return this.patchUserHandler.handle({ userId: user.uuid, data: body });
  }

  @Delete('me')
  @ApiOperation({ summary: 'Delete currently authenticated user' })
  @ApiResponse({ status: 204, description: 'Delete our current user' })
  @HttpCode(204)
  @GuardedApiEndpoints()
  async deleteUser(@CurrentUser() user: UserEntity) {
    await this.deleteUserHandler.handle({ userId: user.uuid });
  }
}
