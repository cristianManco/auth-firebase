import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { HttpService } from '@nestjs/axios';
import { moodleDocument, moodleUser } from '../entities/moodle.entity';
import { CreateMoodleUserDto } from '../dtos/moodleUser.dto';
import { LoginDto } from '../dtos/loginMoodle.dto';
import { WhiteListService } from 'src/Libs/auth/utils/services/whiteList.service';
import { GetTokensService } from 'src/Libs/auth/utils/services/getTokens.service';
import { Tokens } from 'src/Libs/auth/types/tokens.type';
import { Sub } from 'src/Libs/auth/types/sub.type';

@Injectable()
export class MoodleService {
  private moodleApiUrl: string;
  private moodleApiToken: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly whiteListService: WhiteListService,
    private readonly getToken: GetTokensService,
    @InjectModel(moodleUser.name) private moodleModel: Model<moodleDocument>,
  ) {
    this.moodleApiUrl = this.configService.get<string>('MOODLE_API_URL');
    this.moodleApiToken = this.configService.get<string>('MOODLE_API_TOKEN');
  }

  async registerUser(user: CreateMoodleUserDto): Promise<object> {
    try {
      const response = await this.httpService
        .get(`${this.moodleApiUrl}?`, {
          params: {
            wstoken: this.moodleApiToken,
            wsfunction: 'core_user_create_users',
            moodlewsrestformat: 'json',
            'users[0][username]': user.username.toLowerCase(),
            'users[0][password]': user.password,
            'users[0][firstname]': user.firstname,
            'users[0][lastname]': user.lastname,
            'users[0][email]': user.email,
            'users[0][auth]': user.auth || 'manual',
          },
        })
        .toPromise();

      return response.data;
    } catch (error) {
      throw new HttpException(
        `Error during user registration: ${error.response?.data?.message || error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async loginWithMoodle(loginDto: LoginDto): Promise<Tokens> {
    const { username, email } = loginDto;

    if (!username || !email) {
      throw new HttpException(
        'Username and email are required!',
        HttpStatus.BAD_REQUEST,
      );
    }

    const user = await this.moodleModel.findOne({ username });

    if (!user) {
      throw new HttpException(
        'User not found in Centinela!',
        HttpStatus.NOT_FOUND,
      );
    }

    if (user.email !== email) {
      throw new HttpException(
        'Username and email do not match!',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      if (user.suspended) {
        throw new HttpException(
          'User account is suspended!',
          HttpStatus.FORBIDDEN,
        );
      }

      if (!user.confirmed) {
        throw new HttpException(
          'User account is not confirmed!',
          HttpStatus.FORBIDDEN,
        );
      }

      const jwtPayload: Sub = {
        id: user.id,
        email: user.email,
        roles: user.roles,
      };

      const tokens = await this.getToken.getTokens({ sub: jwtPayload });

      await this.whiteListService.whitelistJwt(tokens);

      return tokens;
    } catch (error) {
      throw new HttpException(
        `Failed to login user!... ${error.message}`,
        HttpStatus.NOT_ACCEPTABLE,
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
      const query = { deletedAt: null };

      if (filters.name) query['name'] = { $regex: filters.name, $options: 'i' };
      if (filters.email)
        query['email'] = { $regex: filters.email, $options: 'i' };

      const sortOption = sort === 'asc' ? 'createdAt' : '-createdAt';

      const users = await this.moodleModel
        .find(query)
        .sort(sortOption)
        .skip((page - 1) * limit)
        .limit(limit)
        .exec();

      if (!users)
        throw new HttpException('invalid parameters', HttpStatus.BAD_REQUEST);

      const total = await this.moodleModel.countDocuments(query).exec();

      return { users, total, page, limit };
    } catch (error) {
      throw new HttpException('Failed to find users', HttpStatus.NOT_FOUND);
    }
  }

  async getUsersFromMoodle(): Promise<moodleUser[]> {
    try {
      const response = await this.httpService
        .get(`${this.moodleApiUrl}?`, {
          params: {
            wstoken: this.moodleApiToken,
            wsfunction: 'core_user_get_users',
            moodlewsrestformat: 'json',
            'criteria[0][key]': '',
            'criteria[0][value]': '%',
          },
        })
        .toPromise();

      if (!response.data.users || !response.data.users.length) {
        throw new HttpException(
          'No users found in Moodle!',
          HttpStatus.NOT_FOUND,
        );
      }

      return await response.data.users.map((user: any) => ({
        moodleId: user.id,
        user: user.username,
        firstname: user.firstname,
        lastname: user.lastname,
        fullname: user.fullname,
        email: user.email,
        department: user.department,
        city: user.city,
        country: user.country,
        confirmed: user.confirmed,
        suspended: user.suspended,
        roles: user.role || ['BASIC'],
      }));
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_ACCEPTABLE);
    }
  }

  async deleteUserInMoodle(moodleId: number): Promise<object> {
    const user = await this.moodleModel.findOne({ moodleId }).exec();
    if (!user) {
      throw new HttpException(
        `user with ID: ${moodleId} NOT FOUND`,
        HttpStatus.NOT_FOUND,
      );
    }
    await this.moodleModel.deleteOne({ moodleId });

    try {
      await this.httpService
        .post(`${this.moodleApiUrl}?`, null, {
          params: {
            wstoken: this.moodleApiToken,
            wsfunction: 'core_user_delete_users',
            moodlewsrestformat: 'json',
            userids: [moodleId],
          },
        })
        .toPromise();
      return {
        message: `User with ID: ${moodleId} deleted successfully`,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_ACCEPTABLE);
    }
  }

  async syncUsersWithCentinela(): Promise<void> {
    try {
      const moodleUsers = await this.getUsersFromMoodle();
      if (!moodleUsers) {
        throw new HttpException('users not found', HttpStatus.NOT_FOUND);
      }

      for (const moodleUser of moodleUsers) {
        const existingUser = await this.moodleModel.findOne({
          moodleId: moodleUser.moodleId,
        });

        if (!existingUser) {
          const newUser = await new this.moodleModel({
            moodleId: moodleUser.moodleId,
            user: moodleUser.user,
            email: moodleUser.email,
            firstname: moodleUser.firstname,
            lastname: moodleUser.lastname,
            fullname: moodleUser.fullname,
            department: moodleUser.department,
            city: moodleUser.city,
            country: moodleUser.country,
            roles: moodleUser.roles || ['BASIC'],
            confirmed: moodleUser.confirmed,
            suspended: moodleUser.suspended,
            createdAt: new Date(),
          });

          await newUser.save();
        } else {
          existingUser.user = moodleUser.user;
          existingUser.email = moodleUser.email;
          existingUser.firstname = moodleUser.firstname;
          existingUser.lastname = moodleUser.lastname;
          existingUser.fullname = moodleUser.fullname;
          existingUser.department = moodleUser.department;
          existingUser.city = moodleUser.city;
          existingUser.country = moodleUser.country;
          existingUser.roles = moodleUser.roles || ['BASIC'];
          existingUser.confirmed = moodleUser.confirmed;
          existingUser.suspended = moodleUser.suspended;
          existingUser.updatedAt = new Date();

          await existingUser.save();
        }
      }
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_IMPLEMENTED);
    }
  }
  async findOne(id: string): Promise<moodleUser> {
    try {
      const user = await this.moodleModel.findById(id).exec();
      if (!user)
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      return user;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_ACCEPTABLE);
    }
  }
}
