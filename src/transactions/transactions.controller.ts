// Controller to handle /accounts endpoints
import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiDefaultResponses, BadRequestErrorResponse, GuardedApiEndpoints, NotFoundErrorResponse, UnprocessableEntityErrorResponse } from '../common/error-responses.decorator';
import { ApiBadRequestResponse, ApiCreatedResponse, ApiNotFoundResponse, ApiOperation, ApiResponse, ApiUnauthorizedResponse, ApiUnprocessableEntityResponse } from '@nestjs/swagger';
import { CurrentUser } from '../common/current-user.decorator';
import { CreateTransactionHandler, CreateTransactionRequest, TransactionResponse } from './handlers/create.transaction.handler';
import { ListTransactionHandler, ListTransactionResponse } from './handlers/list.transaction.handler';
import { GetTransactionHandler } from './handlers/get.transaction.handler';
import { UserEntity } from '../users/user.entity';

@ApiDefaultResponses()
@GuardedApiEndpoints() // Allows for use of @CurrentUser
@Controller('accounts/:accountId/transactions')
export class TransactionsController {
  constructor(
    private readonly createTransactionHandler: CreateTransactionHandler,
    private readonly listTransactionHandler: ListTransactionHandler,
    private readonly getTransactionHandler: GetTransactionHandler
  ) { }


  @Post()
  @ApiOperation({ summary: 'Create a new transaction for an authenticated user against an account' })
  @ApiBadRequestResponse({ description: 'Invalid details supplied', type: BadRequestErrorResponse })
  @ApiUnprocessableEntityResponse({ description: 'Insufficient funds to process transaction', type: UnprocessableEntityErrorResponse })
  @ApiNotFoundResponse({ description: 'Bank account not found', type: NotFoundErrorResponse })
  @ApiCreatedResponse({ description: 'List of accounts', type: TransactionResponse })
  async createTransaction(
    @CurrentUser() user: UserEntity,
    @Param('accountId') accountId: string,
    @Body() body: CreateTransactionRequest
  ): Promise<TransactionResponse|null> {
    return this.createTransactionHandler.handle({
      userId: user.uuid,
      accountId,
      data: body
    });
  }

  @Get()
  @ApiOperation({ summary: 'Fetch all transactions for a given user against a specific account' })
  @ApiResponse({ status: 200, description: 'List of accounts', type: [ListTransactionResponse] })
  async listTransactions(
    @CurrentUser() user: UserEntity,
    @Param('accountId') accountId: string
  ): Promise<ListTransactionResponse|null> {
    return this.listTransactionHandler.handle({ userId: user.uuid, accountId });
  }

  @Get(':transactionId')
  @ApiOperation({ summary: 'Fetch transaction by its id' })
  @ApiResponse({ status: 200, description: 'List of accounts', type: TransactionResponse })
  async getTransaction(
    @CurrentUser() user: UserEntity,
    @Param('accountId') accountId: string,
    @Param('transactionId') transactionId: string
  ): Promise<TransactionResponse|null> {
    return this.getTransactionHandler.handle({ userId: user.uuid, accountId, transactionId });
  }
}
