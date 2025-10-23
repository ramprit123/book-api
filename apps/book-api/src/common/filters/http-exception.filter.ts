import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    const exceptionResponse = exception.getResponse();
    const message =
      typeof exceptionResponse === 'string'
        ? exceptionResponse
        : (exceptionResponse as any)?.message || exception.message;

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: this.getCustomMessage(status, message),
      error: this.getErrorName(status),
    };

    // Log the error for debugging
    this.logger.error(
      `${request.method} ${request.url} - ${status} - ${message}`,
      exception.stack,
    );

    response.status(status).json(errorResponse);
  }

  private getCustomMessage(
    status: number,
    originalMessage: string | string[],
  ): string {
    const message = Array.isArray(originalMessage)
      ? originalMessage[0]
      : originalMessage;

    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return message.includes('validation')
          ? `Validation failed: ${message}`
          : `Bad request: ${message}`;

      case HttpStatus.UNAUTHORIZED:
        return message.includes('token') || message.includes('Authentication')
          ? message
          : 'Authentication required. Please provide a valid token.';

      case HttpStatus.FORBIDDEN:
        return message.includes('Access denied') ||
          message.includes('permission')
          ? message
          : 'Access forbidden. You do not have permission to access this resource.';

      case HttpStatus.NOT_FOUND:
        return message.includes('not found')
          ? message
          : 'The requested resource was not found.';

      case HttpStatus.CONFLICT:
        return message.includes('already exists') ||
          message.includes('duplicate')
          ? message
          : 'Resource conflict. The resource already exists or conflicts with existing data.';

      case HttpStatus.UNPROCESSABLE_ENTITY:
        return `Validation error: ${message}`;

      case HttpStatus.INTERNAL_SERVER_ERROR:
        return 'Internal server error. Please try again later.';

      default:
        return message;
    }
  }

  private getErrorName(status: number): string {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return 'Bad Request';
      case HttpStatus.UNAUTHORIZED:
        return 'Unauthorized';
      case HttpStatus.FORBIDDEN:
        return 'Forbidden';
      case HttpStatus.NOT_FOUND:
        return 'Not Found';
      case HttpStatus.CONFLICT:
        return 'Conflict';
      case HttpStatus.UNPROCESSABLE_ENTITY:
        return 'Unprocessable Entity';
      case HttpStatus.INTERNAL_SERVER_ERROR:
        return 'Internal Server Error';
      default:
        return 'Error';
    }
  }
}
