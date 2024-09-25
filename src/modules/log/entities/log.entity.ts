import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Log extends Document {
  @Prop({ required: true })
  ip: string;

  @Prop({ required: true })
  apiKey: string;

  @Prop({ default: null })
  accesstoken: string;

  @Prop()
  id_user: string;

  @Prop({ default: null })
  system_name: string;

  @Prop({ required: true })
  endpoint: string;

  @Prop({ required: true })
  method: string;

  @Prop({ required: true })
  action: string;

  @Prop({ default: undefined })
  userAgent?: string;

  @Prop({ default: undefined })
  host?: string;

  @Prop({ required: true })
  responseStatus: number;

  @Prop({ required: true })
  responseTime: number;

  @Prop({ default: null })
  details?: string;

  @Prop({ default: null })
  data: string;

  @Prop({ default: new Date() })
  createdAt?: Date;

  @Prop({ default: null })
  updatedAt?: Date;

  @Prop({ default: null })
  deletedAt: Date;
}

export const LogSchema = SchemaFactory.createForClass(Log);
