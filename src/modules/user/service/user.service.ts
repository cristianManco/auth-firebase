import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { User, UserDocument } from '../entities/user.entity';
import * as admin from 'firebase-admin';
import { v4 as uuidv4 } from 'uuid';
import { CreateUserDto, UpdateRoleDto, UpdateUserDto } from '../dtos/exportDTO';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async register(createUserDto: CreateUserDto): Promise<object> {
    const { token, email, termsVersion, metadataTerms, roles, ...userData } =
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

    if (user && user.deletedAt) {
      throw new HttpException(
        'User account has been deleted! Please contact support for more information.',
        HttpStatus.CONFLICT,
      );
    }

    if (user) {
      throw new HttpException(
        'User already exists! Try again',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      user = new this.userModel({
        id: uuidv4(),
        firebaseId: userRecord.uid,
        name: userRecord.displayName || userData.name,
        email: userRecord.email,
        accessMethod: userRecord.providerData[0]?.providerId || 'password',
        metadata: JSON.stringify(userRecord.metadata),
        termsVersion,
        metadataTerms,
        ...userData,
        createdAt: new Date(),
        roles: roles,
      });

      await user.save();

      return { message: 'Successfully registered user!', id: user._id };
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        throw new HttpException(
          'User not found in Firebase',
          HttpStatus.NOT_FOUND,
        );
      } else {
        throw new HttpException(
          `Failed to register user! try again later with another firebaseId:  ${error.message}`,
          HttpStatus.NOT_ACCEPTABLE,
        );
      }
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
    const user = await this.userModel.findOne({ firebaseId: userId });
    if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND);

    Object.assign(user, updateUserDto, { updatedAt: new Date() });
    await user.save();
    try {
      await admin.auth().updateUser(userId, {
        email: updateUserDto.email,
        displayName: updateUserDto.name,
      });

      return user;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
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

      user.roles = [updateRoleDto.roles[0]];
      await user.save();

      return user;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async removeUser(userId: string): Promise<void> {
    const user = await this.userModel.findOne({ firebaseId: userId });

    if (!user || user.deletedAt) {
      throw new HttpException(
        'User not found or already deleted',
        HttpStatus.NOT_FOUND,
      );
    }

    user.deletedAt = new Date();
    user.deletedBy = user.deletedBy;
    await user.save();

    try {
      await admin.auth().deleteUser(userId);
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        return;
      }
      throw new HttpException(
        'Error when trying to delete user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAllUsers(
    filters: any,
    sort: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<any> {
    const query = { deletedAt: null }; // Exclude soft-deleted users

    if (filters.name) query['name'] = { $regex: filters.name, $options: 'i' };
    if (filters.email)
      query['email'] = { $regex: filters.email, $options: 'i' };

    const sortOption = sort === 'asc' ? 'createdAt' : '-createdAt';
    try {
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
      let user: User;
      if (isValidObjectId(id)) {
        user = await this.userModel.findOne({ _id: id });
        if (!user) {
          throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        }
        return user;
      } else {
        user = await this.userModel.findOne({ id: id });
        if (!user) {
          throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        }
        return user;
      }
    } catch (error) {
      if (error.kind === 'ObjectId') {
        throw new HttpException('Invalid ID format', HttpStatus.BAD_REQUEST);
      }
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }
}
