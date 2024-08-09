import {
  Injectable,
  NotFoundException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../entities/user.entity';
import * as admin from 'firebase-admin';
import { v4 as uuidv4 } from 'uuid';
import { CreateUserDto, UpdateUserDto, UpdateRoleDto } from '../dtos/exportDTO';
import { WhiteListService } from 'src/Libs/auth/utils/services/whiteList.service';
import { GetTokensService } from 'src/Libs/auth/utils/services/getTokens.service';
import { Tokens } from 'src/Libs/auth/types/tokens.type';
import { Sub } from 'src/Libs/auth/types/sub.type';
import { UserType } from 'src/Libs/Enums/roles.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly whiteListService: WhiteListService,
    private readonly getToken: GetTokensService,
  ) {}

  async register(createUserDto: CreateUserDto): Promise<Tokens> {
    try {
      const { token, email, termsVersion, metadataTerms, role, ...userData } =
        createUserDto;

      let userRecord;
      let password;

      if (token) {
        const decodedToken = await admin.auth().verifyIdToken(token);
        userRecord = await admin.auth().getUser(decodedToken.uid);
        if (!userRecord) {
          throw new HttpException('Invalid token', HttpStatus.BAD_REQUEST);
        }
      } else if (email && password) {
        await this.validateEmailForSignUp(email);
        userRecord = await admin.auth().createUser({ email, password });

        if (!userRecord) {
          throw new HttpException(
            'Invalid email or password',
            HttpStatus.BAD_REQUEST,
          );
        }
      } else {
        throw new HttpException(
          'Insufficient data for registration',
          HttpStatus.BAD_REQUEST,
        );
      }

      let user = await this.userModel.findOne({ email: userRecord.email });
      if (user)
        throw new HttpException(
          'User already exists! Try again',
          HttpStatus.BAD_REQUEST,
        );

      user = new this.userModel({
        id: uuidv4(),
        firebaseId: userRecord.uid,
        email: userRecord.email,
        accessMethod: userRecord.providerData[0]?.providerId || 'password',
        metadata: JSON.stringify(userRecord.metadata),
        termsVersion,
        metadataTerms,
        ...userData,
        createdAt: new Date(),
        role: role,
      });

      await user.save();

      const jwtPayload: Sub = {
        id: user.id,
        email: user.email,
        role: user.role,
      };
      const tokens = await this.getToken.getTokens({ sub: jwtPayload });

      await this.whiteListService.whitelistJwt(tokens);

      return tokens;
    } catch (error) {
      throw new HttpException(
        `Failed to register user! try again later with another firebaseId:  ${error.message}`,
        HttpStatus.NOT_ACCEPTABLE,
      );
    }
  }

  async validateEmailForSignUp(email: string): Promise<void> {
    try {
      const user = await this.userModel.findOne({ email });
      if (user) {
        throw new HttpException(
          'Email already exists! Try again',
          HttpStatus.BAD_REQUEST,
        );
      }
    } catch (error) {
      throw new HttpException(
        'Failed to validate email! try again later with another email',
        HttpStatus.FORBIDDEN,
      );
    }
  }

  async updateUser(
    userId: string,
    updateUserDto: UpdateUserDto,
  ): Promise<User> {
    try {
      const user = await this.userModel.findById(userId);
      if (!user)
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);

      Object.assign(user, updateUserDto, { updatedAt: new Date() });
      await user.save();

      await admin.auth().updateUser(userId, {
        email: updateUserDto.email,
        displayName: updateUserDto.name,
      });

      return user;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.FORBIDDEN);
    }
  }

  async updateRole(
    userId: string,
    updateRoleDto: UpdateRoleDto,
  ): Promise<User> {
    try {
      const user = await this.userModel.findById(userId);
      if (!user)
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);

      user.role = updateRoleDto.role as UserType;
      await user.save();

      return user;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async removeUser(userId: string, deletedBy: string): Promise<void> {
    try {
      const user = await this.userModel.findById(userId);
      if (!user)
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);

      user.deletedAt = new Date();
      user.deletedBy = deletedBy;
      await user.save();

      await admin.auth().deleteUser(userId);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      }
      throw new HttpException(
        'Error when trying to delete user',
        HttpStatus.NOT_IMPLEMENTED,
      );
    }
  }

  async findAllUsers(
    filters: any,
    sort: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<any> {
    try {
      const query = { deletedAt: null }; // Exclude soft-deleted users

      if (filters.name) query['name'] = { $regex: filters.name, $options: 'i' };
      if (filters.email)
        query['email'] = { $regex: filters.email, $options: 'i' };

      const sortOption = sort === 'asc' ? 'createdAt' : '-createdAt';

      const users = await this.userModel
        .find(query)
        .sort(sortOption)
        .skip((page - 1) * limit)
        .limit(limit)
        .exec();

      if (!users)
        throw new HttpException('invalid parameters', HttpStatus.BAD_REQUEST);

      const total = await this.userModel.countDocuments(query).exec();

      return { users, total, page, limit };
    } catch (error) {
      throw new HttpException('Failed to find users', HttpStatus.NOT_FOUND);
    }
  }

  async findOneByEmail(email: string): Promise<User> {
    try {
      const user = await this.userModel.findOne({ email });
      if (!user)
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      return user;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.FORBIDDEN);
    }
  }

  async findOne(id: string): Promise<User> {
    try {
      const user = await this.userModel.findById(id);
      if (!user)
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      return user;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.FORBIDDEN);
    }
  }
}
