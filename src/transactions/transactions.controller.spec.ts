import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, NotFoundException } from '@nestjs/common';
import * as request from 'supertest';
import { getRepositoryToken, TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { typeOrmConfig } from '../app.module';
import { setupApp } from '../common/app.setup';
import { AuthModule } from '../auth/auth.module';
import { clearTables, createTestAccount, createTestUser, createUserTokens } from '../common/auth-test-helper';
import { TransactionsModule } from './transactions.module';
import { CreateTransactionRequest } from './handlers/create.transaction.handler';
import { Currency, TransactionEntity, TransactionStatus, TransactionType } from './transaction.entity';
import { AccountEntity } from '../accounts/account.entity';
import { Repository } from 'typeorm';
import { log } from 'console';
import { ProcessTransactionHandler } from './handlers/process.transaction.handler';

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
  });

  it('creates a transaction', async () => {
    // Simulate a user creating an account
    const account = await createTestAccount(module, userId, 'Test Account 1')

    const createRes = await request(app.getHttpServer())
      .post(`/accounts/${account.uuid}/transactions`)
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Idempotency-Key', crypto.randomUUID())
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

  it('creates a transaction and retries with same idempotent key', async () => {
    // Simulate a user creating an account
    const account = await createTestAccount(module, userId, 'Test Account 1')
    const idempotentKey = crypto.randomUUID();
    const createRes = await request(app.getHttpServer())
      .post(`/accounts/${account.uuid}/transactions`)
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Idempotency-Key', idempotentKey)
      .send({
        type: TransactionType.deposit,
        currency: Currency.GBP,
        amount: 100,
        reference: 'New Deposit Transaction'
      } as CreateTransactionRequest)
      .expect(201);

    const retryRes = await request(app.getHttpServer())
      .post(`/accounts/${account.uuid}/transactions`)
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Idempotency-Key', idempotentKey)
      .send({
        type: TransactionType.deposit,
        currency: Currency.GBP,
        amount: 100,
        reference: 'New Deposit Transaction'
      } as CreateTransactionRequest)
      .expect(201);

    expect(retryRes.body).toHaveProperty('id');
    expect(retryRes.body.id).toBe(createRes.body.id);
    expect(retryRes.body.accountId).toBe(account.uuid);
    expect(retryRes.body.userId).toBe(userId);
    expect(retryRes.body.type).toBe(TransactionType.deposit);
    expect(retryRes.body.amount).toBe(100);
    expect(retryRes.body.currency).toBe(Currency.GBP);
    expect(retryRes.body.reference).toBe('New Deposit Transaction');
    expect(retryRes.body).toHaveProperty('createdTimestamp');
    expect(retryRes.body).toHaveProperty('updatedTimestamp');
  });

  it('retrieving a transaction that does not exist should return not found', async () => {
    // Simulate a user creating an account
    const account = await createTestAccount(module, userId, 'Test Account 1')

    await request(app.getHttpServer())
      .get(`/accounts/${account.uuid}/transactions/90661316-3fcd-42a6-a287-29ae9cb9412c`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(404);
  });

  it('bad account id should fail', async () => {
    // Simulate a user creating an account
    await createTestAccount(module, userId, 'Test Account 1')

    await request(app.getHttpServer())
      .post(`/accounts/random-bad-id/transactions`)
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Idempotency-Key', crypto.randomUUID())
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

    await request(app.getHttpServer())
      .post(`/accounts/${differentUserAccount.uuid}/transactions`)
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Idempotency-Key', crypto.randomUUID())
      .send({
        type: TransactionType.deposit,
        currency: Currency.GBP,
        amount: 100,
        reference: 'New Deposit Transaction'
      } as CreateTransactionRequest)
      .expect(404);
  });

  it('creates and retrieves an transaction', async () => {
    // Simulate a user creating an account
    const account = await createTestAccount(module, userId, 'Test Account 1')

    const createRes = await request(app.getHttpServer())
      .post(`/accounts/${account.uuid}/transactions`)
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Idempotency-Key', crypto.randomUUID())
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
    expect(createRes.body.status).toBe(TransactionStatus.pending); // Pending Initially (Processor Does it "OOB")
    expect(createRes.body.amount).toBe(100);
    expect(createRes.body.currency).toBe(Currency.GBP);
    expect(createRes.body.reference).toBe('New Deposit Transaction');
    expect(createRes.body).toHaveProperty('createdTimestamp');
    expect(createRes.body).toHaveProperty('updatedTimestamp');

    const getRes = await request(app.getHttpServer())
      .get(`/accounts/${account.uuid}/transactions/${createRes.body.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(getRes.body).toHaveProperty('id');
    expect(getRes.body.accountId).toBe(account.uuid);
    expect(getRes.body.userId).toBe(userId);
    expect(getRes.body.type).toBe(TransactionType.deposit);
    expect(getRes.body.status).toBe(TransactionStatus.completed); // Should now be Completed via the Processor
    expect(getRes.body.amount).toBe(100);
    expect(getRes.body.currency).toBe(Currency.GBP);
    expect(getRes.body.reference).toBe('New Deposit Transaction');
    expect(getRes.body).toHaveProperty('createdTimestamp');
    expect(getRes.body).toHaveProperty('updatedTimestamp');

    const accountRepo = module.get(getRepositoryToken(AccountEntity)) as Repository<AccountEntity>;
    const freshAccount = await accountRepo.findOne({ where: { uuid: account.uuid } });

    expect(freshAccount).toHaveProperty('balance');
    expect(freshAccount?.balance).toBe(100);
  });

  it('creating a transaction with a different currency to the account should fail', async () => {
    // Simulate a user creating an account
    const account = await createTestAccount(module, userId, 'Test Account 1')

    await request(app.getHttpServer())
      .post(`/accounts/${account.uuid}/transactions`)
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Idempotency-Key', crypto.randomUUID())
      .send({
        type: TransactionType.deposit,
        currency: Currency.USD,
        amount: 100,
        reference: 'New Deposit Transaction'
      } as CreateTransactionRequest)
      .expect(400);
  });

  it('simultaneous transaction locking and balance update', async () => {
    // Simulate a user creating an account
    const account = await createTestAccount(module, userId, 'Test Account 1')

    const transactionPayload = {
      type: TransactionType.deposit,
      currency: Currency.GBP,
      amount: 100,
      reference: 'New Deposit Transaction'
    } as CreateTransactionRequest

    // Create two promises that run in parallel
    const [tx1Res, tx2Res, tx3Res] = await Promise.all([
      request(app.getHttpServer())
        .post(`/accounts/${account.uuid}/transactions`)
        .set('Authorization', `Bearer ${accessToken}`)
        .set('Idempotency-Key', crypto.randomUUID())
        .send(transactionPayload),

      request(app.getHttpServer())
        .post(`/accounts/${account.uuid}/transactions`)
        .set('Authorization', `Bearer ${accessToken}`)
        .set('Idempotency-Key', crypto.randomUUID())
        .send(transactionPayload),

      request(app.getHttpServer())
        .post(`/accounts/${account.uuid}/transactions`)
        .set('Authorization', `Bearer ${accessToken}`)
        .set('Idempotency-Key', crypto.randomUUID())
        .send(transactionPayload)
    ]);

    expect(tx1Res.body).toHaveProperty('id');
    expect(tx2Res.body).toHaveProperty('id');
    expect(tx3Res.body).toHaveProperty('id');

    const accountRepo = module.get(getRepositoryToken(AccountEntity)) as Repository<AccountEntity>;
    const freshAccount = await accountRepo.findOne({ where: { uuid: account.uuid } });

    expect(freshAccount).toHaveProperty('balance');
    expect(freshAccount?.balance).toBe(300);

    const transactionsRepo = module.get(getRepositoryToken(TransactionEntity)) as Repository<TransactionEntity>;
    const transactions = await transactionsRepo.find({ where: { accountId: account.uuid } });

    expect(transactions).toHaveLength(3);
  });


  it('simultaneous transaction locking and testing for failures', async () => {
    // Simulate a user creating an account
    const account = await createTestAccount(module, userId, 'Test Account 1')

    const transactionDepositPayload = {
      type: TransactionType.deposit,
      currency: Currency.GBP,
      amount: 100,
      reference: 'New Deposit Transaction'
    } as CreateTransactionRequest

    const transactionWithdrawalPayload = {
      type: TransactionType.withdrawal,
      currency: Currency.GBP,
      amount: 100,
      reference: 'New Withdrawal Transaction'
    } as CreateTransactionRequest

    // Create two promises that run in parallel
    const [tx1Res, tx2Res, tx3Res] = await Promise.all([
      request(app.getHttpServer())
        .post(`/accounts/${account.uuid}/transactions`)
        .set('Authorization', `Bearer ${accessToken}`)
        .set('Idempotency-Key', crypto.randomUUID())
        .send(transactionDepositPayload),

      request(app.getHttpServer())
        .post(`/accounts/${account.uuid}/transactions`)
        .set('Authorization', `Bearer ${accessToken}`)
        .set('Idempotency-Key', crypto.randomUUID())
        .send(transactionWithdrawalPayload),

      request(app.getHttpServer())
        .post(`/accounts/${account.uuid}/transactions`)
        .set('Authorization', `Bearer ${accessToken}`)
        .set('Idempotency-Key', crypto.randomUUID())
        .send(transactionWithdrawalPayload)
    ]);

    expect(tx1Res.statusCode).toBe(201);
    expect(tx2Res.statusCode).toBe(201);
    expect(tx3Res.statusCode).toBe(422);

    const accountRepo = module.get(getRepositoryToken(AccountEntity)) as Repository<AccountEntity>;
    const freshAccount = await accountRepo.findOne({ where: { uuid: account.uuid } });

    expect(freshAccount).toHaveProperty('balance');
    expect(freshAccount?.balance).toBe(0);

    const transactionsRepo = module.get(getRepositoryToken(TransactionEntity)) as Repository<TransactionEntity>;
    const transactions = await transactionsRepo.find({ where: { accountId: account.uuid } });

    expect(transactions).toHaveLength(3);
  });

  it('retrieves a list of transactions for an account', async () => {
    // Simulate a user creating an account
    const account = await createTestAccount(module, userId, 'Test Account 1')

    const transactionDepositPayload = {
      type: TransactionType.deposit,
      currency: Currency.GBP,
      amount: 100,
      reference: 'New Deposit Transaction'
    } as CreateTransactionRequest

    const transactionWithdrawalPayload = {
      type: TransactionType.withdrawal,
      currency: Currency.GBP,
      amount: 100,
      reference: 'New Withdrawal Transaction'
    } as CreateTransactionRequest

    // Create two promises that run in parallel
    const [tx1Res, tx2Res, tx3Res] = await Promise.all([
      request(app.getHttpServer())
        .post(`/accounts/${account.uuid}/transactions`)
        .set('Authorization', `Bearer ${accessToken}`)
        .set('Idempotency-Key', crypto.randomUUID())
        .send(transactionDepositPayload),

      request(app.getHttpServer())
        .post(`/accounts/${account.uuid}/transactions`)
        .set('Authorization', `Bearer ${accessToken}`)
        .set('Idempotency-Key', crypto.randomUUID())
        .send(transactionWithdrawalPayload),

      request(app.getHttpServer())
        .post(`/accounts/${account.uuid}/transactions`)
        .set('Authorization', `Bearer ${accessToken}`)
        .set('Idempotency-Key', crypto.randomUUID())
        .send(transactionWithdrawalPayload)
    ]);

    const getRes = await request(app.getHttpServer())
      .get(`/accounts/${account.uuid}/transactions`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(getRes.body).toHaveProperty('transactions');
    expect(getRes.body.transactions).toHaveLength(3);
  });

  it('process transaction should throw not found when transaction does not exist', async () => {
    const processTransactionHandler = module.get(ProcessTransactionHandler) as ProcessTransactionHandler;

    await expect(processTransactionHandler.handle({ transactionId: crypto.randomUUID() })).rejects.toThrow(NotFoundException);
  });
});
