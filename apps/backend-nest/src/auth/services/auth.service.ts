import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Response } from 'express';

import { AuthData } from '@repo/shared-types';
import { User, UserDocument } from '../schemas/user.schema';

const JWT_SECRET = process.env.JWT_SECRET as string;
const SALT_ROUNDS = 10;

// Handles auth business logic: credentials, tokens, and cookies.
@Injectable()
export class AuthService {
  constructor(@InjectModel(User.name) private readonly userModel: Model<UserDocument>) {}

  // Register a new user and set auth cookie.
  async register(authData: AuthData, res: Response): Promise<void> {
    const existing = await this.userModel.findOne({ email: authData.email });

    if (existing) {
      throw new Error('Email already in use');
    }

    const hash = await bcrypt.hash(authData.password, SALT_ROUNDS);
    const user = new this.userModel({ email: authData.email, password: hash });
    await user.save();

    const token = this.createToken(user.id);
    this.setCookie(res, token);
  }

  // Validate credentials and set auth cookie.
  async login(email: string, password: string, res: Response): Promise<void> {
    const user = await this.userModel.findOne({ email });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      throw new Error('Invalid credentials');
    }

    const token = this.createToken(user.id);
    this.setCookie(res, token);
  }

  // Write the auth cookie with consistent security options.
  setCookie(res: Response, token: string): void {
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: (process.env.NODE_ENV === 'production' ? 'strict' : 'lax') as
        | 'strict'
        | 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000,
      path: '/',
      ...(process.env.NODE_ENV === 'production' && {
        domain: process.env.COOKIE_DOMAIN,
      }),
    };

    res.cookie('auth-token', token, cookieOptions);
  }

  // Clear auth cookie on logout or invalid token.
  clearCookie(res: Response): void {
    res.clearCookie('auth-token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: (process.env.NODE_ENV === 'production' ? 'strict' : 'lax') as
        | 'strict'
        | 'lax',
      path: '/',
    });
  }

  // Create a signed JWT for a user.
  createToken(userId: string): string {
    const currentTime = Math.floor(Date.now() / 1000);

    return jwt.sign({ userId, currentTime }, JWT_SECRET, {
      expiresIn: '30d',
    });
  }

  // Verify JWT and ensure the user still exists.
  async verifyToken(token: string): Promise<{ userId: string } | null> {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as {
        userId: string;
        currentTime: number;
      };

      const user = await this.userModel.findById(decoded.userId);
      if (!user) {
        return null;
      }

      return { userId: decoded.userId };
    } catch {
      return null;
    }
  }

  // Read auth token from parsed cookies.
  extractTokenFromCookies(cookies: Record<string, string> | undefined): string | null {
    return cookies?.['auth-token'] ?? null;
  }
}
