import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({
    description: 'Role name (RoleName platform)',
    type: String,
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Role code (RoleName-Platform)',
    type: String,
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  code: string;

  @ApiProperty({
    description: 'Role description',
    type: String,
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Platform',
    type: String,
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  associatedPlatform: string;

  @ApiProperty({
    description: 'api-key-NamePlatform',
    type: String,
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  xApiKey: string;

  @ApiProperty({
    description: 'If one role is restricted',
    type: Boolean,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  restricted: boolean;
}
