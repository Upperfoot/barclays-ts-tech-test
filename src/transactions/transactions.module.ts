import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionsController } from './transactions.controller';
import { CreateTransactionHandler } from './handlers/create.transaction.handler';
import { TransactionEntity } from './transaction.entity';
import { ListTransactionHandler } from './handlers/list.transaction.handler';
import { GetTransactionHandler } from './handlers/get.transaction.handler';
import { AccountEntity } from '../accounts/account.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TransactionEntity, AccountEntity])],
  controllers: [TransactionsController],
  providers: [CreateTransactionHandler, ListTransactionHandler, GetTransactionHandler],
})
export class TransactionsModule {}
