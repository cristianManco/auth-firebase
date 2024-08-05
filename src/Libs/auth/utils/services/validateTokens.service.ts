import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WhiteListService } from './whiteList.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from 'src/modules/user/entities/user.entity';

@Injectable()
export class ValidateTokenService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly jwtService: JwtService,
    private readonly whiteListService: WhiteListService,
  ) {}

  async validateTokens(token: string): Promise<object> {
    try {
      const isValid = await this.jwtService.verify(token);

      const user = await this.userModel.findOne({ id: isValid.id });

      if (user.deletedAt)
        throw new HttpException('User invalid', HttpStatus.NOT_FOUND);

      const isValidInWhiteList =
        await this.whiteListService.whiteListValidateToken(token);

      if (!isValid || !user || !isValidInWhiteList)
        throw new HttpException('Invalid token...', HttpStatus.BAD_REQUEST);

      return await { message: 'The token is valid!' };
    } catch (err) {
      throw new HttpException(
        `Ups... error: ${err}`,
        HttpStatus.NOT_IMPLEMENTED,
      );
    }
  }
}
