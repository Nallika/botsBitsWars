import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { User, UserDocument } from '../schemas/user.schema';

const JWT_SECRET = process.env.JWT_SECRET as string;

// Extract auth-token from cookies or raw cookie header.
const extractAuthToken = (req: Request): string | null => {
  if (!req) return null;
  if ((req as any).cookies?.['auth-token']) {
    return (req as any).cookies['auth-token'];
  }

  const cookieHeader = req.headers?.cookie;
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(';').map(value => value.trim());
  for (const cookie of cookies) {
    const [name, ...rest] = cookie.split('=');
    if (name === 'auth-token') {
      return rest.join('=');
    }
  }

  return null;
};

// Passport JWT strategy used by JwtAuthGuard.
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(@InjectModel(User.name) private readonly userModel: Model<UserDocument>) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([extractAuthToken]),
      ignoreExpiration: false,
      secretOrKey: JWT_SECRET,
    });
  }

  // Validate JWT payload and return user identity for request context.
  async validate(payload: { userId: string }): Promise<{ userId: string }> {
    const user = await this.userModel.findById(payload.userId);
    if (!user) {
      return null as unknown as { userId: string };
    }
    return { userId: payload.userId };
  }
}
