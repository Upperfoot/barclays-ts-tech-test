import { InjectRepository } from "@nestjs/typeorm";
import { TransactionEntity } from "../transaction.entity";
import { AccountEntity } from "../../accounts/account.entity";
import { DataSource, Repository } from "typeorm";
import { NotFoundException } from "@nestjs/common";

export class TransactionHandler {

    constructor(
        protected readonly dataSource: DataSource,
        @InjectRepository(TransactionEntity)
        protected readonly transactionRepo: Repository<TransactionEntity>,
        @InjectRepository(AccountEntity)
        protected readonly accountRepo: Repository<AccountEntity>
    ) {
        
    }

    async getAccount(userId: string, accountId: string) {
        const account = await this.accountRepo.findOne({ where: { userId, uuid: accountId }});

        if(!account) {
            // We aren't throwing a Forbidden 403 exception here, as we don't want to give any indication of existance
            throw new NotFoundException('Account not found');
        }

        return account;
    }
}