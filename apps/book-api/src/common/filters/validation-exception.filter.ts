import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(BadRequestException)
export class ValidationExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ValidationExceptionFilter.name);

  catch(exception: BadRequestException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const exceptionResponse = exception.getResponse() as any;
    const validationErrors = exceptionResponse.message;

    const errorResponse = {
      statusCode: 400,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      error: 'Bad Request',
      message: 'Validation failed',
      details: Array.isArray(validationErrors) 
        ? this.formatValidationErrors(validationErrors)
        : [validationErrors],
    };

    this.logger.warn(
      `Validation failed for ${request.method} ${request.url}: ${JSON.stringify(validationErrors)}`,
    );

    response.status(400).json(errorResponse);
  }

  private formatValidationErrors(errors: string[]): string[] {
    return errors.map(error => {
      // Clean up common validation error messages
      if (error.includes('must be')) {
        return error;
      }
      if (error.includes('should not be empty')) {
        return error.replace('should not be empty', 'is required');
      }
      if (error.includes('must be a')) {
        return error;
      }
      return error;
    });
  }
}