import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import logger from '../../services/logger/logger'; // Assuming logger is correctly imported
import { AuthService } from '../../services/auth/AuthService';
import {
  ApiErrorResponse,
  ApiResponse,
  ApiValidationErrorResponse,
} from '@repo/shared-types/src';

export abstract class BaseController {
  /**
   * Validates the request and returns validation errors if any
   * @param req Express Request object
   * @param res Express Response object
   * @returns true if validation passes, false if there are errors (response already sent)
   */
  protected validateRequest(req: Request, res: Response): boolean {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      logger.error(`Validation error: %s`, errors);

      const errorMessages = errors.array().map(err => {
        if (err.type === 'field') {
          return { [err.path]: err.msg };
        }
        // Handle other error types if necessary, or provide a default
        return { general: err.msg };
      });

      const response: ApiValidationErrorResponse = {
        success: false,
        error: 'Validation failed',
        fieldErrors: errorMessages,
      };

      res.status(400).json(response);

      return false;
    }

    return true;
  }

  /**
   * Verifies JWT token from request cookies
   * @param req Express Request object
   * @param res Express Response object
   * @returns true if token is valid, false if invalid (response already sent)
   */
  protected async verifyToken(req: Request, res: Response): Promise<boolean> {
    try {
      const token = AuthService.extractTokenFromCookies(req.cookies);

      if (!token) {
        res.status(401).json({ error: 'Unauthorized' });
        return false;
      }

      const tokenData = await AuthService.verifyToken(token);

      if (!tokenData) {
        logger.warn('Token validation failed');
        res.status(403).json({ error: 'Unauthorized' });
        return false;
      }

      // Attach user data to request for use in controllers
      (req as any).userId = tokenData.userId;

      return true;
    } catch (error) {
      logger.error('Authorization error: %s', error);
      res.status(401).json({ error: 'Error on authorization attempt' });
      return false;
    }
  }

  /**
   * Combined method that verifies token and validates request
   * @param req Express Request object
   * @param res Express Response object
   * @returns true if both token and validation pass, false otherwise
   */
  protected async verifyTokenAndValidate(
    req: Request,
    res: Response
  ): Promise<boolean> {
    if (!(await this.verifyToken(req, res))) return false;
    return this.validateRequest(req, res);
  }

  /**
   * Handles errors consistently across controllers
   * @param error The error object
   * @param res Express Response object
   * @param message Custom error message
   * @param statusCode HTTP status code (default: 500)
   */
  protected handleError(
    error: any,
    res: Response,
    message: string,
    statusCode: number = 500
  ): void {
    logger.error(`${message}: %s`, error);

    const response: ApiErrorResponse = {
      success: false,
      error: message,
    };

    res.status(statusCode).json(response);
  }

  /**
   * Sends a success response with data
   * @param res Express Response object
   * @param data Response data
   * @param statusCode HTTP status code (default: 200)
   */
  protected sendSuccess<T>(
    res: Response,
    data: T,
    statusCode: number = 200
  ): void {
    const response: ApiResponse<T> = {
      success: true,
      data,
    };
    res.status(statusCode).json(response);
  }

  /**
   * Sends a not found response (404)
   * @param res Express Response object
   * @param message Custom error message
   */
  protected sendNotFound(
    res: Response,
    message: string = 'Resource not found'
  ): void {
    res.status(404).json({ error: message });
  }
}
