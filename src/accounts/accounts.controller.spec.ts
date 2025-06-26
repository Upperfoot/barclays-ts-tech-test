import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { AccountsModule } from './accounts.module';
import { AccountType, Currency } from './account.entity';
import { typeOrmConfig } from '../app.module';
import { setupApp } from '../common/app.setup';
import { AuthModule } from '../auth/auth.module';
import { createTestUser, createUserTokens } from '../common/auth-test-helper';

describe('AccountsController (Integration)', () => {
  let app: INestApplication;
  let accessToken: string;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({ ...typeOrmConfig, database: ':memory:', dropSchema: true } as TypeOrmModuleOptions),
        AuthModule,
        AccountsModule,
      ],
    }).compile();

    app = module.createNestApplication();

    setupApp(app);

    const testUser = await createTestUser(module);
    const testUserTokens = await createUserTokens(module, testUser);

    accessToken = testUserTokens.accessToken;

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('creates and retrieves an account', async () => {
    // Simulate a user creating an account (injected userId manually for now)
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
});
