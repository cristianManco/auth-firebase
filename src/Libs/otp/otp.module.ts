import { Module } from '@nestjs/common';
import { UtilsOtpModule } from './utils/utilsOtp.module';
import { OtpCOntroller } from './controllers/otp.controller';
import { OtpService } from './services/otp.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../../modules/user/entities/user.entity';
import { Otp, OtpSchema } from './entities/otp.entity';
import { SendEmailModule } from '../email/email.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Otp.name, schema: OtpSchema },
    ]),
    UtilsOtpModule,
    SendEmailModule,
  ],
  controllers: [OtpCOntroller],
  providers: [OtpService],
})
export class OtpModule {}
