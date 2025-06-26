import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccountEntity } from '../account.entity';
import { AuthenticatedRequest } from './create.account.handler';
import { RequestHandler } from '../../common/interfaces';

export type AccountContextRequest = AuthenticatedRequest & { accountId: string };

@Injectable()
export class DeleteAccountHandler implements RequestHandler {
    constructor(
        @InjectRepository(AccountEntity)
        private readonly repo: Repository<AccountEntity>
    ) { }

    async handle(request: AccountContextRequest): Promise<boolean> {
        const account = (await this.repo.findOne({ where: { userId: request.userId, uuid: request.accountId } }));

        if(!account) {
            throw new NotFoundException('Account not found');
        }

        const res = await this.repo.delete(account.id);

        return true;
    }
}
