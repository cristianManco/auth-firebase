import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { Request } from 'express';
import {
  ADMIN_KEY,
  PUBLIC_KEY,
  ROLES_KEY,
} from 'src/Libs/constants/key-decorators';
import { ROLES } from 'src/Libs/constants/roles';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = this.reflector.get<boolean>(
      PUBLIC_KEY,
      context.getHandler(),
    );

    if (isPublic) return true;

    const roles = this.reflector.get<Array<keyof typeof ROLES>>(
      ROLES_KEY,
      context.getHandler(),
    );

    const admin = this.reflector.get<string>(ADMIN_KEY, context.getHandler());

    const request = context.switchToHttp().getRequest<Request>();

    const { rolesUser } = request.body;

    if (roles == undefined) {
      if (!admin) {
        return true;
      } else if (rolesUser.length) {
        for (let i = 0; i < rolesUser.length; i++) {
          if (admin && rolesUser[i] === admin) return true;
        }
      } else {
        throw new HttpException(
          'You do not have permissions for this operation',
          HttpStatus.UNAUTHORIZED,
        );
      }
    }

    const isAuth = roles.some((role) => rolesUser.includes(role));

    if (!isAuth) {
      throw new HttpException(
        'You do not have permissions for this operation',
        HttpStatus.UNAUTHORIZED,
      );
    }

    return true;
  }
}
