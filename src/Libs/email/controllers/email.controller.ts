import { Body, Controller, Post } from '@nestjs/common';
import { EmailService } from '../services/email.service';
import { SendEmailDto } from '../dtos/send-email.dto';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('email')
@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @ApiOperation({ summary: 'Endpoint to send email.' })
  @ApiBody({
    description: 'Payload to send an email using a template.',
    type: SendEmailDto,
    examples: {
      example1: {
        summary: 'Example payload',
        value: {
          email: 'email@mail.com',
          templateId: 1,
          context: {},
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'The email was sent correctly.' })
  @Post('send')
  async sendEmail(@Body() sendEmailDto: SendEmailDto) {
    return await this.emailService.sendEmail(sendEmailDto);
  }
}
