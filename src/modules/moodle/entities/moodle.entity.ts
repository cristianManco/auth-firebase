import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type moodleDocument = moodleUser & Document;

@Schema()
export class moodleUser {
  @Prop()
  moodleId?: number;

  @Prop({ required: true })
  user: string;

  @Prop({ required: true })
  email: string;

  @Prop()
  firstname?: string;

  @Prop()
  lastname?: string;

  @Prop()
  fullname?: string;

  @Prop()
  department?: string;

  @Prop()
  city?: string;

  @Prop()
  roles?: string[];

  @Prop()
  country?: string;

  @Prop({ default: true })
  confirmed?: boolean;

  @Prop()
  suspended?: boolean;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop()
  updatedAt?: Date;

  @Prop({ default: null })
  deletedAt?: Date;
}

export const MoodleSchema = SchemaFactory.createForClass(moodleUser);
