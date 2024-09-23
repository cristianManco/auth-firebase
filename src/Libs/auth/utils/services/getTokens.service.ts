import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtPayload } from '../../types/jwtPayload.type';
import { Tokens } from '../../types/tokens.type';
import { SignTokenService } from './signToken.service';
import { jwtConstants } from 'src/Libs/constants/constant-jwt';

@Injectable()
export class GetTokensService {
  constructor(private readonly token: SignTokenService) {}

  async getTokens(jwtPayload: JwtPayload): Promise<Tokens> {
    const secretKey = jwtConstants.secret || process.env.JWT_SECRET;

    if (!secretKey)
      throw new HttpException(
        'JWT_SECRET is not set',
        HttpStatus.NOT_IMPLEMENTED,
      );

    const accessTokenOptions = { expiresIn: jwtConstants.expires || '15m' };

    const accessToken = await this.token.signToken(
      jwtPayload,
      secretKey,
      accessTokenOptions,
    );

    return await { access_token: accessToken };
  }
}
