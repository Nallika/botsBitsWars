import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import cookieParser from 'cookie-parser';
import { json, urlencoded } from 'express';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI_TEST;

describe('Auth (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    if (!MONGO_URI) {
      throw new Error('MONGO_URI_TEST environment variable is not set');
    }
    process.env.MONGO_URI = MONGO_URI;

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    app.use(json({ limit: '1mb' }));
    app.use(urlencoded({ extended: true, limit: '1mb' }));
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        validationError: { target: false, value: false },
      }),
    );
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await mongoose.connection.db.collection('users').deleteMany({});
  });

  const user = {
    email: 'test@example.com',
    password: 'Password123',
  };

  it('registers a new user', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send(user)
      .expect(201);

    expect(res.body.email).toBe(user.email);
  });

  it('does not allow duplicate registration', async () => {
    await request(app.getHttpServer()).post('/auth/register').send(user);
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send(user)
      .expect(400);

    expect(res.body.message).toBe('Email already in use');
  });

  it('logs in with correct credentials', async () => {
    await request(app.getHttpServer()).post('/auth/register').send(user);
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send(user)
      .expect(201);

    expect(res.body.email).toBe(user.email);
  });

  it('rejects login with wrong password', async () => {
    await request(app.getHttpServer()).post('/auth/register').send(user);
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        ...user,
        password: 'wrongpass',
      })
      .expect(400);

    expect(res.body.message).toBe('Invalid credentials');
  });

  it('rejects login with non-existent user', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'nonexistent@example.com',
        password: 'Password123',
      })
      .expect(400);

    expect(res.body.message).toBe('Invalid credentials');
  });

  it('allows user to logout', async () => {
    await request(app.getHttpServer()).post('/auth/register').send(user);
    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send(user)
      .expect(201);

    const cookies = loginRes.headers['set-cookie'];

    const res = await request(app.getHttpServer())
      .post('/auth/logout')
      .set('Cookie', cookies)
      .expect(201);

    expect(res.body.message).toBe('Logout successful');
  });

  it('gets user info with valid token', async () => {
    await request(app.getHttpServer()).post('/auth/register').send(user);
    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send(user)
      .expect(201);

    const cookies = loginRes.headers['set-cookie'];

    const res = await request(app.getHttpServer())
      .get('/auth/me')
      .set('Cookie', cookies)
      .expect(200);

    expect(res.body.authenticated).toBe(true);
  });

  it('rejects /me request without token', async () => {
    const res = await request(app.getHttpServer()).get('/auth/me').expect(401);

    expect(res.body.message).toBe('Unauthorized');
  });

  it('handles registration validation errors', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'invalid-email',
        password: '123',
      })
      .expect(400);

    expect(res.body.message).toBe('Validation failed');
    expect(Array.isArray(res.body.errors)).toBe(true);
  });

  it('handles login validation errors', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: '',
        password: '',
      })
      .expect(400);

    expect(res.body.message).toBe('Validation failed');
    expect(Array.isArray(res.body.errors)).toBe(true);
  });
});
