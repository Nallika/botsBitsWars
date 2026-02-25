import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';

type ErrorResponse = {
  statusCode: number;
  message: string;
  errors?: string[];
};

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    // This filter runs for every thrown error in the HTTP layer.
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    if (exception instanceof HttpException) {
      // Expected HTTP errors (validation, auth, bad request, etc.).
      const status = exception.getStatus();
      const responseBody = exception.getResponse();

      // Normalize Nest's varying response shapes into a consistent payload.
      const normalized = this.normalizeResponse(status, responseBody);
      this.logger.warn(
        `HTTP ${status} - ${normalized.message}${this.formatErrors(normalized.errors)}`,
      );
      return response.status(status).json(normalized);
    }

    // Unexpected errors: log full details, but return a generic message.
    this.logger.error('Unhandled exception', exception as Error);
    const payload: ErrorResponse = {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
    };
    return response.status(payload.statusCode).json(payload);
  }

  private normalizeResponse(status: number, responseBody: unknown): ErrorResponse {
    // Case 1: Nest returns a plain string (rare, but allowed).
    if (typeof responseBody === 'string') {
      return { statusCode: status, message: responseBody };
    }

    // Case 2: Nest returns an object with "message".
    // For validation, "message" is typically an array of error strings.
    if (responseBody && typeof responseBody === 'object') {
      const body = responseBody as { message?: unknown };
      if (Array.isArray(body.message)) {
        return {
          statusCode: status,
          message: 'Validation failed',
          errors: body.message.map((item) => String(item)),
        };
      }
      // For other HttpExceptions, "message" is usually a string.
      if (typeof body.message === 'string') {
        return { statusCode: status, message: body.message };
      }
    }

    // Fallback for any unexpected response shape.
    return { statusCode: status, message: 'Request failed' };
  }

  private formatErrors(errors?: string[]) {
    // Only include validation details in logs if they exist.
    if (!errors || errors.length === 0) {
      return '';
    }
    return ` | errors: ${errors.join('; ')}`;
  }
}
