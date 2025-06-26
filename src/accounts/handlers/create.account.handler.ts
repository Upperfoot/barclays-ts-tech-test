import { ConflictException, Injectable } from "@nestjs/common";
import { AccountEntity, AccountType, Currency } from "../account.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { QueryFailedError, Repository } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsString } from "class-validator";
import { AuthenticatedRequest, RequestHandler } from '../../common/interfaces';

export class CreateAccountRequest {
    @ApiProperty({
        description: 'The name of the account. Must be unique per user.',
        example: 'My Savings Account',
    })
    @IsString()
    name: string;

    @ApiProperty({
        enum: AccountType,
        example: AccountType.personal,
    })
    @IsEnum(AccountType)
    accountType: AccountType;

    @ApiProperty({
        enum: Currency,
        example: Currency.GBP,
    })
    @IsEnum(Currency)
    currency: Currency;
}

export type AuthenticatedCreateRequest = AuthenticatedRequest & { data: CreateAccountRequest };

export class AccountResponse {
    @ApiProperty({
        example: 'acc01f2b-3932-4a27-b753-be9d88dc01a2'
    })
    id: string;

    @ApiProperty({
        example: 'cb7e93e8-05a0-4cc2-8960-afbbd08d7e15'
    })
    userId: string;

    @ApiProperty({
        example: '12345678'
    })
    accountNumber: string;

    @ApiProperty({
        example: '12-34-56'
    })
    sortCode: string;

    @ApiProperty({
        example: 'My Savings Account'
    })
    name: string;

    @ApiProperty({
        example: AccountType.personal
    })
    accountType: AccountType;

    @ApiProperty({
        example: 0
    })
    balance: number;

    @ApiProperty({
        example: Currency.GBP
    })
    currency: Currency;

    @ApiProperty()
    createdTimestamp: Date;

    @ApiProperty()
    updatedTimestamp: Date;
}

function randomDigitString(length: number): string {
    let result = '';
    for (let i = 0; i < length; i++) {
        result += Math.floor(Math.random() * 10).toString();
    }
    return result;
}

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
export class CreateAccountHandler implements RequestHandler {
    constructor(
        @InjectRepository(AccountEntity)
        private readonly repo: Repository<AccountEntity>
    ) { }

    /*
     * What this handle function does is it attempts to create a bank account with a unique set of accountNumber + sortCode
     * Our Database reinforces unique constraints, and thus doesn't allow for a composite key that's duplicated
     * So we need to generate it, attempt to insert and to retry only on a Unique Constraint error response
     * Problems with this are:
     * - No determinism in the effort to not be sequential
     * - Account Number + Sort Code aren't Modulus verified
     * - And most importantly, this isn't scalable - as the pool of accountNumbers + sortCodes decreases over time, 
     *   our retry attempts increases with it as we are more likely to hits
     * What we should do in future: Look at creating a deterministic bank account + sort code issuer with modulus
     * verification to verify the pair (Vocalink, MOD11, MOD11-2, or MOD97)
     */
    async handle(request: AuthenticatedCreateRequest): Promise<AccountResponse> {
        for (let attempt = 0; attempt < 5; attempt++) {
            const accountNumber = randomDigitString(8);
            const sortCode = randomDigitString(6);

            const entity = this.repo.create({
                userId: request.userId,
                accountNumber,
                sortCode,
                name: request.data.name,
                accountType: request.data.accountType,
                balance: 0,
                currency: request.data.currency,
            });

            try {
                const savedAccount = await this.repo.save(entity);
                return mapAccountEntity(savedAccount);
            } catch (err) {
                const isAccountNameUniqueViolation =
                    err instanceof QueryFailedError &&
                    /UNIQUE constraint failed: accounts.userId, accounts.name/.test((err as any).message);

                if (isAccountNameUniqueViolation) {
                    throw new ConflictException('Name must be unique');
                }

                const isAccountNumberUniqueViolation =
                    err instanceof QueryFailedError &&
                    /UNIQUE constraint failed: accounts.accountNumber, accounts.sortCode/.test((err as any).message);

                if (!isAccountNumberUniqueViolation) throw err; // rethrow other DB errors

                if (attempt === 4) {
                    throw new ConflictException('Unable to generate unique account number');
                }
                // else: retry
            }
        }

        throw new ConflictException('Unexpected error'); // shouldn't reach here
    }
}