import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class UpdateOtpDto {
  @ApiProperty({
    description: 'Unique identifier for the user',
    type: String,
    format: 'uuid',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  id: string;

  @ApiProperty({
    description: 'OTP code',
    type: Number,
    required: true,
  })
  @IsNotEmpty()
  @IsNumber()
  code: number;
}
