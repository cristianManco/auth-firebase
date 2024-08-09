import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  HttpException,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiHeader,
} from '@nestjs/swagger';
import { CreateApiKeyDto } from '../dtos/createApiKey.dto';
import { UpdateApiKeyDto } from '../dtos/updateApiKey.dto';
import { ApiKeyService } from '../service/api-key.service';
import { ApiKey } from '../entities/api-key.entity';
import { validateKeyDto } from '../dtos/validate.dto';

@ApiTags('API Keys')
@Controller('api-keys')
export class ApiKeyController {
  constructor(private readonly apiKeyService: ApiKeyService) {}

  @Post('new')
  @ApiHeader({
    name: 'x-api-key',
    description: 'API key needed to access this endpoint',
  })
  @ApiOperation({ summary: 'Create a new API key' })
  @ApiBody({ type: CreateApiKeyDto })
  @ApiResponse({
    status: 201,
    description: 'The API key has been successfully created.',
  })
  @ApiBadRequestResponse({ description: 'Invalid data provided.' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error.' })
  async create(@Body() createApiKeyDto: CreateApiKeyDto) {
    try {
      return await this.apiKeyService.createApiKey(createApiKeyDto);
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.FORBIDDEN,
      );
    }
  }

  @Post('validate')
  @ApiHeader({
    name: 'x-api-key',
    description: 'API key needed to access this endpoint',
  })
  @ApiBody({
    type: validateKeyDto,
  })
  @ApiOperation({ summary: 'Validate an API key' })
  @ApiResponse({ status: 201, description: 'Validation successful.' })
  @ApiBadRequestResponse({ description: 'Invalid API key provided.' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error.' })
  async validateApiKey(@Body('key') key: string) {
    try {
      return await this.apiKeyService.validateApiKey(key);
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.FORBIDDEN,
      );
    }
  }

  @Get('all')
  @ApiHeader({
    name: 'x-api-key',
    description: 'API key needed to access this endpoint',
  })
  @ApiOperation({ summary: 'Get all API keys' })
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  @ApiResponse({
    status: 200,
    description: 'API keys retrieved successfully.',
    type: ApiKey,
    isArray: true,
  })
  @ApiBadRequestResponse({ description: 'Invalid query parameters provided.' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error.' })
  async getAll(
    @Query('page') page: number,
    @Query('limit') limit: number,
  ): Promise<ApiKey[]> {
    try {
      return await this.apiKeyService.findAll(page, limit);
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.NO_CONTENT,
      );
    }
  }

  @Get(':id')
  @ApiHeader({
    name: 'x-api-key',
    description: 'API key needed to access this endpoint',
  })
  @ApiOperation({ summary: 'Get API key by ID' })
  @ApiParam({ name: 'id', type: 'string', description: 'API key ID' })
  @ApiResponse({
    status: 200,
    description: 'API key retrieved successfully.',
    type: ApiKey,
  })
  @ApiInternalServerErrorResponse({ description: 'Internal server error.' })
  @ApiParam({ name: 'id', type: 'string', description: 'API key ID' })
  async findOne(@Param('id') id: string) {
    try {
      return await this.apiKeyService.getApiKey(id);
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.NOT_FOUND,
      );
    }
  }

  @Patch(':id')
  @ApiHeader({
    name: 'x-api-key',
    description: 'API key needed to access this endpoint',
  })
  @ApiOperation({ summary: 'Update an API key by ID' })
  @ApiParam({ name: 'id', type: 'string', description: 'API key ID' })
  @ApiBody({ type: UpdateApiKeyDto })
  @ApiResponse({ status: 200, description: 'API key updated successfully.' })
  @ApiBadRequestResponse({ description: 'Invalid data provided.' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error.' })
  async update(
    @Param('id') id: string,
    @Body() updateApiKeyDto: UpdateApiKeyDto,
  ) {
    try {
      return await this.apiKeyService.updateApiKey(id, updateApiKeyDto);
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.NOT_ACCEPTABLE,
      );
    }
  }

  @Delete(':id')
  @ApiHeader({
    name: 'x-api-key',
    description: 'API key needed to access this endpoint',
  })
  @ApiOperation({ summary: 'Revoke an API key by ID' })
  @ApiParam({ name: 'id', type: 'string', description: 'API key ID' })
  @ApiResponse({
    status: 200,
    description:
      'API key revoked successfully.' /* , type: { message: 'API key revoked successfully' } */,
  })
  @ApiInternalServerErrorResponse({ description: 'Internal server error.' })
  async remove(@Param('id') id: string) {
    try {
      await this.apiKeyService.revokeApiKey(id);
      return { message: 'API key revoked successfully' };
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.NOT_IMPLEMENTED,
      );
    }
  }
}
