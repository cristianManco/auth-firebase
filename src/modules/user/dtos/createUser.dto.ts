import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    description: 'Unique identifier for the user',
    type: String,
    format: 'uuid',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  id: string;

  @ApiProperty({
    description: 'Email of the user',
    type: String,
    format: 'email',
  })
  @IsOptional()
  @IsEmail()
  @Transform(({ value }) => value.toLowerCase())
  email: string;

  @ApiProperty({
    description: 'Method of access for the user',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  accessMethod: string;

  @ApiProperty({
    description: 'Metadata related to the user',
    type: String,
    required: false,
  })
  @IsString()
  @IsOptional()
  metadata: string;

  @ApiProperty({
    description: 'Name of the user',
    type: String,
    required: false,
  })
  @IsString()
  @IsOptional()
  name: string;

  @ApiProperty({
    description: 'Document number of the user',
    type: String,
    required: false,
  })
  @IsString()
  @IsOptional()
  documentUser: string;

  @ApiProperty({
    description: 'Type of document for the user',
    type: String,
    required: false,
  })
  @IsString()
  @IsOptional()
  typeDocument: string;

  @ApiProperty({
    description: 'Role of the user',
    type: String,
    required: false,
  })
  @IsString({ each: true })
  @IsOptional()
  role: string;

  @ApiProperty({
    description: 'Version of terms and conditions',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  termsVersion: string;

  @ApiProperty({
    description: 'Terms and conditions of metadata usage',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  metadataTerms: string;

  @ApiProperty({
    description: 'JWT token for the user',
    type: String,
    required: false,
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  token: string;
}
