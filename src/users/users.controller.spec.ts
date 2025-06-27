import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, NotFoundException } from '@nestjs/common';
import * as request from 'supertest';
import {
  getRepositoryToken,
  TypeOrmModule,
  TypeOrmModuleOptions,
} from '@nestjs/typeorm';
import { typeOrmConfig } from '../app.module';
import { setupApp } from '../common/app.setup';
import { AuthModule } from '../auth/auth.module';
import {
  clearTables,
  createTestUser,
  createUserTokens,
} from '../common/auth-test-helper';
import { UsersModule } from './users.module';
import { CreateUserRequest } from './handlers/create.user.handler';
import { UserEntity } from './user.entity';
import { Repository } from 'typeorm';
import { DeleteUserHandler } from './handlers/delete.user.handler';
import { GetUserHandler } from './handlers/get.user.handler';
import { PatchUserHandler } from './handlers/patch.user.handler';

describe('UsersController (Integration)', () => {
  let app: INestApplication;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          ...typeOrmConfig,
          database: ':memory:',
          dropSchema: true,
        } as TypeOrmModuleOptions),
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
  });

  it('creates a new user', async () => {
    // Simulate a user creating an account
    const createRes = await request(app.getHttpServer())
      .post('/v1/users')
      .send({
        name: 'Joe Bloggs',
        email: 'joe@bloggs.com',
        phoneNumber: '+447912345678',
        password: 'MajorRabbit23!1@',
        address: {
          line1: 'string',
          line2: 'string',
          line3: 'string',
          town: 'string',
          county: 'string',
          postcode: 'string',
        },
      })
      .expect(201);

    expect(createRes.body).toHaveProperty('email');
    expect(createRes.body.name).toBe('Joe Bloggs');
    expect(createRes.body.email).toBe('joe@bloggs.com');
    expect(createRes.body.phoneNumber).toBe('+447912345678');
  });

  it('creates a new user with same email should fail', async () => {
    const createUserPayload = {
      name: 'Joe Bloggs',
      email: 'joe@bloggs.com',
      phoneNumber: '+447912345678',
      password: 'MajorRabbit23!1@',
      address: {
        line1: 'string',
        line2: 'string',
        line3: 'string',
        town: 'string',
        county: 'string',
        postcode: 'string',
      },
    } as CreateUserRequest;

    // Simulate a user creating an account
    await request(app.getHttpServer())
      .post('/v1/users')
      .send(createUserPayload)
      .expect(201);

    // Simulate creating a user with same email
    await request(app.getHttpServer())
      .post('/v1/users')
      .send(createUserPayload)
      .expect(409);
  });

  it('rejects unknown fields in payload', async () => {
    await request(app.getHttpServer())
      .post('/v1/users')
      .send({
        name: 'Joe Bloggs',
        email: 'joe@bloggs.com',
        phoneNumber: '+447912345678',
        address: {
          line1: 'string',
          line2: 'string',
          line3: 'string',
          town: 'string',
          county: 'string',
          postcode: 'string',
        },
        sneakyField: 'sneaky field!',
      })
      .expect(400);
  });

  it('rejects missing fields in payload', async () => {
    await request(app.getHttpServer())
      .post('/v1/users')
      .send({
        name: 'Joe Bloggs',
        address: {
          line1: 'string',
          line2: 'string',
          line3: 'string',
          town: 'string',
          county: 'string',
          postcode: 'string',
        },
      })
      .expect(400);
  });

  it('retrieves currently logged in user details from token', async () => {
    const testUser = await createTestUser(module);
    const testUserTokens = await createUserTokens(module, testUser);
    const accessToken = testUserTokens.accessToken;

    const res = await request(app.getHttpServer())
      .get('/v1/users/me')
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
      .delete('/v1/users/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(204);

    const getRes = await request(app.getHttpServer())
      .get('/v1/users/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(403);
  });

  it('delete get user should fail with not found found exception user is deleted', async () => {
    const testUser = await createTestUser(module);

    const userRepo = module.get(
      getRepositoryToken(UserEntity),
    ) as Repository<UserEntity>;
    await userRepo.delete(testUser.id);

    const userHandler = new DeleteUserHandler(userRepo);
    await expect(userHandler.handle({ userId: testUser.uuid })).rejects.toThrow(
      NotFoundException,
    );
  });

  it('get user should fail with not found found exception user is deleted', async () => {
    const testUser = await createTestUser(module);

    const userRepo = module.get(
      getRepositoryToken(UserEntity),
    ) as Repository<UserEntity>;
    await userRepo.delete(testUser.id);

    const userHandler = new GetUserHandler(userRepo);
    await expect(userHandler.handle({ userId: testUser.uuid })).rejects.toThrow(
      NotFoundException,
    );
  });

  it('patch user should fail with not found found exception user is deleted', async () => {
    const testUser = await createTestUser(module);

    const userRepo = module.get(
      getRepositoryToken(UserEntity),
    ) as Repository<UserEntity>;
    await userRepo.delete(testUser.id);

    const userHandler = new PatchUserHandler(userRepo);
    await expect(
      userHandler.handle({
        userId: testUser.uuid,
        data: {
          name: 'New Name',
          phoneNumber: '+447906924825',
          address: {
            ...testUser.address,
            line1: 'New House',
          },
        },
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('patches user with specific data', async () => {
    // Simulate a user creating an account
    const testUser = await createTestUser(module);
    const testUserTokens = await createUserTokens(module, testUser);
    const accessToken = testUserTokens.accessToken;

    // Simulate a user creating an account
    const patchRes = await request(app.getHttpServer())
      .patch('/v1/users/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Joe Bloggs',
        phoneNumber: '+447987654321',
        address: {
          line1: 'New Road',
          line2: 'New Place',
          line3: 'New Other Place',
          town: 'Other Town',
          county: 'Other County',
          postcode: 'OT1 1OT',
        },
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

  it('patches user with specific data', async () => {
    // Simulate a user creating an account
    const testUser = await createTestUser(module);
    const testUser2 = await createTestUser(module, {
      email: 'test2@bloggs.com',
    });
    const testUserTokens = await createUserTokens(module, testUser);
    const accessToken = testUserTokens.accessToken;

    // Simulate a user creating an account
    const patchRes = await request(app.getHttpServer())
      .patch('/v1/users/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Joe Bloggs',
        phoneNumber: '+447987654321',
        address: {
          line1: 'New Road',
          line2: 'New Place',
          line3: 'New Other Place',
          town: 'Other Town',
          county: 'Other County',
          postcode: 'OT1 1OT',
        },
      })
      .expect(200);
  });
});
