import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthenticatedRequest, RequestHandler } from '../../common/interfaces';
import { mapTransactionEntity, TransactionResponse } from './create.transaction.handler';
import { TransactionEntity } from '../transaction.entity';

export type TransactionContextRequest = AuthenticatedRequest & { accountId: string, transactionId: string };

@Injectable()
export class GetTransactionHandler implements RequestHandler {
    constructor(
        @InjectRepository(TransactionEntity)
        private readonly repo: Repository<TransactionEntity>
    ) { }

    async handle(request: TransactionContextRequest): Promise<TransactionResponse> {
        const transaction = (await this.repo.findOne({ where: { userId: request.userId, accountId: request.accountId, uuid: request.transactionId } }));
        
        if(!transaction) {
            throw new NotFoundException('Transaction not found');
        }

        return mapTransactionEntity(transaction);
    }
}
