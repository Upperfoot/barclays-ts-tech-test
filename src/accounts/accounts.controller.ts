// Controller to handle /accounts endpoints
import { Controller, Post, Body, Get, Delete, Patch, HttpCode, Param } from '@nestjs/common';
import { CreateAccountHandler, CreateAccountRequest, AccountResponse } from './handlers/create.account.handler';
import { ListAccountHandler, ListAccountResponse } from './handlers/list.account.handler';
import { ApiBadRequestResponse, ApiConflictResponse, ApiCreatedResponse, ApiOperation, ApiResponse, ApiSecurity } from '@nestjs/swagger';
import { ApiDefaultResponses, BadRequestErrorResponse, ConflictErrorResponse, GuardedApiEndpoints } from '../common/error-responses.decorator';
import { CurrentUser } from '../common/current-user.decorator';
import { DeleteAccountHandler } from './handlers/delete.account.handler';
import { PatchAccountHandler, PatchAccountRequest } from './handlers/patch.account.handler';
import { UserEntity } from '../users/user.entity';

@ApiDefaultResponses()
@GuardedApiEndpoints()
@Controller('accounts')
export class AccountsController {
  constructor(
    private readonly createAccountHandler: CreateAccountHandler,
    private readonly listAccountHandler: ListAccountHandler,
    private readonly patchAccountHandler: PatchAccountHandler,
    private readonly deleteAccountHandler: DeleteAccountHandler
  ) { }

  @Post()
  @ApiOperation({ summary: 'Create a new bank account for the authenticated user' })
  @ApiCreatedResponse({ description: 'Bank Account has been created successfully', type: AccountResponse })
  @ApiConflictResponse({ description: 'Account with generated details already exists', type: ConflictErrorResponse })
  @ApiBadRequestResponse({ description: 'Invalid details supplied', type: BadRequestErrorResponse })
  async createAccount(
    @CurrentUser() user: UserEntity,
    @Body() body: CreateAccountRequest
  ): Promise<AccountResponse> {
    return this.createAccountHandler.handle({
      userId: user.uuid,
      data: body
    });
  }

  @Get()
  @ApiOperation({ summary: 'Fetch all accounts for a given user' })
  @ApiResponse({ status: 200, description: 'List of accounts', type: [ListAccountResponse] })
  async listAccounts(@CurrentUser() user: UserEntity): Promise<ListAccountResponse> {
    return this.listAccountHandler.handle({ userId: user.uuid });
  }

  @Patch(':accountId')
  @ApiOperation({ summary: 'Patch an account with new details' })
  @ApiResponse({ status: 200, description: 'Update an account', type: AccountResponse })
  async patchAccount(
    @CurrentUser() user: UserEntity,
    @Param('accountId') accountId: string,
    @Body() body: PatchAccountRequest
  ): Promise<AccountResponse> {
    return this.patchAccountHandler.handle({ userId: user.uuid, accountId, data: body });
  }

  @Delete(':accountId')
  @ApiOperation({ summary: 'Delete an account' })
  @ApiResponse({ status: 204, description: 'Delete an account' })
  @HttpCode(204)
  async deleteAccount(
    @CurrentUser() user: UserEntity,
    @Param('accountId') accountId: string,
  ) {
    await this.deleteAccountHandler.handle({ userId: user.uuid, accountId });
  }
}
