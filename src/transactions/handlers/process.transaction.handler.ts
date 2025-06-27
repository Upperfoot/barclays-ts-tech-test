import { ForbiddenException, Injectable, InternalServerErrorException, NotFoundException, ServiceUnavailableException, UnprocessableEntityException } from "@nestjs/common";
import { TransactionEntity, TransactionStatus, TransactionType } from "../transaction.entity";
import { TransactionHandler } from "./transaction.handler";
import { AccountEntity } from "../../accounts/account.entity";

const MAX_ATTEMPTS = 5;

export function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export type TransactionRequest = { transactionId: string };

export function balanceReducer(balance: number, transactionEntity: TransactionEntity): number {
    if (transactionEntity.type === TransactionType.deposit) {
        return balance + transactionEntity.amount;
    } else if (transactionEntity.type === TransactionType.withdrawal) {
        return balance - transactionEntity.amount;
    } else {
        return balance;
    }
}

@Injectable()
export class ProcessTransactionHandler extends TransactionHandler {
    /*
     * - Transactions are processed when pending only
     * - To demonstrate this OOB, I'll ensure that we use locks / transactions against our database
     * - This is so we don't run into any situations where a transfer is attempting to withdraw more money than
     *   is in the account at that moment
     * - Normally in a financial institution, transactions are processed in order of arrival (and preference of deposits first also)
     *   and once processed then update the presentation layer (Account Balance once confirmed) - Think Buffers, Queue's & Jobs
     * - Currently if this processor fails, a Transaction may be in a Pending state indefinitely unless re-processed
     */
    async handle(request: TransactionRequest) {
        // We must wrap our Transaction in a Lock, and must block our processing if one is currently active against our account (use this as our lock key)
        const queryRunner = this.dataSource.createQueryRunner();

        let attempts = 0;

        while (queryRunner.isTransactionActive) {
            await sleep(100);
            attempts++;

            if (attempts >= MAX_ATTEMPTS) {
                return;
            }
        }

        let error;

        try {
            await queryRunner.connect();
            await queryRunner.startTransaction(); // SQLite will lock DB at this point

            const transaction = await queryRunner.manager.findOne(TransactionEntity, {
                where: {
                    uuid: request.transactionId,
                },
            });

            if (!transaction) {
                error = new NotFoundException('Transaction Not Found');
                throw error;
            }

            const account = await queryRunner.manager.findOne(AccountEntity, {
                where: { uuid: transaction.accountId },
            });

            if (!account) throw new NotFoundException('Account Not Found');

            const completedTransactions = await queryRunner.manager.find(TransactionEntity, {
                where: { accountId: account.uuid, status: TransactionStatus.completed },
            });

            // Never use the Account Balance, recalculate from list of transactions
            // May be slow, but it is accurate
            // Improvement Area: Alternative is to track the last transaction and to continue the count from there onwards
            const currentAccountBalance = completedTransactions.reduce(balanceReducer, 0);
            const newAccountBalance = balanceReducer(currentAccountBalance, transaction);

            // If our new transaction brings us lower than 0 on our balance we need to throw an error
            if (newAccountBalance < 0) {
                // Update our transaction status to completed
                transaction.status = TransactionStatus.failed;
                error = new UnprocessableEntityException('Insufficient funds to process transaction');
            } else {
                // Update our transaction status to completed
                transaction.status = TransactionStatus.completed;

                // Let's include our transaction amount on the current balance to update the account
                account.balance = newAccountBalance;
                await queryRunner.manager.save(account);
            }

            await queryRunner.manager.save(transaction);

            // Let's commit our transactions
            await queryRunner.commitTransaction();
        } catch (err) {
            await queryRunner.rollbackTransaction();
        } finally {
            await queryRunner.release();
        }

        // Reason this is at the bottom is to allow our finally statements to clean up transactions
        if (error) {
            throw error;
        }
    }
}