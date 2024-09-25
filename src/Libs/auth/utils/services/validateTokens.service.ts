import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WhiteListService } from './whiteList.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from 'src/modules/user/entities/user.entity';
import { RolesService } from 'src/Libs/roles/services/roles.service';
import { ValidateRoleResponse } from 'src/Libs/roles/dtos/validate-role-response.dto';
import { JwtPayload } from '../../types/jwtPayload.type';

@Injectable()
export class ValidateTokenService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly jwtService: JwtService,
    private readonly whiteListService: WhiteListService,
    private readonly rolesService: RolesService,
  ) {}

  async validateTokens(token: string, secret: string): Promise<object> {
    try {
      // Usamos el secreto pasado como parámetro
      const isValid = await this.jwtService.verifyAsync(token, { secret });

      const { sub } = isValid as JwtPayload;

      const user = await this.userModel.findOne({ id: sub.id });

      const roleUserIsValid: ValidateRoleResponse =
        await this.rolesService.validateRoleExistence(user.roles);

      if (roleUserIsValid.isValidRole === false)
        throw new HttpException(
          'This role is not valid...',
          HttpStatus.BAD_REQUEST,
        );

      const isValidInWhiteList =
        await this.whiteListService.whiteListValidateToken(token);

      if (user.deletedAt != null)
        throw new HttpException('User invalid', HttpStatus.NOT_FOUND);

      if (!isValid || !user || !isValidInWhiteList)
        throw new HttpException('Invalid token...', HttpStatus.BAD_REQUEST);

      return { message: 'The token is valid!' };
    } catch (err) {
      throw new HttpException(
        `Ups... error: ${err}`,
        HttpStatus.NOT_IMPLEMENTED,
      );
    }
  }
}
