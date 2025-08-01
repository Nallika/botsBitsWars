import crypto from 'crypto';
import jwt from 'jsonwebtoken';

import { tokenData } from '../types';
import logger from '../services/logger/logger';

export const createChatId = (userId: string): string => {
  return crypto
    .createHash('md5')
    .update(`${userId}_${Date.now()}`)
    .digest('hex');
};

export const verifyToken = (token: string): tokenData | false => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET as string) as tokenData;
  } catch (error) {
    logger.error('Invalid token: %s', error);

    return false;
  }
};
