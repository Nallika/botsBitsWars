import { Request, Response } from 'express';
import { body } from 'express-validator';

import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
} from '@repo/shared-types/src';
import { AuthService } from '../../services/auth/AuthService';
import { MIN_PASSWORD_LENGTH } from '../../constants';
import { BaseController } from '../base/BaseController';
import logger from '../../services/logger/logger';

export class AuthController extends BaseController {

  async register(req: Request, res: Response) {
    await body('email', 'Valid email is required')
      .isEmail()
      .normalizeEmail()
      .run(req);
    await body(
      'password',
      `Password must be at least ${MIN_PASSWORD_LENGTH} characters with uppercase, lowercase and number`
    )
      .isLength({ min: MIN_PASSWORD_LENGTH })
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .run(req);

    if (!this.validateRequest(req, res)) return;

    try {
      const { email, password }: RegisterRequest = req.body;
      logger.info('Registering user with email:', email);

      await AuthService.register({ email, password }, res);

      logger.info('User registered successfully, cookie should be set');

      this.sendSuccess<RegisterResponse>(res, { email });
    } catch (error) {
      this.handleError(
        error,
        res,
        'Registration failed. Please try again.',
        400
      );
    }
  }

  async login(req: Request, res: Response) {
    await body('email', 'Valid email is required')
      .isEmail()
      .normalizeEmail()
      .run(req);
    await body('password', 'Password is required')
      .not()
      .isEmpty()
      .trim()
      .run(req);

    if (!this.validateRequest(req, res)) return;

    try {
      const { email, password }: LoginRequest = req.body;
      await AuthService.login(email, password, res);

      this.sendSuccess<LoginResponse>(res, { email });
    } catch (error) {
      this.handleError(
        error,
        res,
        'Login failed. Please check your credentials.',
        400
      );
    }
  }

  /**
   * Route to verify token and get user info
   */
  async me(req: Request, res: Response) {
    // Verify token
    if (!(await this.verifyToken(req, res))) return;

    try {
      this.sendSuccess(res, {
        authenticated: true,
      });
    } catch (error) {
      this.handleError(error, res, 'Failed to get user information', 400);
    }
  }

  /**
   * Logout user by clearing the auth cookie
   */
  async logout(req: Request, res: Response) {
    try {
      AuthService.clearCookie(res);

      this.sendSuccess(res, {
        success: true,
        message: 'Logout successful',
      });
    } catch (error) {
      this.handleError(error, res, 'Logout failed', 400);
    }
  }
}
