import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { LoginUserDto } from '../dtos/login.dto';
import * as admin from 'firebase-admin';
import { Sub } from '../types/sub.type';
import { GetTokensService } from '../utils/services/getTokens.service';
import { Tokens } from '../types/tokens.type';
import { WhiteListService } from '../utils/services/whiteList.service';
import { LogoutUserDto } from '../dtos/logout.dto';
import { ValidateTokenService } from '../utils/services/validateTokens.service';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../../../modules/user/entities/user.entity';
import { Model } from 'mongoose';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly getTokensService: GetTokensService,
    private readonly whiteListService: WhiteListService,
    private readonly validateTokenService: ValidateTokenService,
  ) {}

  async login({ firebaseToken }: LoginUserDto): Promise<Tokens> {
    try {
      const decodedToken = await admin.auth().verifyIdToken(firebaseToken);
      const userRecord = await admin.auth().getUser(decodedToken.uid);

      if (!userRecord)
        throw new HttpException('Invalid token', HttpStatus.BAD_REQUEST);

      const user = await this.userModel.findOne({ email: userRecord.email });
      if (!user)
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);

      const subJwt: Sub = {
        id: userRecord.uid,
        email: userRecord.email,
        role: user.role,
      };

      const token: Tokens = await this.getTokensService.getTokens({
        sub: subJwt,
      });

      await this.whiteListService.whitelistJwt(token);

      return token;
    } catch (err) {
      throw new HttpException(
        `Ups... error: ${err}`,
        HttpStatus.NOT_ACCEPTABLE,
      );
    }
  }

  async logout(jwtToken: LogoutUserDto): Promise<string> {
    try {
      return await this.whiteListService.whiteListChangeStatus(jwtToken);
    } catch (err) {
      throw new HttpException(
        `Ups... error: ${err}`,
        HttpStatus.NOT_IMPLEMENTED,
      );
    }
  }

  async validateToken(token: string): Promise<object> {
    try {
      return await this.validateTokenService.validateTokens(token);
    } catch (err) {
      throw new HttpException(
        `Ups... error: ${err}`,
        HttpStatus.NOT_IMPLEMENTED,
      );
    }
  }
}
