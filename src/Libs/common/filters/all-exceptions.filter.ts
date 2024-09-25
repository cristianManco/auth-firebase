import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Logger,
  HttpStatus,
} from '@nestjs/common';
import { TokenExpiredError } from '@nestjs/jwt';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    try {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse<Response>();
      const request = ctx.getRequest<Request>();
      let status: number;
      let message: any;

      if (exception instanceof HttpException) {
        status = exception.getStatus();
        message = exception.getResponse();
      } else if (exception instanceof TokenExpiredError) {
        status = HttpStatus.NOT_ACCEPTABLE;
        message = 'JWT Refresh_token or JWT Acces_token has expired';
      } else {
        status = HttpStatus.INTERNAL_SERVER_ERROR;
        message = 'Internal server error';
      }

      this.logger.error(
        `Error ${status}: ${JSON.stringify(message)} - ${request.url}`,
        exception instanceof Error ? exception.stack : '',
      );

      response.status(status).json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
        error: message,
      });
    } catch (error) {
      throw new HttpException(
        `UPS..Error capturing exceptions:  ${error.message}`,
        HttpStatus.NOT_IMPLEMENTED,
      );
    }
  }
}
