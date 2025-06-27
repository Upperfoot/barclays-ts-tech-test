import { BadRequestException, ForbiddenException, Injectable } from "@nestjs/common";
import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsInt, IsString } from "class-validator";
import { AuthenticatedRequest, Currency } from '../../common/interfaces';
import { TransactionEntity, TransactionStatus, TransactionType } from "../transaction.entity";
import { TransactionHandler } from "./transaction.handler";
import { ProcessTransactionHandler } from "./process.transaction.handler";

export class CreateTransactionRequest {
    @ApiProperty({
        description: 'The amount of the transaction. Must be an unsigned integer value',
        example: 100,
    })
    @IsInt()
    amount: number;

    @ApiProperty({
        enum: TransactionType,
        example: TransactionType.deposit
    })
    @IsEnum(TransactionType)
    type: TransactionType;

    @ApiProperty({
        enum: Currency,
        example: Currency.GBP,
    })
    @IsEnum(Currency)
    currency: Currency;

    @ApiProperty({
        example: 'Deposit Reference'
    })
    @IsString()
    reference: string;
}

export type AuthenticatedCreateRequest = AuthenticatedRequest & { accountId: string, data: CreateTransactionRequest };

export class TransactionResponse {
    @ApiProperty({
        example: 'acc01f2b-3932-4a27-b753-be9d88dc01a2'
    })
    id: string;

    @ApiProperty({
        example: 'cb7e93e8-05a0-4cc2-8960-afbbd08d7e15'
    })
    userId: string;

    @ApiProperty({
        example: 'cb7e93e8-05a0-4cc2-8960-afbbd08d6d20'
    })
    accountId: string;

    @ApiProperty({
        description: 'The amount of the transactionansa. Must be an unsigned integer value',
        example: 100,
    })
    @IsInt()
    amount: number;

    @ApiProperty({
        example: Currency.GBP,
        enum: Currency
    })
    currency: Currency;

    @ApiProperty({
        example: TransactionType.deposit,
        enum: TransactionType
    })
    type: TransactionType;

    @ApiProperty({
        example: TransactionStatus.pending,
        enum: TransactionStatus
    })
    status: TransactionStatus;

    @ApiProperty({
        example: 'Deposit Reference'
    })
    reference: string;

    @ApiProperty()
    createdTimestamp: Date;

    @ApiProperty()
    updatedTimestamp: Date;
}

export function mapTransactionEntity(transactionEntity: TransactionEntity): TransactionResponse {
    return {
        id: transactionEntity.uuid,
        userId: transactionEntity.userId,
        accountId: transactionEntity.accountId,
        amount: transactionEntity.amount,
        currency: transactionEntity.currency,
        type: transactionEntity.type,
        reference: transactionEntity.reference,
        status: transactionEntity.status,
        createdTimestamp: transactionEntity.createdTimestamp,
        updatedTimestamp: transactionEntity.updatedTimestamp
    };
}

@Injectable()
export class CreateTransactionHandler extends TransactionHandler {
    /*
     * - Transactions are always created as pending, we process transactions OOB of the request
     * - Consumers can ping a transaction to see if it's been processed and in a failed/completed state via the get request
     * - This approach allows us to prevent synchronous blocking for transaction create requests, which eats up CPU / Memory
     */
    async handle(request: AuthenticatedCreateRequest): Promise<TransactionResponse> {
        const account = await this.getAccount(request.userId, request.accountId);

        if (account.currency !== request.data.currency) {
            throw new BadRequestException(`Currency must be equal to Account Currency: ${account.currency}`)
        }

        const transaction = await this.transactionRepo.save({
            userId: request.userId,
            accountId: account.uuid,
            amount: request.data.amount,
            status: TransactionStatus.pending,
            type: request.data.type,
            reference: request.data.reference,
            currency: request.data.currency
        });

        // This would be processed OOB normally for Financial Institutions
        //  but for this current spec (422 Unprocessable) we need to return it inline
        // Improvement of this would be to change it to be OOB/Async completely with Queue's/Workers/Jobs/Crons
        const processTransactionHandler = new ProcessTransactionHandler(this.dataSource, this.transactionRepo, this.accountRepo);
        await processTransactionHandler.handle({ transactionId: transaction.uuid });
        return mapTransactionEntity(transaction);
    }


}