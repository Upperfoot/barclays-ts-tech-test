import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { AccountsModule } from './accounts.module';
import { AccountType, Currency } from './account.entity';
import { typeOrmConfig } from '../app.module';
import { setupApp } from '../main';

describe('AccountsController (Integration)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({ ...typeOrmConfig, database: ':memory:', dropSchema: true } as TypeOrmModuleOptions),
        AccountsModule,
      ],
    }).compile();

    app = module.createNestApplication();

    setupApp(app);

    await app.init();
  });

  it('creates and retrieves an account', async () => {
    const userId = 'test-user-123';

    // Simulate a user creating an account (injected userId manually for now)
    const createRes = await request(app.getHttpServer())
      .post('/accounts')
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
    const getRes = await request(app.getHttpServer())
      .get(`/accounts`)
      .expect(200);

    expect(getRes.body.length).toBe(1);
    expect(getRes.body[0].name).toBe('My Test Account');
  });

  it('rejects unknown fields in payload', async () => {
    await request(app.getHttpServer())
      .post('/accounts')
      .send({
        name: 'Hacker Account',
        accountType: AccountType.personal,
        userId: 'someone-else',
        sneakyField: 'very-very-sneaky!' // unexpected field
      })
      .expect(400);
  });
});
