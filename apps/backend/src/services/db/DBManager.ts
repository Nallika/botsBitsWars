import mongoose from 'mongoose';
import logger from '../logger/logger';

export class DBManager {
  private static instance: DBManager;
  private isConnected = false;

  private constructor() {}

  public static getInstance(): DBManager {
    if (!DBManager.instance) {
      DBManager.instance = new DBManager();
    }

    return DBManager.instance;
  }

  public async connect(uri: string): Promise<void> {
    if (this.isConnected) {
      return;
    }

    try {
      await mongoose.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      } as any);
      this.isConnected = true;
      logger.info('MongoDB connected');
    } catch (err) {
      logger.error('MongoDB connection error:', err);
      throw err;
    }
  }

  public async disconnect(): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    await mongoose.disconnect();
    this.isConnected = false;
    logger.info('MongoDB disconnected');
  }

  // ChatSession CRUD methods
  public static async createSession(sessionData: any) {
    const { ChatSession } = await import('../../models/ChatSession');
    return ChatSession.create(sessionData);
  }

  public static async getSessionById(sessionId: string) {
    const { ChatSession } = await import('../../models/ChatSession');
    return ChatSession.findOne({ sessionId });
  }

  public static async updateSession(sessionId: string, update: any) {
    const { ChatSession } = await import('../../models/ChatSession');
    return ChatSession.findOneAndUpdate({ sessionId }, update, { new: true });
  }
}
