import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { Whitelist, WhitelistDocument } from '../../entities/whiteList.entity';
import { Tokens } from '../../types/tokens.type';
import { InjectModel } from '@nestjs/mongoose';
import { LogoutUserDto } from '../../dtos/logout.dto';
import { WhitelistStatus } from 'src/Libs/constants/whitelist-status.enum';

@Injectable()
export class WhiteListService {
  constructor(
    @InjectModel(Whitelist.name)
    private readonly whitelistModel: Model<WhitelistDocument>,
  ) {}

  async whitelistJwt(token: Tokens): Promise<void> {
    try {
      const whitelistEntry = await new this.whitelistModel({
        token: token.access_token,
        status: WhitelistStatus.ASSET,
      });
      await whitelistEntry.save();
    } catch (err) {
      throw new HttpException(
        `Failed to whitelist token... ${err}`,
        HttpStatus.NOT_IMPLEMENTED,
      );
    }
  }

  async whiteListChangeStatus({ token }: LogoutUserDto): Promise<string> {
    try {
      const tokenExist = await this.whitelistModel.findOne({ token });

      if (tokenExist.status === WhitelistStatus.IDLE)
        throw new HttpException('This token is invalid', HttpStatus.NOT_FOUND);

      const jwtToken = await this.whitelistModel
        .updateOne({ token }, { $set: { status: WhitelistStatus.IDLE } })
        .exec();

      if (!jwtToken)
        throw new HttpException('Token not found', HttpStatus.NOT_FOUND);

      return 'The change of the token was successful!';
    } catch (err) {
      throw new HttpException(
        `Ups... error: ${err}`,
        HttpStatus.NOT_IMPLEMENTED,
      );
    }
  }

  async whiteListValidateToken(token: string): Promise<boolean> {
    try {
      const isValid = await this.whitelistModel.findOne({ token }).exec();

      if (!isValid) return false;

      return true;
    } catch (err) {
      throw new HttpException(
        `Ups... error: ${err}`,
        HttpStatus.NOT_IMPLEMENTED,
      );
    }
  }
}
