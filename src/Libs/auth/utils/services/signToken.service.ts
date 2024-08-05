import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '../../types/jwtPayload.type';

@Injectable()
export class SignTokenService {
  constructor(private readonly jwtService: JwtService) {}

  async signToken(payload: JwtPayload, secretKey: string, options: any) {
    return await this.jwtService.signAsync(payload, {
      secret: secretKey,
      ...options,
    });
  }
}
