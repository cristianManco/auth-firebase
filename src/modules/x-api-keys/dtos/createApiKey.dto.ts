import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsString,
  IsBoolean,
  IsDate,
  IsOptional,
  IsNumber,
  IsArray,
  IsNotEmpty,
} from 'class-validator';

export class CreateApiKeyDto {
  @ApiProperty({
    description: 'Name of the system for which the API key is created',
    example: 'System X',
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value.toLowerCase())
  system_name: string;

  @ApiProperty({
    description: 'Expiration date of the API key',
    example: '2023-12-31T23:59:59.000Z',
    required: false,
  })
  @IsOptional()
  @IsDate()
  expiration?: Date;

  @ApiProperty({
    description: 'Status of the API key',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({
    description: 'Description of the API key',
    example: 'API key for accessing System X services',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'roles of the API key',
    example: ['ROLES'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  roles?: string[];

  @ApiProperty({
    description: 'Last usage date of the API key',
    example: '2023-07-14T12:00:00.000Z',
    required: false,
  })
  @IsOptional()
  @IsDate()
  lastUsedAt?: Date | null;

  @ApiProperty({
    description: 'Maximum usage limit of the API key',
    example: 1000,
    required: false,
  })
  @IsNotEmpty()
  @IsNumber()
  maxUsage?: number | null;

  @ApiProperty({
    description: 'Current usage count of the API key',
    example: 50,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  usageCount?: number;

  @ApiProperty({
    description: 'Allowed IP addresses for the API key',
    example: ['192.168.0.1', '10.0.0.1'],
    required: false,
    isArray: true,
    type: String,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allowedIps?: string[];

  @ApiProperty({
    description: 'Permissions granted to the API key',
    example: ['read', 'write'],
    required: false,
    isArray: true,
    type: String,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissions?: string[];

  @ApiProperty({
    description: 'Creation date of the API key',
    example: '2023-07-11T00:00:00.000Z',
    required: false,
  })
  @IsOptional()
  @IsDate()
  createdAt?: Date | null;

  @ApiProperty({
    description: 'User who created the API key',
    example: 'user1',
    required: false,
  })
  @IsOptional()
  @IsString()
  createBy?: string;

  @ApiProperty({
    description: 'Last updated date of the API key',
    example: '2023-07-12T00:00:00.000Z',
    required: false,
  })
  @IsOptional()
  @IsDate()
  updatedAt?: Date | null;

  @ApiProperty({
    description: 'User who last updated the API key',
    example: 'user2',
    required: false,
  })
  @IsOptional()
  @IsString()
  updateBy?: string;

  @ApiProperty({
    description: 'Deletion date of the API key',
    example: '2023-07-13T00:00:00.000Z',
    required: false,
  })
  @IsOptional()
  @IsDate()
  deletedAt?: Date | null;

  @ApiProperty({
    description: 'User who deleted the API key',
    example: 'user3',
    required: false,
  })
  @IsOptional()
  @IsString()
  deleteBy?: string;
}
