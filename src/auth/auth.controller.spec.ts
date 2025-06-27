import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AuthModule } from './auth.module'; // assuming this bundles controller + service
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { UserEntity } from '../users/user.entity';
import { typeOrmConfig } from '../app.module';
import { setupApp } from '../common/app.setup';
import { createTestUser } from '../common/auth-test-helper';

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          ...typeOrmConfig,
          database: ':memory:',
          dropSchema: true,
        } as TypeOrmModuleOptions),
        TypeOrmModule.forFeature([UserEntity]),
        AuthModule,
      ],
    }).compile();

    app = module.createNestApplication();

    setupApp(app);

    await createTestUser(module);

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should login with valid credentials', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'test@example.com', password: 'Password123!' })
      .expect(200);

    expect(res.body).toHaveProperty('accessToken');
    expect(typeof res.body.accessToken).toBe('string');
  });

  it('should fail with incorrect password strength', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'test@example.com', password: 'password123!' })
      .expect(400);

    expect(res.body.message).toMatch(/Bad Request Exception/i);
  });

  it('should fail with incorrect password', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'test@example.com', password: 'Password123!!' })
      .expect(400);

    expect(res.body.message).toMatch(/Invalid Credentials/i);
  });

  it('should fail with missing fields', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'test@example.com' })
      .expect(400);
  });

  it('should fail with non-existing user', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'ghost@example.com', password: 'Password123!' })
      .expect(400);

    expect(res.body.message).toMatch(/Invalid Credentials/i);
  });
});
