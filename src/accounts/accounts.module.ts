import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountsController } from './accounts.controller';
import { CreateAccountHandler } from './handlers/create.account.handler';
import { ListAccountHandler } from './handlers/list.account.handler';
import { AccountEntity } from './account.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AccountEntity])],
  controllers: [AccountsController],
  providers: [CreateAccountHandler, ListAccountHandler],
})
export class AccountsModule {}
