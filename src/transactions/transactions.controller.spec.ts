import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { typeOrmConfig } from '../app.module';
import { setupApp } from '../common/app.setup';
import { AuthModule } from '../auth/auth.module';
import { clearTables, createTestAccount, createTestUser, createUserTokens } from '../common/auth-test-helper';
import { TransactionsModule } from './transactions.module';
import { CreateTransactionRequest, TransactionResponse } from './handlers/create.transaction.handler';
import { Currency, TransactionStatus, TransactionType } from './transaction.entity';

describe('TransactionsController (Integration)', () => {
  let app: INestApplication;
  let module: TestingModule;
  let accessToken: string;
  let userId: string;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({ ...typeOrmConfig, database: ':memory:', dropSchema: true } as TypeOrmModuleOptions),
        AuthModule,
        TransactionsModule,
      ],
    }).compile();

    app = module.createNestApplication();

    setupApp(app);

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    clearTables(module);

    const testUser = await createTestUser(module);
    const testUserTokens = await createUserTokens(module, testUser);

    accessToken = testUserTokens.accessToken;
    userId = testUser.uuid;
  })

  it('creates and retrieves an transaction', async () => {
    // Simulate a user creating an account
    const account = await createTestAccount(module, userId, 'Test Account 1')

    const createRes = await request(app.getHttpServer())
      .post(`/accounts/${account.uuid}/transactions`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        type: TransactionType.deposit,
        currency: Currency.GBP,
        amount: 100,
        reference: 'New Deposit Transaction'
      } as CreateTransactionRequest)
      .expect(201);

    expect(createRes.body).toHaveProperty('id');
    expect(createRes.body.accountId).toBe(account.uuid);
    expect(createRes.body.userId).toBe(userId);
    expect(createRes.body.type).toBe(TransactionType.deposit);
    expect(createRes.body.status).toBe(TransactionStatus.pending);
    expect(createRes.body.amount).toBe(100);
    expect(createRes.body.currency).toBe(Currency.GBP);
    expect(createRes.body.reference).toBe('New Deposit Transaction');
    expect(createRes.body).toHaveProperty('createdTimestamp');
    expect(createRes.body).toHaveProperty('updatedTimestamp');
  });

  it('bad account id should fail', async () => {
    // Simulate a user creating an account
    const account = await createTestAccount(module, userId, 'Test Account 1')

    const createRes = await request(app.getHttpServer())
      .post(`/accounts/random-bad-id/transactions`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        type: TransactionType.deposit,
        currency: Currency.GBP,
        amount: 100,
        reference: 'New Deposit Transaction'
      } as CreateTransactionRequest)
      .expect(404);
  });

  it('access to account without ownership should fail', async () => {
    // Simulate a user creating an account
    await createTestAccount(module, userId, 'Test Account 1')
    const differentUserAccount = await createTestAccount(module, crypto.randomUUID(), 'Test Account 2')

    const createRes = await request(app.getHttpServer())
      .post(`/accounts/${differentUserAccount.uuid}/transactions`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        type: TransactionType.deposit,
        currency: Currency.GBP,
        amount: 100,
        reference: 'New Deposit Transaction'
      } as CreateTransactionRequest)
      .expect(404);
  });
});
