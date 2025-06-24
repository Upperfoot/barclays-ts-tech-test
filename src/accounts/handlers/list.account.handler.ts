import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccountEntity } from '../account.entity';
import { AccountResponse, AuthenticatedRequest } from './create.account.handler';
import { ApiProperty } from '@nestjs/swagger';

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

export class ListAccountResponse {
    @ApiProperty({
        type: [AccountResponse]
    })
    accounts: AccountResponse[];
}

@Injectable()
export class ListAccountHandler {
    constructor(
        @InjectRepository(AccountEntity)
        private readonly repo: Repository<AccountEntity>
    ) { }

    async handle(request: AuthenticatedRequest): Promise<ListAccountResponse> {
        const accounts = (await this.repo.find({ where: { userId: request.userId } })).map(mapAccountEntity);
        return { accounts: accounts };
    }
}
