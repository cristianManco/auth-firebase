import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsEnum, IsOptional } from 'class-validator';
import { Document } from 'mongoose';
import { UserType } from 'src/Libs/Enums/roles.enum';
import { v4 as uuidv4 } from 'uuid';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop({ type: String, default: uuidv4 })
  id: string;

  @Prop({ required: true })
  firebaseId: string;

  @Prop()
  name: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  accessMethod: string;

  @Prop()
  metadata: string;

  @Prop()
  documentUser: string;

  @Prop()
  typeDocument: string;

  @Prop({ required: true })
  termsVersion: string;

  @Prop({ required: true })
  metadataTerms: string;

  @IsOptional()
  @IsEnum(UserType)
  @Prop({ type: String, enum: UserType, default: UserType.USER })
  role: UserType;

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

export const UserSchema = SchemaFactory.createForClass(User);
