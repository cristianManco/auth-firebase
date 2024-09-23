import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateRoleDto {
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
}
