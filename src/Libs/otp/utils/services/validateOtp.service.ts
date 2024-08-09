import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Otp, OtpDocument } from '../../entities/otp.entity';
import { Model } from 'mongoose';
import { OtpStatusType } from '../../constants/otp-status.enum';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class ValidateOtpService {
  constructor(@InjectModel(Otp.name) private otpModel: Model<OtpDocument>) {}

  async validateOtp(id_user: string, otp: number): Promise<boolean> {
    try {
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - 10 * 60 * 1000);

      const existOtp = await this.otpModel
        .find({
          id_user,
          createdAt: { $gte: startDate, $lte: endDate },
        })
        .exec();

      if (!existOtp || existOtp.length <= 0)
        throw new HttpException(
          'This user does not have OTP codes generated',
          HttpStatus.NOT_FOUND,
        );

      const lastOtp = existOtp[existOtp.length - 1];

      if (lastOtp.status === OtpStatusType.USED)
        throw new HttpException(
          'This code has already been used',
          HttpStatus.FORBIDDEN,
        );

      if (lastOtp.expiredIn < endDate)
        throw new HttpException(
          'This code has already expired',
          HttpStatus.FORBIDDEN,
        );

      if (lastOtp.code != otp)
        throw new HttpException('This code is not valid', HttpStatus.FORBIDDEN);

      lastOtp.status = OtpStatusType.USED;

      await lastOtp.save();

      return true;
    } catch (err) {
      throw new HttpException(`Error: ${err}`, HttpStatus.NOT_IMPLEMENTED);
    }
  }
}
