import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Otp, OtpDocument } from '../../entities/otp.entity';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { OtpStatusType } from '../../constants/otp-status.enum';
import { GenerateCodeService } from './generateCode.service';

@Injectable()
export class GenerateOtpCodeService {
  constructor(
    private readonly codes: GenerateCodeService,
    @InjectModel(Otp.name) private readonly otpModel: Model<OtpDocument>,
  ) {}

  async generateOtpCode(id_user: string, email_user: string): Promise<Otp> {
    try {
      const code = await this.codes.generateCode();
      const createOtpCode = new this.otpModel({
        id_user,
        email_user,
        code: code,
        status: OtpStatusType.NOT_USED,
        createdAt: new Date(),
      });

      return await createOtpCode.save();
    } catch (err) {
      throw new HttpException(
        `Ups... error: ${err}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
