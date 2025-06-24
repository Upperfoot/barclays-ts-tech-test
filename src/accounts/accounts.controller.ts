// Controller to handle /accounts endpoints
import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { CreateAccountHandler, CreateAccountRequest, AccountResponse } from './handlers/create.account.handler';
import { ListAccountHandler, ListAccountResponse } from './handlers/list.account.handler';
import { ApiOperation, ApiResponse, ApiSecurity } from '@nestjs/swagger';
import { ApiDefaultResponses } from 'src/default-responses.decorator';

@ApiDefaultResponses()
@ApiSecurity('bearerAuth')
@Controller('accounts')
export class AccountsController {
  constructor(
    private readonly createAccountHandler: CreateAccountHandler,
    private readonly getAccountHandler: ListAccountHandler
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new bank account for the authenticated user' })
  @ApiResponse({ status: 201, description: 'Bank Account has been created successfully', type: AccountResponse })
  @ApiResponse({ status: 409, description: 'Account with generated details already exists' })
  async createAccount(@Body() body: CreateAccountRequest): Promise<AccountResponse> {
    return this.createAccountHandler.handle({
      userId: '',
      data: body
    });
  }


  @Get()
  @ApiOperation({ summary: 'Fetch all accounts for a given user' })
  @ApiResponse({ status: 200, description: 'List of accounts', type: [ListAccountResponse] })
  async getAccounts(@Param('userId') userId: string): Promise<ListAccountResponse> {
    return this.getAccountHandler.handle({ userId });
  }
}
