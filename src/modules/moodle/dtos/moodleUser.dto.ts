import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateMoodleUserDto {
  @ApiProperty({
    description: 'Username for the Moodle user',
    example: 'johndoe',
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value.toLowerCase())
  username: string;

  @ApiProperty({
    description: 'Email address of the Moodle user',
    example: 'johndoe@example.com',
  })
  @IsNotEmpty()
  @IsEmail()
  @Transform(({ value }) => value.toLowerCase())
  email: string;

  @ApiProperty({
    description: 'First name of the Moodle user',
    example: 'John',
  })
  @IsNotEmpty()
  @IsString()
  firstname: string;

  @ApiProperty({
    description: 'Last name of the Moodle user',
    example: 'Doe',
  })
  @IsString()
  lastname: string;

  @ApiProperty({
    description: 'Password for the Moodle user',
    example: 'P@ssw0rd123',
    required: false,
  })
  @IsOptional()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/, {
    message:
      'Password must contain at least 8 characters, including uppercase, lowercase, numbers, and special characters.',
  })
  @IsString()
  password?: string;

  @ApiProperty({
    description: 'Authentication method',
    example: 'manual',
    required: false,
  })
  @IsString()
  auth?: string;
}
