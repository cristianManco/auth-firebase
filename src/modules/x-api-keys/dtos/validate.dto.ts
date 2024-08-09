import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class validateKeyDto {
  @ApiProperty({
    description: 'Name of the system for which the API key is created',
    example: 'ctsate8sw3w8tkk6m6pjz47vleg5pm',
  })
  @IsString()
  @IsNotEmpty()
  key: string;
}
