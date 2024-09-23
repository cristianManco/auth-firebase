import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBody,
  ApiParam,
  ApiHeader,
} from '@nestjs/swagger';
import { MoodleService } from '../service/moodle.service';
import { CreateMoodleUserDto } from '../dtos/moodleUser.dto';
import { LoginDto } from '../dtos/loginMoodle.dto';
import { Public } from 'src/Libs/decorators/public.decorator';
import { Tokens } from 'src/Libs/auth/types/tokens.type';
import { JwtAuthGuard } from 'src/Libs/Guards/jwt-auth/jwt-auth.guard';
import { moodleUser } from '../entities/moodle.entity';
import { Roles } from 'src/Libs/decorators/roles.decorator';

@ApiTags('Moodle')
@ApiHeader({
  name: 'x-api-key',
  description: 'API key needed to access this endpoint',
})
@Controller('moodle')
export class MoodleController {
  constructor(private readonly moodleService: MoodleService) {}

  @Post('register')
  @Public()
  @ApiOperation({ summary: 'Register a new user in Moodle' })
  @ApiBody({
    description: 'User details to register in Moodle',
    type: CreateMoodleUserDto,
  })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully in Moodle.',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request. User already registered or invalid data.',
  })
  async registerUserFromMoodle(
    @Body() user: CreateMoodleUserDto,
  ): Promise<object> {
    return await this.moodleService.registerUser(user);
  }

  @Post('login')
  @Public()
  @ApiOperation({ summary: 'Login with Moodle credentials' })
  @ApiBody({
    description: 'Credentials required to login',
    schema: {
      properties: {
        username: { type: 'string', example: 'johndoe' },
        email: { type: 'string', example: 'johndoe@example.com' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Login successful, tokens returned.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. Invalid credentials.',
  })
  async login(@Body() loginDto: LoginDto): Promise<Tokens> {
    try {
      return await this.moodleService.loginWithMoodle(loginDto);
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('all')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all users with pagination and filtering' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: 'number',
    description: 'Page number',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: 'number',
    description: 'Limit of users per page',
    example: 10,
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    type: 'string',
    description: 'Sorting order',
    example: 'asc',
  })
  @ApiResponse({
    status: 200,
    description: 'List of users retrieved successfully.',
  })
  @ApiResponse({ status: 404, description: 'No users found.' })
  async findAll(@Query() query: any): Promise<any> {
    const { page = 1, limit = 10, sort, ...filters } = query;
    return await this.moodleService.findAllUsers(filters, sort, +page, +limit);
  }

  @Get('users')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Retrieve all users from Moodle' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'No users found.' })
  async getUsersFromMoodle(): Promise<moodleUser[]> {
    return await this.moodleService.getUsersFromMoodle();
  }

  @Delete('delete/:moodleId')
  @Roles('ADMIN_CENTINELA')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete a user in Moodle by ID' })
  @ApiParam({
    name: 'moodleId',
    description: 'ID of the user to be deleted in Moodle',
    type: 'number',
    example: 12345,
  })
  @ApiResponse({ status: 200, description: 'User deleted successfully.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async deleteUserInMoodle(@Param('moodleId') moodleId: number): Promise<any> {
    return await this.moodleService.deleteUserInMoodle(moodleId);
  }
}
