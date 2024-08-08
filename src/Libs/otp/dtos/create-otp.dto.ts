import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateOtpDto {
  @ApiProperty({
    description: 'Unique identifier for the user',
    type: String,
    format: 'uuid',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  id_user: string;
}
