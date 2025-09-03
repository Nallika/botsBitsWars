import jwt from 'jsonwebtoken';
import crypto from 'crypto';

import { tokenData } from '../types';
import { logger } from '../services/logger';

export const verifyToken = (token: string): tokenData | false => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET as string) as tokenData;
  } catch (error) {
    logger.error('Invalid token: %s', error);

    return false;
  }
};

export const createChatId = (userId: string): string => {
  return crypto
    .createHash('md5')
    .update(`${userId}_${Date.now()}`)
    .digest('hex');
};

export const generateMessageId = (): string => {
  return `msg_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
};
