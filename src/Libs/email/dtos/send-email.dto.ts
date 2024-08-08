import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsObject } from 'class-validator';

export class SendEmailDto {
  @ApiProperty({
    description: 'Email to send mail',
    type: String,
    format: 'email',
    required: true,
  })
  @IsNotEmpty()
  @IsEmail()
  @Transform(({ value }) => value.toLowerCase())
  email: string;

  @ApiProperty({
    description: 'Id of the Brevo template to use',
    type: Number,
    required: true,
  })
  templateId: number;

  @ApiProperty({
    description: 'Context for the email template',
    type: Object,
    required: true,
  })
  @IsNotEmpty()
  @IsObject()
  context: any;
}
