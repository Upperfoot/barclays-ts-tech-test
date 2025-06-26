

import { Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { AccountsModule } from './accounts/accounts.module';
import { UsersModule } from './users/users.module';
import { TransactionsModule } from './transactions/transactions.module';
import { AuthModule } from './auth/auth.module';

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'sqlite',
  database: 'data.sqlite', // default
  entities: [__dirname + '**/*.entity.ts'],
  synchronize: true,
  autoLoadEntities: true,
}

@Module({
  imports: [
    TypeOrmModule.forRoot(typeOrmConfig),
    AccountsModule,
    UsersModule,
    AuthModule,
    TransactionsModule,
  ],
})
export class AppModule {}
