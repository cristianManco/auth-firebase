import {
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { ValidateTokenService } from 'src/Libs/auth/utils/services/validateTokens.service';
import { JwtPayload } from 'src/Libs/auth/types/jwtPayload.type';
import { LogService } from 'src/modules/log/service/log.service';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private jwtServiceOfAuthModule: ValidateTokenService,
    private readonly jwtService: JwtService,
    private readonly logsService: LogService,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    const ip = await request.ip;
    let accessToken = 'undefined';
    const endpoint = await request.url;
    const method = request.method;
    const userAgent = (await request.headers['user-agent']) || 'undefined';
    const host = (await request.headers['host']) || 'undefined';
    const data = (await JSON.stringify(request.body)) || null;
    const authHeader = request.headers['authorization'];

    if (authHeader && authHeader.startsWith('Bearer ')) {
      accessToken = await authHeader.split(' ')[1];
    }

    if (!authHeader) {
      await this.logsService.logRequest(
        ip,
        'undefined',
        accessToken,
        'undefined',
        'undefined',
        endpoint,
        method,
        'Unauthorized Access',
        userAgent,
        host,
        401,
        0,
        'No authorization header',
        data,
      );
      throw new HttpException(
        'No authorization header',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const token = authHeader.split(' ')[1];
    if (!token || typeof token != 'string') {
      throw new HttpException('Invalid token format', HttpStatus.UNAUTHORIZED);
    }

    // validate with JWT_SECRET or JWT_REFRESH_SECRET
    let payload;
    try {
      // We try to validate with the key JWT_SECRET
      payload = await this.jwtServiceOfAuthModule.validateTokens(
        token,
        process.env.JWT_SECRET,
      );
    } catch (error) {
      try {
        // If it fails, we try with the key JWT_REFRESH_SECRET
        payload = await this.jwtServiceOfAuthModule.validateTokens(
          token,
          process.env.JWT_REFRESH_SECRET,
        );
      } catch (err) {
        await this.logsService.logRequest(
          ip,
          'undefined',
          accessToken,
          'undefined',
          'undefined',
          endpoint,
          method,
          'Unauthorized Access',
          userAgent,
          host,
          401,
          0,
          'Invalid token',
          data,
        );
        throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
      }
    }

    if (!payload) {
      await this.logsService.logRequest(
        ip,
        'undefined',
        accessToken,
        'undefined',
        'undefined',
        endpoint,
        method,
        'payload invalid',
        userAgent,
        host,
        401,
        0,
        'invalid token',
        data,
      );

      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }

    try {
      const isValid = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET || process.env.JWT_REFRESH_SECRET,
      });

      const { sub } = isValid as JwtPayload;

      request.body.idUser = sub.id;
      request.body.rolesUser = sub.roles;
      return true;
    } catch (error) {
      await this.logsService.logRequest(
        ip,
        'undefined',
        accessToken,
        'undefined',
        'undefined',
        endpoint,
        method,
        'Error during token validation',
        userAgent,
        host,
        401,
        0,
        `Token validation error: ${error.message}`,
        data,
      );

      throw new HttpException(
        `UPS..Error during validation: ${error.message}`,
        HttpStatus.UNAUTHORIZED,
      );
    }
  }
}
