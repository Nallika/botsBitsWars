import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Response } from 'express';

import { AuthData } from '@repo/shared-types/src';
import { User, IUser } from '../../models/User';
import { SALT_ROUNDS } from '../../constants';
import logger from '../logger/logger';

const JWT_SECRET = process.env.JWT_SECRET as string;

export class AuthService {
  static async register(
    { email, password }: AuthData,
    res: Response
  ): Promise<void> {
    const existing = await User.findOne({ email });

    if (existing) {
      throw new Error('Email already in use');
    }

    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = new User({ email, password: hash });
    await user.save();

    const token = AuthService.createToken(user);
    AuthService.setCookie(res, token);
    logger.info('Setting authentication cookie', { coockies: res.cookie });
  }

  static async login(
    email: string,
    password: string,
    res: Response
  ): Promise<void> {
    const user = await User.findOne({ email });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      throw new Error('Invalid credentials');
    }

    const token = AuthService.createToken(user);
    AuthService.setCookie(res, token);
  }

  static setCookie(res: Response, token: string): void {
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: (process.env.NODE_ENV === 'production' ? 'strict' : 'lax') as
        | 'strict'
        | 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      path: '/', // Ensure cookie is available for all paths
      // In development, don't set domain to allow localhost cookies to work
      ...(process.env.NODE_ENV === 'production' && {
        domain: process.env.COOKIE_DOMAIN,
      }),
    };

    res.cookie('auth-token', token, cookieOptions);
  }

  static clearCookie(res: Response): void {
    res.clearCookie('auth-token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: (process.env.NODE_ENV === 'production' ? 'strict' : 'lax') as
        | 'strict'
        | 'lax',
      path: '/',
    });
  }

  static createToken(user: IUser): string {
    const currentTime = Math.floor(Date.now() / 1000);

    return jwt.sign({ userId: user._id, currentTime }, JWT_SECRET, {
      expiresIn: '30d',
    });
  }

  static async verifyToken(token: string): Promise<{ userId: string } | null> {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as {
        userId: string;
        currentTime: number;
      };
      const user = await User.findOne({ _id: decoded.userId });

      if (!user) {
        return null;
      }

      return { userId: decoded.userId };
    } catch (error) {
      return null;
    }
  }

  static extractTokenFromCookies(cookies: any): string | null {
    logger.info('Extracting token from cookies', { cookies });
    return cookies['auth-token'] || null;
  }
}
