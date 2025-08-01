import { Request, Response } from 'express';

import { AuthService } from '../../services/auth/AuthService';
import logger from '../../services/logger/logger';

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const user = await AuthService.register(email, password);

      return res.status(201).json({
        id: user._id,
        email: user.email,
        createdAt: user.createdAt,
      });
    } catch (error) {
      logger.error('Registration error: %s', error);

      return res
        .status(400)
        .json({ error: 'Registration failed. Please try again.' });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const { user, token } = await AuthService.login(email, password);

      return res.json({
        token,
        user: {
          id: user._id,
          email: user.email,
          createdAt: user.createdAt,
        },
      });
    } catch (error) {
      logger.error('Login error: %s', error);

      return res
        .status(400)
        .json({ error: 'Login failed. Please check your credentials.' });
    }
  }
}
