import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Logger,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { LogService } from 'src/modules/log/service/log.service';
import { ApiKeyService } from 'src/modules/x-api-keys/service/api-key.service';

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);

  constructor(
    private readonly apiKeyService: ApiKeyService,
    private readonly logsService: LogService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = await context.switchToHttp().getRequest();

    const ip = await request.ip;
    const apiKey = await request.headers['x-api-key'];
    const authHeader = await request.headers.authorization;
    let accessToken = 'undefined';
    const system_name = (await request.headers['system-name']) || 'undefined';
    const id_user = (await request.user?.id) || 'undefined';
    const endpoint = await request.url;
    const method = request.method;
    const userAgent = (await request.headers['user-agent']) || 'undefined';
    const host = (await request.headers['host']) || 'undefined';
    const data = (await JSON.stringify(request.body)) || null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      accessToken = await authHeader.split(' ')[1];
    }

    if (!apiKey) {
      await this.logsService.logRequest(
        ip,
        'undefined',
        accessToken,
        system_name,
        id_user,
        endpoint,
        method,
        'Unauthorized Access', // action
        userAgent,
        host,
        401, // responseStatus
        0, // responseTime
        'API key is missing', // details
        data,
      );
      this.logger.warn('API key is missing');
      throw new HttpException('API key is missing', HttpStatus.UNAUTHORIZED);
    }

    try {
      const isValid = await this.apiKeyService.validateApiKey(apiKey);

      if (!isValid) {
        await this.logsService.logRequest(
          ip,
          apiKey,
          accessToken,
          system_name,
          id_user,
          endpoint,
          method,
          'Unauthorized Access', // action
          userAgent,
          host,
          401, // responseStatus
          0, // responseTime
          'Invalid API key', // details
          data,
        );
        this.logger.warn('Invalid API key');
        throw new HttpException('Invalid API key', HttpStatus.UNAUTHORIZED);
      }

      this.logger.log('API key is valid');
      return true;
    } catch (error) {
      await this.logsService.logRequest(
        ip,
        apiKey || 'undefined',
        accessToken,
        system_name,
        id_user,
        endpoint,
        method,
        'Error during API key validation', // action
        userAgent,
        host,
        500, // responseStatus
        0, // responseTime
        `Error validating API key: ${error.message}`, // details
        data,
      );
      this.logger.error('Error validating API key', error.stack);
      throw new HttpException(
        'Error validating API key',
        HttpStatus.NOT_IMPLEMENTED,
      );
    }
  }
}
