import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccountEntity } from '../account.entity';
import { AccountResponse, AuthenticatedRequest } from './create.account.handler';

export function mapAccountEntity(accountEntity: AccountEntity): AccountResponse {
    return {
        id: accountEntity.uuid,
        userId: accountEntity.userId,
        accountNumber: accountEntity.accountNumber,
        sortCode: accountEntity.sortCode,
        name: accountEntity.name,
        accountType: accountEntity.accountType,
        balance: accountEntity.balance,
        currency: accountEntity.currency,
        createdTimestamp: accountEntity.createdTimestamp,
        updatedTimestamp: accountEntity.updatedTimestamp
    };
}

@Injectable()
export class GetAccountHandler {
    constructor(
        @InjectRepository(AccountEntity)
        private readonly repo: Repository<AccountEntity>
    ) { }

    async handle(request: AuthenticatedRequest): Promise<AccountResponse[]> {
        const accounts = (await this.repo.find({ where: { userId: request.userId } })).map(mapAccountEntity);
        return accounts;
    }
}
