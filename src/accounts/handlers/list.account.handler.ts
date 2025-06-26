import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccountEntity } from '../account.entity';
import { AccountResponse, mapAccountEntity } from './create.account.handler';
import { ApiProperty } from '@nestjs/swagger';
import { AuthenticatedRequest, RequestHandler } from '../../common/interfaces';

export class ListAccountResponse {
    @ApiProperty({
        type: [AccountResponse]
    })
    accounts: AccountResponse[];
}

@Injectable()
export class ListAccountHandler implements RequestHandler {
    constructor(
        @InjectRepository(AccountEntity)
        private readonly repo: Repository<AccountEntity>
    ) { }

    async handle(request: AuthenticatedRequest): Promise<ListAccountResponse> {
        const accounts = (await this.repo.find({ where: { userId: request.userId } })).map(mapAccountEntity);
        return { accounts: accounts };
    }
}
