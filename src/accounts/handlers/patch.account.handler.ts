import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AccountEntity, AccountType, Currency } from '../account.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString } from 'class-validator';
import { AccountResponse, mapAccountEntity } from './create.account.handler';
import { RequestHandler } from '../../common/interfaces';

export class PatchAccountRequest {
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

type AuthenticatedRequest = { userId: string };
type AuthenticatedPatchRequest = AuthenticatedRequest & {
  accountId: string;
  data: PatchAccountRequest;
};

@Injectable()
export class PatchAccountHandler implements RequestHandler {
  constructor(
    @InjectRepository(AccountEntity)
    private readonly repo: Repository<AccountEntity>,
  ) {}

  async handle(request: AuthenticatedPatchRequest): Promise<AccountResponse> {
    const account = await this.repo.findOne({
      where: { userId: request.userId, uuid: request.accountId },
    });

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    try {
      const savedAccount = await this.repo.save({
        id: account.id,
        name: request.data.name,
        accountType: request.data.accountType,
      });

      return mapAccountEntity({ ...account, ...savedAccount });
    } catch (err) {
      const isAccountNameUniqueViolation =
        err instanceof QueryFailedError &&
        /UNIQUE constraint failed: accounts.userId, accounts.name/.test(
          (err as any).message,
        );

      if (isAccountNameUniqueViolation) {
        throw new ConflictException('Name must be unique');
      }

      throw err;
    }
  }
}
