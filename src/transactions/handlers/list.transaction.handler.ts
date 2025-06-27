import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { AuthenticatedRequest, RequestHandler } from '../../common/interfaces';
import {
  mapTransactionEntity,
  TransactionResponse,
} from './create.transaction.handler';
import { TransactionEntity } from '../transaction.entity';

export class ListTransactionResponse {
  @ApiProperty({
    type: [TransactionResponse],
  })
  transactions: TransactionResponse[];
}

export type TransactionContextRequest = AuthenticatedRequest & {
  accountId: string;
};

@Injectable()
export class ListTransactionHandler implements RequestHandler {
  constructor(
    @InjectRepository(TransactionEntity)
    private readonly repo: Repository<TransactionEntity>,
  ) {}

  async handle(
    request: TransactionContextRequest,
  ): Promise<ListTransactionResponse | null> {
    const transactions = (
      await this.repo.find({
        where: { userId: request.userId, accountId: request.accountId },
      })
    ).map(mapTransactionEntity);
    return { transactions };
  }
}
