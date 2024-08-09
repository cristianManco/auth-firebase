import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsEnum } from 'class-validator';
import { Document } from 'mongoose';
import { WhitelistStatus } from '../constants/whitelist-status.enum';

export type WhitelistDocument = Whitelist & Document;

@Schema()
export class Whitelist {
  @Prop({ required: true })
  token: string;

  @IsEnum(WhitelistStatus)
  @Prop({ type: String, enum: WhitelistStatus, default: WhitelistStatus.ASSET })
  status: WhitelistStatus;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop()
  createdBy: string;

  @Prop()
  updatedAt: Date;

  @Prop()
  updatedBy: string;

  @Prop()
  deletedAt: Date;

  @Prop()
  deletedBy: string;
}

export const WhitelistSchema = SchemaFactory.createForClass(Whitelist);
