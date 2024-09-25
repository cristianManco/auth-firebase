import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsBoolean } from 'class-validator';
import { Document } from 'mongoose';

export type WhitelistDocument = Whitelist & Document;

@Schema()
export class Whitelist {
  @Prop({ required: true })
  token: string;

  @IsBoolean()
  @Prop({ default: true })
  status: boolean;

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
