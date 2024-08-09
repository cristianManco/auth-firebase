import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateOtpDto } from '../dtos/create-otp.dto';
import { GenerateOtpCodeService } from '../utils/services/generateOtp.service';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Otp, OtpDocument } from '../entities/otp.entity';
import { ValidateOtpService } from '../utils/services/validateOtp.service';
import { User, UserDocument } from 'src/modules/user/entities/user.entity';
import { EmailService } from 'src/Libs/email/services/email.service';

@Injectable()
export class OtpService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Otp.name) private otpModel: Model<OtpDocument>,
    private readonly generateOtpService: GenerateOtpCodeService,
    private readonly validateOtpService: ValidateOtpService,
    private readonly emailService: EmailService,
  ) {}

  async createOtpCode({ id_user }: CreateOtpDto): Promise<Otp> {
    try {
      const user = await this.userModel.findOne({ id: id_user }).exec();

      if (!user)
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);

      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - 10 * 60 * 1000);

      const validateOtpGeneratedCodes = await this.otpModel
        .find({
          id_user,
          createdAt: { $gte: startDate, $lte: endDate },
        })
        .exec();

      if (validateOtpGeneratedCodes.length >= 3)
        throw new HttpException(
          'No more than 3 OTP codes can be generated in less than 10 minutes',
          HttpStatus.TOO_MANY_REQUESTS,
        );

      const otpCode = await this.generateOtpService.generateOtpCode(
        user.id,
        user.email,
      );

      const dataToSend = {
        email: user.email,
        templateId: 1,
        context: {
          code: otpCode.code,
        },
      };

      await this.emailService.sendEmail(dataToSend);

      return otpCode;
    } catch (err) {
      throw new HttpException(`Error: ${err}`, HttpStatus.NOT_ACCEPTABLE);
    }
  }

  async validateOtpCode(id_user: string, otpCode: number): Promise<string> {
    try {
      const validateOtp = await this.validateOtpService.validateOtp(
        id_user,
        otpCode,
      );

      if (!validateOtp)
        throw new HttpException(
          'An error occurred in the validation of the OTP code',
          HttpStatus.UNAUTHORIZED,
        );

      return 'This code is valid!';
    } catch (err) {
      throw new HttpException(`Error: ${err}`, HttpStatus.NOT_IMPLEMENTED);
    }
  }
}
