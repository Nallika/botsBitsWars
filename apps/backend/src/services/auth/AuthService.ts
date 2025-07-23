import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import { User, IUser } from '../../models/User';
import { SALT_ROUNDS } from '../../constants';

const JWT_SECRET = process.env.JWT_SECRET as string;
export class AuthService {
  static async register(email: string, password: string): Promise<IUser> {
    const existing = await User.findOne({ email });

    if (existing) {
      throw new Error('Email already in use');
    }

    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = new User({ email, password: hash });
    await user.save();

    return user;
  }

  static async login(
    email: string,
    password: string
  ): Promise<{ user: IUser; token: string }> {
    const user = await User.findOne({ email });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      throw new Error('Invalid credentials');
    }

    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, {
      expiresIn: '7d',
    });

    return { user, token };
  }
}
