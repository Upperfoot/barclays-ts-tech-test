import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AuthModule } from './auth.module'; // assuming this bundles controller + service
import { getRepositoryToken, TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Address, UserEntity } from '../users/user.entity';
import * as bcrypt from 'bcrypt';
import { typeOrmConfig } from '../app.module';
import { setupApp } from '../common/app.setup';
import { Repository } from 'typeorm';

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
        imports: [
        TypeOrmModule.forRoot({ ...typeOrmConfig, database: ':memory:', dropSchema: true } as TypeOrmModuleOptions),
        TypeOrmModule.forFeature([UserEntity]),
        AuthModule,
        ],
    }).compile();

    app = module.createNestApplication();

    setupApp(app);
    
    await app.init();
    
    const userRepo = module.get(getRepositoryToken(UserEntity)) as Repository<UserEntity>;

    await userRepo.save({
      email: 'test@example.com',
      name: 'test',
      phoneNumber: '+447906924825',
      address: {
        line1: '58 Random Road',
        line2: 'Random Place',
        line3: 'Really Random Place',
        town: 'Random City',
        county: 'Random County',
        postcode: 'R1 3RR'
      } as Address,
      password: await bcrypt.hash('password123', 10),
    });
  });

  afterAll(async () => {
    await app.close();
  });

  it('should login with valid credentials', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'test@example.com', password: 'password123' })
      .expect(200);

    expect(res.body).toHaveProperty('accessToken');
    expect(typeof res.body.accessToken).toBe('string');
  });

  it('should fail with incorrect password', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'test@example.com', password: 'wrongpass' })
      .expect(401);

    expect(res.body.message).toMatch(/Invalid credentials/i);
  });

  it('should fail with missing fields', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'test@example.com' })
      .expect(400);
  });

  it('should fail with non-existing user', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'ghost@example.com', password: 'irrelevant' })
      .expect(401);
  });
});
