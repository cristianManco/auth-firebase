import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { LogService } from '../service/log.service';

@Injectable()
export class LogInterceptor implements NestInterceptor {
  constructor(private readonly logservice: LogService) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Promise<Observable<any>> {
    try {
      const request = await context.switchToHttp().getRequest();
      const response = await context.switchToHttp().getResponse();

      const ip = request.ip;
      const apiKey = (await request.headers['x-api-key']) || 'undefined';
      const endpoint = await request.url;
      const method = await request.method;
      const id_user = (await request.user?.id) || 'undefined';
      const system_name = (await request.headers['system-name']) || 'undefined';
      const data = (await JSON.stringify(request.body)) || null;
      const userAgent = (await request.headers['user-agent']) || 'undefined';
      const host = (await request.headers['host']) || 'undefined';
      const startTime = Date.now();

      // Validación del token de autorización
      const authHeader = await request.headers.authorization;
      let accessToken = 'undefined';

      if (authHeader && authHeader.startsWith('Bearer ')) {
        accessToken = await authHeader.split(' ')[1];
      }

      return next.handle().pipe(
        tap(async (responseBody) => {
          const responseTime = Date.now() - startTime;
          const responseStatus = response.statusCode;

          await this.logservice.logRequest(
            ip,
            apiKey,
            accessToken,
            id_user,
            system_name,
            endpoint,
            method,
            'Request', // Acción predeterminada
            userAgent,
            host,
            responseStatus,
            responseTime,
            `Response: ${JSON.stringify(responseBody)}`,
            data,
          );
        }),
        catchError(async (err) => {
          const responseTime = Date.now() - startTime;
          const responseStatus =
            err instanceof HttpException
              ? err.getStatus()
              : HttpStatus.INTERNAL_SERVER_ERROR;

          await this.logservice.logRequest(
            ip,
            apiKey,
            accessToken,
            id_user,
            system_name,
            endpoint,
            method,
            'Error', // Acción en caso de error
            userAgent,
            host,
            responseStatus,
            responseTime,
            `Error: ${err.message}`,
            data,
          );

          return new HttpException(
            `Ups...Error: ${err.message}`,
            HttpStatus.BAD_REQUEST,
          );
        }),
      );
    } catch (error) {
      throw new HttpException(
        `Ups...Error capturing records:  ${error.message}`,
        HttpStatus.NOT_IMPLEMENTED,
      );
    }
  }
}
