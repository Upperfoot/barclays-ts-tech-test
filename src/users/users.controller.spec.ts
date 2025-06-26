import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { typeOrmConfig } from '../app.module';
import { setupApp } from '../common/app.setup';
import { AuthModule } from '../auth/auth.module';
import { clearTables } from '../common/auth-test-helper';
import { UsersModule } from './users.module';

describe('UsersController (Integration)', () => {
  let app: INestApplication;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({ ...typeOrmConfig, database: ':memory:', dropSchema: true } as TypeOrmModuleOptions),
        AuthModule,
        UsersModule,
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
  })

  it('creates a new user', async () => {
    // Simulate a user creating an account
    const createRes = await request(app.getHttpServer())
      .post('/users')
      .send({
        name: "Joe Bloggs",
        email: "joe@bloggs.com",
        phoneNumber: "+447912345678",
        password: "MajorRabbit23!1@",
        address: {
          line1: "string",
          line2: "string",
          line3: "string",
          town: "string",
          county: "string",
          postcode: "string"
        }
      })
      // .expect(201);

      console.log(createRes.body);

    expect(createRes.body).toHaveProperty('email');
    expect(createRes.body.name).toBe('Joe Bloggs');
    expect(createRes.body.email).toBe('joe@bloggs.com');
    expect(createRes.body.phoneNumber).toBe('+447912345678');
  });

  it('rejects unknown fields in payload', async () => {
    await request(app.getHttpServer())
      .post('/users')
      .send({
        name: "Joe Bloggs",
        email: "joe@bloggs.com",
        phoneNumber: "+447912345678",
        address: {
          line1: "string",
          line2: "string",
          line3: "string",
          town: "string",
          county: "string",
          postcode: "string"
        },
        sneakyField: "sneaky field!"
      })
      .expect(400);
  });

  it('rejects missing fields in payload', async () => {
    await request(app.getHttpServer())
      .post('/users')
      .send({
        name: "Joe Bloggs",
        address: {
          line1: "string",
          line2: "string",
          line3: "string",
          town: "string",
          county: "string",
          postcode: "string"
        },
      })
      .expect(400);
  });
});
