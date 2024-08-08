import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsEnum, IsOptional } from 'class-validator';
import { Document } from 'mongoose';
import { OtpStatusType } from '../constants/otp-status.enum';

export type OtpDocument = Otp & Document;

@Schema()
export class Otp {
  @Prop()
  id_user: string;

  @Prop()
  email_user: string;

  @Prop()
  code: number;

  @IsOptional()
  @IsEnum(OtpStatusType)
  @Prop({ type: String, enum: OtpStatusType, default: OtpStatusType.NOT_USED })
  status: OtpStatusType;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({
    default: function () {
      const createdAt = this.createdAt || Date.now();
      return new Date(createdAt.getTime() + 10 * 60 * 1000);
    },
  })
  expiredIn: Date;
}

export const OtpSchema = SchemaFactory.createForClass(Otp);
