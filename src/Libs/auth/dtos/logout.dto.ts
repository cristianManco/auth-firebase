import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LogoutUserDto {
  @ApiProperty({
    description: 'Token of JWT.',
    type: String,
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  token: string;
}
