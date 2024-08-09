import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { ApiKey, ApiKeyDocument } from '../entities/api-key.entity';
import { CreateApiKeyDto } from '../dtos/createApiKey.dto';
import { UpdateApiKeyDto } from '../dtos/updateApiKey.dto';

@Injectable()
export class ApiKeyService {
  private readonly logger = new Logger(ApiKeyService.name);

  constructor(
    @InjectModel(ApiKey.name) private apiKeyModel: Model<ApiKeyDocument>,
  ) {}

  async createApiKey(
    createApiKeyDto: CreateApiKeyDto,
  ): Promise<{ key: string; isActive: boolean }> {
    try {
      const key = await this.generateApiKey();
      if (!key) {
        this.logger.error('Error generating API key');
        throw new HttpException(
          'Error generating API key',
          HttpStatus.NOT_IMPLEMENTED,
        );
      }
      const hashedKey = await bcrypt.hash(key, 10);
      if (!hashedKey) {
        this.logger.error('Error hashing API key');
        throw new HttpException(
          'Error hashing API key',
          HttpStatus.NOT_IMPLEMENTED,
        );
      }
      const newApiKey = new this.apiKeyModel({
        ...createApiKeyDto,
        key: hashedKey,
      });
      await newApiKey.save();
      return { key, isActive: newApiKey.isActive };
    } catch (error) {
      this.logger.error('Error creating API key', error.stack);
      throw new HttpException('Error creating API key', HttpStatus.FORBIDDEN);
    }
  }

  async getApiKey(id: string): Promise<ApiKey> {
    try {
      const apiKey = await this.apiKeyModel.findById(id).exec();
      if (!apiKey) {
        throw new HttpException('API Key not found', HttpStatus.NOT_FOUND);
      }
      return await apiKey;
    } catch (error) {
      this.logger.error(`Error getting API key with id: ${id}`, error.stack);
      throw new HttpException('Error getting API key', HttpStatus.NOT_FOUND);
    }
  }

  async updateApiKey(
    id: string,
    updateApiKeyDto: UpdateApiKeyDto,
  ): Promise<ApiKey> {
    try {
      const updatedApiKey = await this.apiKeyModel
        .findByIdAndUpdate(id, updateApiKeyDto, { new: true })
        .exec();
      if (!updatedApiKey) {
        throw new HttpException('API Key not found', HttpStatus.NOT_FOUND);
      }
      return await updatedApiKey;
    } catch (error) {
      this.logger.error(`Error updating API key with id: ${id}`, error.stack);
      throw new HttpException(
        'Error updating API key',
        HttpStatus.NOT_IMPLEMENTED,
      );
    }
  }

  async revokeApiKey(id: string): Promise<void> {
    try {
      const apiKey = await this.apiKeyModel.findById(id).exec();
      if (!apiKey) {
        throw new HttpException('API Key not found', HttpStatus.NOT_FOUND);
      }
      apiKey.isActive = false;
      await apiKey.save();
    } catch (error) {
      this.logger.error(`Error revoking API key with id: ${id}`, error.stack);
      throw new HttpException(
        'Error revoking API key',
        HttpStatus.NOT_IMPLEMENTED,
      );
    }
  }

  async findAll(page: number = 1, limit: number = 10): Promise<ApiKey[]> {
    try {
      const apiKeys = await this.apiKeyModel
        .find({ isActive: true })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec();
      if (!apiKeys.length) {
        throw new HttpException('No API keys found', HttpStatus.NO_CONTENT);
      }
      return await apiKeys;
    } catch (error) {
      this.logger.error('Error retrieving API keys', error.stack);
      throw new HttpException(
        'Error retrieving API keys',
        HttpStatus.NOT_FOUND,
      );
    }
  }

  async validateApiKey(key: string): Promise<boolean> {
    try {
      const apiKeys = await this.apiKeyModel.find({ isActive: true }).exec();
      if (!apiKeys.length) {
        throw new HttpException(
          'No active API keys found',
          HttpStatus.NOT_FOUND,
        );
      }
      for (const apiKey of apiKeys) {
        const isMatch = await bcrypt.compare(key, apiKey.key);
        if (isMatch) {
          if (
            apiKey.maxUsage !== null &&
            apiKey.usageCount >= apiKey.maxUsage
          ) {
            apiKey.isActive = false;
            await apiKey.save();
            this.logger.warn(`API key usage limit reached: ${key}`);
            throw new HttpException(
              'API key usage limit reached',
              HttpStatus.FORBIDDEN,
            );
          }
          apiKey.usageCount++;
          await apiKey.save();
          this.logger.log(`API key matched and validated`);
          await this.updateLastUsed(apiKey.id);
          return true;
        }
      }
      return false;
    } catch (error) {
      this.logger.error('Error validating API key', error.stack);
      throw new HttpException(
        'Error validating API key',
        HttpStatus.NOT_IMPLEMENTED,
      );
    }
  }

  private async updateLastUsed(apiKeyId: string): Promise<void> {
    try {
      await this.apiKeyModel
        .findOneAndUpdate({ _id: apiKeyId }, { lastUsedAt: new Date() })
        .exec();
    } catch (error) {
      this.logger.error(
        `Error updating lastUsedAt for id: ${apiKeyId}`,
        error.stack,
      );
      throw new HttpException(
        'Error updating lastUsedAt',
        HttpStatus.NOT_ACCEPTABLE,
      );
    }
  }

  private async generateApiKey(): Promise<string> {
    try {
      return await [...Array(30)]
        .map(() => ((Math.random() * 36) | 0).toString(36))
        .join('');
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_IMPLEMENTED);
    }
  }
}
