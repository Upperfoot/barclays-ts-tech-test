import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { AccountsModule } from './accounts.module';
import { AccountType, Currency } from './account.entity';
import { typeOrmConfig } from '../app.module';
import { setupApp } from '../common/app.setup';
import { AuthModule } from '../auth/auth.module';
import { clearTables, createTestUser, createUserTokens } from '../common/auth-test-helper';
import * as RandomUtils from '../common/helpers';

describe('AccountsController (Integration)', () => {
  let app: INestApplication;
  let module: TestingModule;
  let accessToken: string;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({ ...typeOrmConfig, database: ':memory:', dropSchema: true } as TypeOrmModuleOptions),
        AuthModule,
        AccountsModule,
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
  })

  it('creates and retrieves an account', async () => {
    // Simulate a user creating an account
    const createRes = await request(app.getHttpServer())
      .post('/accounts')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'My Test Account',
        accountType: AccountType.personal,
        currency: Currency.GBP
      })
      .expect(201);

    expect(createRes.body).toHaveProperty('id');
    expect(createRes.body.name).toBe('My Test Account');
    expect(createRes.body.accountType).toBe(AccountType.personal);

    // Retrieve accounts for user
    const res = await request(app.getHttpServer())
      .get(`/accounts`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(res.body).toHaveProperty('accounts');

    expect(res.body.accounts.length).toBe(1);
    expect(res.body.accounts[0].name).toBe('My Test Account');
  });

  it('rejects unknown fields in payload', async () => {
    await request(app.getHttpServer())
      .post('/accounts')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Hacker Account',
        accountType: AccountType.personal,
        userId: 'someone-else',
        sneakyField: 'very-very-sneaky!' // unexpected field
      })
      .expect(400);
  });

  it('rejects unauthorised request', async () => {
    await request(app.getHttpServer())
      .post('/accounts')
      .set('Authorization', `Bearer Fake-Token-Here`)
      .send({
        name: 'Hacker Account',
        accountType: AccountType.personal,
        userId: 'someone-else',
        sneakyField: 'very-very-sneaky!' // unexpected field
      })
      .expect(401);
  });

  it('fails with duplicate account name for user', async () => {
    // Simulate a user creating an account
    const createRes = await request(app.getHttpServer())
      .post('/accounts')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'My Test Account',
        accountType: AccountType.personal,
        currency: Currency.GBP
      })
      .expect(201);

    expect(createRes.body).toHaveProperty('id');
    expect(createRes.body.name).toBe('My Test Account');
    expect(createRes.body.accountType).toBe(AccountType.personal);

    await request(app.getHttpServer())
      .post('/accounts')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'My Test Account',
        accountType: AccountType.personal,
        currency: Currency.GBP
      })
      .expect(409);
  });

  it('creates and deletes an account', async () => {
    // Simulate a user creating an account
    const createRes = await request(app.getHttpServer())
      .post('/accounts')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'My Test Account',
        accountType: AccountType.personal,
        currency: Currency.GBP
      })
      .expect(201);

    expect(createRes.body).toHaveProperty('id');
    expect(createRes.body.name).toBe('My Test Account');
    expect(createRes.body.accountType).toBe(AccountType.personal);

    // Retrieve accounts for user
    await request(app.getHttpServer())
      .delete(`/accounts/${createRes.body.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(204);
  });

  it('attempt to delete invalid account', async () => {
    // Retrieve accounts for user
    await request(app.getHttpServer())
      .delete(`/accounts/307c5efb-e84a-48d8-81ed-d73c76ebf7a1`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(404);
  })

  it('updates an existing account', async () => {
    // Simulate a user creating an account
    const createRes = await request(app.getHttpServer())
      .post('/accounts')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'My Test Account',
        accountType: AccountType.personal,
        currency: Currency.GBP
      })
      .expect(201);

    expect(createRes.body).toHaveProperty('id');
    expect(createRes.body.name).toBe('My Test Account');
    expect(createRes.body.accountType).toBe(AccountType.personal);

    // Simulate a user creating an account
    const patchRes = await request(app.getHttpServer())
      .patch(`/accounts/${createRes.body.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'My Test Account Updated',
        accountType: AccountType.personal,
        currency: Currency.GBP
      })
      .expect(200);

    expect(patchRes.body).toHaveProperty('id');
    expect(patchRes.body.name).toBe('My Test Account Updated');
    expect(patchRes.body.accountType).toBe(AccountType.personal);
  });

  it('patch should fail on incorrect id in path', async () => {
    // Simulate a user creating an account
    const createRes = await request(app.getHttpServer())
      .post('/accounts')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'My Test Account',
        accountType: AccountType.personal,
        currency: Currency.GBP
      })
      .expect(201);

    expect(createRes.body).toHaveProperty('id');
    expect(createRes.body.name).toBe('My Test Account');
    expect(createRes.body.accountType).toBe(AccountType.personal);

    // Simulate a user creating an account
    const patchRes = await request(app.getHttpServer())
      .patch(`/accounts/blah`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'My Test Account Updated',
        accountType: AccountType.personal,
        currency: Currency.GBP
      })
      .expect(404);
  });

  it('patch should fail with conflict due to name already existing', async () => {
    // Simulate a user creating an account
    const createRes = await request(app.getHttpServer())
      .post('/accounts')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'My Test Account',
        accountType: AccountType.personal,
        currency: Currency.GBP
      })
      .expect(201);

    expect(createRes.body).toHaveProperty('id');
    expect(createRes.body.name).toBe('My Test Account');
    expect(createRes.body.accountType).toBe(AccountType.personal);

    // Simulate a user creating an account
    const createRes2 = await request(app.getHttpServer())
      .post('/accounts')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'My Test Account 2',
        accountType: AccountType.personal,
        currency: Currency.GBP
      })
      .expect(201);

    expect(createRes2.body).toHaveProperty('id');
    expect(createRes2.body.name).toBe('My Test Account 2');
    expect(createRes2.body.accountType).toBe(AccountType.personal);

    // Should fail due to name already existing
     await request(app.getHttpServer())
      .patch(`/accounts/${createRes.body.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'My Test Account 2',
        accountType: AccountType.personal,
        currency: Currency.GBP
      })
      .expect(409);
  });


  it('create should fail with conflict due to account + sort already existing', async () => {
    jest.spyOn(RandomUtils, 'randomDigitString').mockImplementation((number) => {
      if(number === 8) {
        return '12345678';
      } else if (number === 6) {
        return '123456'
      } else {
        return '';
      }
    });

    // Simulate a user creating an account
    const createRes = await request(app.getHttpServer())
      .post('/accounts')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'My Test Account',
        accountType: AccountType.personal,
        currency: Currency.GBP
      })
      .expect(201);

    expect(createRes.body).toHaveProperty('id');
    expect(createRes.body.name).toBe('My Test Account');
    expect(createRes.body.accountType).toBe(AccountType.personal);

    // Simulate a user creating an account, should fail due to account number and sort code being the same
    const createRes2 = await request(app.getHttpServer())
      .post('/accounts')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'My Test Account 2',
        accountType: AccountType.personal,
        currency: Currency.GBP
      })
      .expect(409);
  });
});
