import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { JwtService, TokenExpiredError } from '@nestjs/jwt';
import { JwtPayload } from '../../types/jwtPayload.type';
import { Tokens } from '../../types/tokens.type';
import { GetTokensService } from './getTokens.service';
import * as admin from 'firebase-admin';
import { MoodleService } from 'src/modules/moodle/service/moodle.service';

@Injectable()
export class RefreshTokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly getTokensService: GetTokensService,
    private readonly moodleService: MoodleService,
  ) {}

  async refreshTokens(refreshToken: string): Promise<Tokens> {
    // Verify the refresh token
    const decoded = await this.jwtService.verifyAsync(refreshToken, {
      secret: process.env.JWT_REFRESH_SECRET,
    });
    if (!decoded) {
      throw new HttpException('Invalid refresh token', HttpStatus.UNAUTHORIZED);
    }

    try {
      // Extract token information
      const { sub } = decoded as JwtPayload;

      let userRecord;
      try {
        userRecord = await admin.auth().getUser(sub.id);
      } catch (error) {
        // If user not found in Firebase, check Moodle
        if (error.code === 'auth/user-not-found') {
          const user = await this.moodleService.findOne(sub.id);
          if (!user) {
            throw new HttpException(
              'User not found in both Firebase and Moodle',
              HttpStatus.NOT_FOUND,
            );
          }
          // If user found in Moodle, use Moodle data
          userRecord = { id: user.moodleId, email: user.email };
        } else {
          throw error;
        }
      }

      // Generate new tokens
      const newJwtPayload: JwtPayload = {
        sub: {
          id: userRecord.id,
          email: userRecord.email,
          roles: sub.roles,
        },
      };
      return await this.getTokensService.getTokens(newJwtPayload);
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new HttpException(
          'Refresh token has expired',
          HttpStatus.NOT_ACCEPTABLE,
        );
      } else {
        throw new HttpException(
          `Refresh token failed: ${error.message}`,
          HttpStatus.UNAUTHORIZED,
        );
      }
    }
  }
}
