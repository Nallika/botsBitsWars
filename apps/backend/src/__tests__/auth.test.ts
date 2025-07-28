import 'dotenv/config';
import supertest from 'supertest';
import { createServer } from '../server';
import mongoose from 'mongoose';
import { DBManager } from '../services/db/DBManager';

const MONGO_URI = process.env.MONGO_URI_TEST;

/**
 * Auth API integration tests.
 */
describe('Auth API', () => {
  let app: ReturnType<typeof createServer>;

  beforeAll(async () => {
    if (!MONGO_URI) {
      throw new Error('MONGO_URI_TEST environment variable is not set');
    }

    await DBManager.getInstance().connect(MONGO_URI);
    app = createServer();
  });

  beforeEach(async () => {
    // Clean users collection before each test
    await mongoose.connection.db.collection('users').deleteMany({});
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  const user = {
    email: 'test@example.com',
    password: 'password123',
  };

  it('registers a new user', async () => {
    const res = await supertest(app)
      .post('/api/auth/register')
      .send(user)
      .expect(201);

    expect(res.body.email).toBe(user.email);
    expect(res.body.id).toBeDefined();
  });

  it('does not allow duplicate registration', async () => {
    await supertest(app).post('/api/auth/register').send(user);
    const res = await supertest(app)
      .post('/api/auth/register')
      .send(user)
      .expect(400);

    expect(res.body.error).toBe('Registration failed. Please try again.');
  });

  it('logs in with correct credentials', async () => {
    await supertest(app).post('/api/auth/register').send(user);
    const res = await supertest(app)
      .post('/api/auth/login')
      .send(user)
      .expect(200);

    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe(user.email);
  });

  it('rejects login with wrong password', async () => {
    await supertest(app).post('/api/auth/register').send(user);
    const res = await supertest(app)
      .post('/api/auth/login')
      .send({
        ...user,
        password: 'wrongpass',
      })
      .expect(400);

    expect(res.body.error).toBe('Login failed. Please check your credentials.');
  });
});
