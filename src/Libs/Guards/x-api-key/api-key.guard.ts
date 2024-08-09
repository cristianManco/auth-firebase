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
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'];
    const endpoint = request.url;
    const method = request.method;
    const ip = request.ip;
    const id_user = request.user?.id || 'undefined';
    const system_name = request.headers['system-name'] || 'undefined';
    const data = JSON.stringify(request.body) || null;
    const authHeader = request.headers.authorization;
    const accesstoken = authHeader.split(' ')[1];

    if (!apiKey) {
      await this.logsService.logRequest(
        ip,
        'undefined',
        id_user,
        accesstoken,
        system_name,
        endpoint,
        method,
        'Unauthorized Access',
        data,
        401,
        0,
        'API key is missing',
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
          id_user,
          accesstoken,
          system_name,
          endpoint,
          method,
          'Unauthorized Access',
          data,
          401,
          0,
          'Invalid API key',
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
        id_user,
        accesstoken,
        system_name,
        endpoint,
        method,
        'Error during API key validation',
        data,
        500,
        0,
        `Error validating API key: ${error.message}`,
      );
      this.logger.error('Error validating API key', error.stack);
      throw new HttpException(
        'Error validating API key',
        HttpStatus.NOT_IMPLEMENTED,
      );
    }
  }
}
