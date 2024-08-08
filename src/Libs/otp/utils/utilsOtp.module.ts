import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ValidateOtpService } from './services/validateOtp.service';
import { GenerateOtpCodeService } from './services/generateOtp.service';
import { GenerateCodeService } from './services/generateCode.service';
import { Otp, OtpSchema } from '../entities/otp.entity';

const providers = [
  ValidateOtpService,
  GenerateOtpCodeService,
  GenerateCodeService,
];

@Module({
  imports: [MongooseModule.forFeature([{ name: Otp.name, schema: OtpSchema }])],
  providers,
  exports: [...providers],
})
export class UtilsOtpModule {}
