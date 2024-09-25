import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import {
  ADMIN_KEY,
  PUBLIC_KEY,
  ROLES_KEY,
} from 'src/Libs/constants/key-decorators';
import { ROLES } from 'src/Libs/constants/roles';
import { LogService } from 'src/modules/log/service/log.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly logsService: LogService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const ip = request.ip;
    const userAgent = request.headers['user-agent'];
    const host = request.headers.host;
    const endpoint = request.originalUrl;
    const method = request.method;
    const accessToken = request.headers.authorization?.split(' ')[1];
    const action = 'Access Endpoint';
    const handlerName = context.getHandler().name;
    const className = context.getClass().name;
    const { rolesUser, user } = request.body;

    // Verification if the route is public
    const isPublic = this.reflector.get<boolean>(
      PUBLIC_KEY,
      context.getHandler(),
    );

    if (isPublic) {
      await this.logsService.logRequest(
        ip,
        'undefined',
        accessToken || 'null',
        user?.id || 'unknown',
        'undefined',
        endpoint,
        method,
        action,
        userAgent,
        host,
        HttpStatus.OK,
        0,
        'Public route access',
      );
      return true;
    }

    // We verify the roles required for the route
    const roles = this.reflector.get<Array<keyof typeof ROLES>>(
      ROLES_KEY,
      context.getHandler(),
    );

    // Verification if administrator access is required
    const admin = this.reflector.get<string>(ADMIN_KEY, context.getHandler());

    if (!roles && !admin) {
      await this.logsService.logRequest(
        ip,
        'undefined',
        accessToken || 'null',
        user?.id || 'unknown',
        'undefined',
        endpoint,
        method,
        action,
        userAgent,
        host,
        HttpStatus.OK,
        0,
        `${className}.${handlerName} accessed with no role restrictions`,
      );
      return true;
    }

    if (admin) {
      if (rolesUser && rolesUser.includes(admin)) {
        await this.logsService.logRequest(
          ip,
          'undefined',
          accessToken || 'null',
          user?.id || 'unknown',
          'undefined',
          endpoint,
          method,
          action,
          userAgent,
          host,
          HttpStatus.OK,
          0,
          `${className}.${handlerName} accessed as admin`,
        );
        return true;
      } else {
        await this.logsService.logRequest(
          ip,
          'undefined',
          accessToken || 'null',
          user?.id || 'unknown',
          'undefined',
          endpoint,
          method,
          action,
          userAgent,
          host,
          HttpStatus.UNAUTHORIZED,
          0,
          `Unauthorized attempt by ${user?.username || 'unknown'} to access ${className}.${handlerName} as admin`,
        );
        throw new HttpException(
          'You do not have permissions for this operation',
          HttpStatus.UNAUTHORIZED,
        );
      }
    }

    // If there are no defined roles but there is an administrator
    if (roles == undefined) {
      if (!admin) {
        return true;
      } else if (rolesUser.length) {
        for (let i = 0; i < rolesUser.length; i++) {
          if (admin && rolesUser[i] === admin) return true;
        }
      } else {
        await this.logsService.logRequest(
          ip,
          'undefined',
          accessToken || 'null',
          user?.id || 'unknown',
          'undefined',
          endpoint,
          method,
          action,
          userAgent,
          host,
          HttpStatus.UNAUTHORIZED,
          0,
          `User ${user?.username || 'unknown'} tried to access ${className}.${handlerName} but lacks admin role`,
        );
        throw new HttpException(
          'You do not have permissions for this operation',
          HttpStatus.UNAUTHORIZED,
        );
      }
    }

    // Role verification
    const isAuth = roles.some((role) => rolesUser?.includes(role));

    if (!isAuth) {
      await this.logsService.logRequest(
        ip,
        'undefined',
        accessToken || 'null',
        user?.id || 'unknown',
        'undefined',
        endpoint,
        method,
        action,
        userAgent,
        host,
        HttpStatus.UNAUTHORIZED,
        0,
        `User ${user?.username || 'unknown'} denied access to ${className}.${handlerName}`,
      );
      throw new HttpException(
        'You do not have permissions for this operation',
        HttpStatus.UNAUTHORIZED,
      );
    }
    return true;
  }
}
