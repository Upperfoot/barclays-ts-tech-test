import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { typeOrmConfig } from '../app.module';
import { setupApp } from '../common/app.setup';
import { AuthModule } from '../auth/auth.module';
import { clearTables, createTestUser, createUserTokens } from '../common/auth-test-helper';
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
      .expect(201);

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

  it('retrieves currently logged in user details from token', async () => {
    const testUser = await createTestUser(module);
    const testUserTokens = await createUserTokens(module, testUser);
    const accessToken = testUserTokens.accessToken;

    const res = await request(app.getHttpServer())
      .get('/users/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(res.body).toHaveProperty('email');
    expect(res.body.name).toBe('test');
    expect(res.body.email).toBe('test@example.com');
    expect(res.body.phoneNumber).toBe('+447912345678');
    expect(res.body).toHaveProperty('address');
    expect(res.body.address.line1).toBe('58 Random Road');
    expect(res.body.address.line2).toBe('Random Place');
    expect(res.body.address.line3).toBe('Really Random Place');
    expect(res.body.address.town).toBe('Random City');
    expect(res.body.address.county).toBe('Random County');
    expect(res.body.address.postcode).toBe('R1 3RR');
  });

  it('delete user from table', async () => {
    const testUser = await createTestUser(module);
    const testUserTokens = await createUserTokens(module, testUser);
    const accessToken = testUserTokens.accessToken;

    const res = await request(app.getHttpServer())
      .delete('/users/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(204);
  });

  it('patches user with specific data', async () => {
    // Simulate a user creating an account
    const testUser = await createTestUser(module);
    const testUserTokens = await createUserTokens(module, testUser);
    const accessToken = testUserTokens.accessToken;

    // Simulate a user creating an account
    const patchRes = await request(app.getHttpServer())
      .patch('/users')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: "Joe Bloggs",
        phoneNumber: "+447987654321",
        address: {
          line1: "New Road",
          line2: "New Place",
          line3: "New Other Place",
          town: "Other Town",
          county: "Other County",
          postcode: "OT1 1OT"
        }
      })
      .expect(200);

    expect(patchRes.body).toHaveProperty('email');
    expect(patchRes.body.name).toBe('Joe Bloggs');
    expect(patchRes.body.email).toBe('test@example.com'); // Should not be changed
    expect(patchRes.body.phoneNumber).toBe('+447987654321');
    expect(patchRes.body).toHaveProperty('address');
    expect(patchRes.body.address.line1).toBe('New Road');
    expect(patchRes.body.address.line2).toBe('New Place');
    expect(patchRes.body.address.line3).toBe('New Other Place');
    expect(patchRes.body.address.town).toBe('Other Town');
    expect(patchRes.body.address.county).toBe('Other County');
    expect(patchRes.body.address.postcode).toBe('OT1 1OT');
  });
});
