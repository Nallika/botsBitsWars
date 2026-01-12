import 'dotenv/config';
import supertest from 'supertest';
import mongoose from 'mongoose';
import { Server as HTTPServer, createServer as createHttpServer } from 'http';

import { createServer } from '../server';
import { createRoutes } from '../routes';
import { DBManager } from '../services/db/DBManager';
import { SocketManager } from '../services/socket/SocketManager';

const MONGO_URI = process.env.MONGO_URI_TEST;

/**
 * Auth API integration tests.
 */
describe('Auth API', () => {
  let app: ReturnType<typeof createServer>;
  let server: HTTPServer;

  beforeAll(async () => {
    if (!MONGO_URI) {
      throw new Error('MONGO_URI_TEST environment variable is not set');
    }

    await DBManager.getInstance().connect(MONGO_URI);

    // Create Express app
    app = createServer();

    // Create HTTP server
    server = createHttpServer(app);

    // Create SocketManager with the HTTP server
    const socketManager = new SocketManager(server);

    // Attach routes with SocketManager
    app.use('/api', createRoutes(socketManager));
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
    password: 'Password123',
  };

  it('registers a new user', async () => {
    const res = await supertest(app)
      .post('/api/auth/register')
      .send(user)
      .expect(200);

    expect(res.body.data.email).toBe(user.email);
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

    expect(res.body.data.email).toBe(user.email);
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

  it('rejects login with non-existent user', async () => {
    const res = await supertest(app)
      .post('/api/auth/login')
      .send({
        email: 'nonexistent@example.com',
        password: 'Password123',
      })
      .expect(400);

    expect(res.body.error).toBe('Login failed. Please check your credentials.');
  });

  it('allows user to logout', async () => {
    // Register and login first
    await supertest(app).post('/api/auth/register').send(user);
    const loginRes = await supertest(app)
      .post('/api/auth/login')
      .send(user)
      .expect(200);

    // Extract cookies from login response
    const cookies = loginRes.headers['set-cookie'];

    // Test logout
    const res = await supertest(app)
      .post('/api/auth/logout')
      .set('Cookie', cookies)
      .expect(200);

    expect(res.body.data.message).toBe('Logout successful');
  });

  it('gets user info with valid token', async () => {
    // Register and login first
    await supertest(app).post('/api/auth/register').send(user);
    const loginRes = await supertest(app)
      .post('/api/auth/login')
      .send(user)
      .expect(200);

    // Extract cookies from login response
    const cookies = loginRes.headers['set-cookie'];

    // Test /me endpoint
    const res = await supertest(app)
      .get('/api/auth/me')
      .set('Cookie', cookies)
      .expect(200);

    expect(res.body.data.authenticated).toBe(true);
  });

  it('rejects /me request without token', async () => {
    const res = await supertest(app).get('/api/auth/me').expect(401);

    expect(res.body.error).toBe('Unauthorized');
  });

  it('rejects /me request with invalid token', async () => {
    const res = await supertest(app)
      .get('/api/auth/me')
      .set('Cookie', ['auth-token=invalid-token'])
      .expect(403);

    expect(res.body.error).toBe('Unauthorized');
  });

  it('handles registration validation errors', async () => {
    const res = await supertest(app)
      .post('/api/auth/register')
      .send({
        email: 'invalid-email',
        password: '123',
      })
      .expect(400);

    expect(res.body.error).toBe('Validation failed');
  });

  it('handles login validation errors', async () => {
    const res = await supertest(app)
      .post('/api/auth/login')
      .send({
        email: '',
        password: '',
      })
      .expect(400);

    expect(res.body.error).toBe('Validation failed');
  });
});
