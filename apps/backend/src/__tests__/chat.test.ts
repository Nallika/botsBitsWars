import request from 'supertest';
import 'dotenv/config';
import mongoose from 'mongoose';

import { createServer } from '../server';
import { DBManager } from '../services/db/DBManager';
import { ChatSession } from '../models/ChatSession';

const MONGO_URI = process.env.MONGO_URI_TEST;

describe('Chat Session API', () => {
  let app: any;
  let userId: string;

  beforeAll(async () => {
    if (!MONGO_URI) {
      throw new Error('MONGO_URI environment variable is not set');
    }

    await DBManager.getInstance().connect(MONGO_URI);
    app = createServer();
    userId = 'testuserid';
  });

  afterAll(async () => {
    await ChatSession.deleteMany({ userId });
    await mongoose.disconnect();
  });

  it('should create a chat session', async () => {
    const res = await request(app).post('/api/chat/session').send({ userId });
    expect(res.status).toBe(200);
    expect(res.body.sessionId).toBeDefined();
    expect(res.body.session).toBeDefined();
  });

  it('should fetch a chat session', async () => {
    const createRes = await request(app)
      .post('/api/chat/session')
      .send({ userId });
    const sessionId = createRes.body.sessionId;
    const res = await request(app).get(`/api/chat/session/${sessionId}`);
    expect(res.status).toBe(200);
    expect(res.body.sessionId).toBe(sessionId);
  });
});
