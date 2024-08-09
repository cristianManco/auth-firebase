import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { LogService } from '../service/log.service';

@Injectable()
export class LogIterceptor implements NestInterceptor {
  constructor(private readonly logsService: LogService) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Promise<Observable<any>> {
    try {
      const request = context.switchToHttp().getRequest();
      const response = context.switchToHttp().getResponse();
      const ip = request.ip;
      const apiKey = request.headers['x-api-key'] || 'undefined';
      const endpoint = request.url;
      const method = request.method;
      const id_user = request.user?.id || 'undefined'; // Assuming that the user is authenticated and his ID is available at `request.user`.
      const system_name = request.headers['system-name'] || 'undefined'; // Assuming that `system_name` is sent in headers.
      const data = JSON.stringify(request.body) || null; // Assuming that the body of the request can be useful for logging purposes.
      const authHeader = request.headers.authorization;
      const accesstoken = authHeader.split(' ')[1];
      const startTime = Date.now();

      return next.handle().pipe(
        tap(async (responseBody) => {
          const responseTime = Date.now() - startTime;
          const responseStatus = response.statusCode;

          await this.logsService.logRequest(
            ip,
            apiKey,
            id_user,
            accesstoken,
            system_name,
            endpoint,
            method,
            'Request',
            data,
            responseStatus,
            responseTime,
            `Response: ${JSON.stringify(responseBody)}`,
          );
        }),
        catchError(async (err) => {
          const responseTime = Date.now() - startTime;
          const responseStatus =
            err instanceof HttpException
              ? err.getStatus()
              : HttpStatus.INTERNAL_SERVER_ERROR;

          await this.logsService.logRequest(
            ip,
            apiKey,
            id_user,
            accesstoken,
            system_name,
            endpoint,
            method,
            'Error',
            data,
            responseStatus,
            responseTime,
            `Error: ${err.message}`,
          );
          return throwError(err);
        }),
      );
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_IMPLEMENTED);
    }
  }
}
