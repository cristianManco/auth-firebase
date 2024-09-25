import {
  Controller,
  Post,
  Body,
  Put,
  Param,
  UseGuards,
  Delete,
  Get,
  Query,
  Patch,
} from '@nestjs/common';
import { UsersService } from '../service/user.service';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBody,
  ApiQuery,
  ApiParam,
  ApiBearerAuth,
  ApiHeader,
} from '@nestjs/swagger';
import { Public } from 'src/Libs/decorators/public.decorator';
import { CreateUserDto } from '../dtos/createUser.dto';
import { JwtAuthGuard } from 'src/Libs/Guards/jwt-auth/jwt-auth.guard';
import { Roles } from 'src/Libs/decorators/roles.decorator';
import { UpdateRoleDto } from '../dtos/updateRole.dto';
import { User } from '../entities/user.entity';
import { RolesGuard } from 'src/Libs/Guards/guard-roles/roles.guard';
import { UpdateUserDto } from '../dtos/updateUser.dto';

@ApiBearerAuth()
@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({
    description: 'User data for registration',
    type: CreateUserDto,
    examples: {
      user: {
        summary: 'An example of a user registration',
        value: {
          token: 'firebase token',
          name: 'John Doe',
          email: 'john@example.com',
          accessMethod: 'email',
          metadata: 'Some metadata',
          documentUser: '123456789',
          typeDocument: 'passport',
          termsVersion: '1.0',
          metadataTerms: '1.0',
          roles: ['ROLES'],
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'The user has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  async register(@Body() createUserDto: CreateUserDto): Promise<object> {
    return await this.usersService.register(createUserDto);
  }

  @Get('all')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all users' })
  @ApiQuery({
    name: 'name',
    required: false,
    description: 'Filter by name',
    type: String,
  })
  @ApiQuery({
    name: 'email',
    required: false,
    description: 'Filter by email',
    type: String,
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    description: 'Sort order (asc or desc)',
    enum: ['asc', 'desc'],
    type: String,
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number',
    type: Number,
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of items per page',
    type: Number,
    example: 10,
  })
  @ApiHeader({
    name: 'x-api-key',
    description: 'API key needed to access this endpoint',
  })
  @ApiResponse({ status: 200, description: 'Return all users.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  async findAll(@Query() query: any): Promise<any> {
    const { page = 1, limit = 10, sort, ...filters } = query;
    return await this.usersService.findAllUsers(filters, sort, +page, +limit);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get a user by id' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiHeader({
    name: 'x-api-key',
    description: 'API key needed to access this endpoint',
  })
  @ApiResponse({ status: 200, description: 'Return the user.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  async findOne(@Param('id') id: string): Promise<any> {
    return await this.usersService.findOne(id);
  }

  @Roles('ADMIN_CENTINELA')
  @UseGuards(JwtAuthGuard)
  @Patch('role/:_id')
  @ApiOperation({ summary: 'Update a user role' })
  @ApiParam({ name: '_id', description: 'User ID' })
  @ApiHeader({
    name: 'x-api-key',
    description: 'API key needed to access this endpoint',
  })
  @ApiBody({
    description: 'User role update data',
    type: UpdateRoleDto,
    examples: {
      role: {
        summary: 'An example of updating a user role',
        value: {
          roles: ['role_example'],
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'The role has been successfully updated.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  async updateRole(
    @Param('_id') id: string,
    @Body() updateRoleDto: UpdateRoleDto,
  ): Promise<User> {
    return await this.usersService.updateRole(id, updateRoleDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Update a user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiHeader({
    name: 'x-api-key',
    description: 'API key needed to access this endpoint',
  })
  @ApiBody({
    description: 'User update data',
    type: UpdateUserDto,
    examples: {
      user: {
        summary: 'An example of updating user data',
        value: {
          name: 'Updated Name',
          email: 'updatedemail@example.com',
          documentUser: 'newdocument',
          typeDocument: 'newtype',
          metadata: 'Updated metadata',
          termsVersion: '2.0',
          metadataTerms: '2.0',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'The user has been successfully updated.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  async updateUsers(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<any> {
    await this.usersService.updateUser(id, updateUserDto);
    return { message: 'User update successfully' };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete a user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiHeader({
    name: 'x-api-key',
    description: 'API key needed to access this endpoint',
  })
  @ApiResponse({
    status: 200,
    description: 'The user has been successfully deleted.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  async deleteUser(@Param('id') id: string): Promise<any> {
    await this.usersService.removeUser(id);

    return { message: 'User deleted successfully' };
  }
}
