import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtPayload } from '../../types/jwtPayload.type';
import { Tokens } from '../../types/tokens.type';
import { jwtConstants } from '../../../constants/constant-jwt';
import { SignTokenService } from './signToken.service';

@Injectable()
export class GetTokensService {
  constructor(private readonly token: SignTokenService) {}

  async getTokens(jwtPayload: JwtPayload): Promise<Tokens> {
    const secretKey = jwtConstants.secret || process.env.JWT_SECRET;
    const refreshSecretKey =
      jwtConstants.refreshSecret || process.env.JWT_REFRESH_SECRET;

    if (!secretKey || !refreshSecretKey)
      throw new HttpException(
        'JWT_SECRET or JWT_REFRESH_SECRET is not set',
        HttpStatus.NOT_ACCEPTABLE,
      );

    try {
      const accessTokenOptions = { expiresIn: jwtConstants.expires || '15m' };
      const refreshTokenOptions = {
        expiresIn: jwtConstants.refreshExpires || '24h',
      };

      const accessToken = await this.token.signToken(
        jwtPayload,
        secretKey,
        accessTokenOptions,
      );

      const refreshToken = await this.token.signToken(
        jwtPayload,
        refreshSecretKey,
        refreshTokenOptions,
      );

      return await { access_token: accessToken, refresh_token: refreshToken };
    } catch (error) {
      throw new HttpException(
        `Ups... error: ${error}`,
        HttpStatus.NOT_IMPLEMENTED,
      );
    }
  }
}
