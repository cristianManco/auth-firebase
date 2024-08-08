import { Injectable } from '@nestjs/common';
import { SendEmailDto } from '../dtos/send-email.dto';
import { ConfigService } from '@nestjs/config';
import * as Brevo from '@getbrevo/brevo';

@Injectable()
export class EmailService {
  private brevoApi: Brevo.TransactionalEmailsApi;

  constructor(private configService: ConfigService) {
    this.initializeBrevoClient();
  }

  private initializeBrevoClient() {
    const apiKey = this.configService.get<string>('BREVO_API_KEY');
    this.brevoApi = new Brevo.TransactionalEmailsApi();
    this.brevoApi.setApiKey(Brevo.TransactionalEmailsApiApiKeys.apiKey, apiKey);
  }

  private createSendSmtpEmail(sendEmailDto: SendEmailDto): Brevo.SendSmtpEmail {
    return {
      templateId: sendEmailDto.templateId,
      params: sendEmailDto.context,
      sender: {
        email: this.configService.get('EMAIL_SENDER_EMAIL'),
        name: this.configService.get('EMAIL_SENDER_NAME'),
      },
      to: [{ email: sendEmailDto.email }],
    };
  }

  async sendEmail(sendEmailDto: SendEmailDto) {
    const sendSmtpEmail = this.createSendSmtpEmail(sendEmailDto);

    try {
      const data = await this.brevoApi.sendTransacEmail(sendSmtpEmail);
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error.message,
          status: error.status,
          response: error.response?.body,
        },
      };
    }
  }
}
