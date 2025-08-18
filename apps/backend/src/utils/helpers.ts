import jwt from 'jsonwebtoken';

import { tokenData } from '../types';
import logger from '../services/logger/logger';

export const verifyToken = (token: string): tokenData | false => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET as string) as tokenData;
  } catch (error) {
    logger.error('Invalid token: %s', error);

    return false;
  }
};
