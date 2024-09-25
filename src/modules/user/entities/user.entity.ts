import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
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

  @Prop({ type: [String], required: true })
  roles: string[];

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop()
  createdBy: string;

  @Prop()
  updatedAt: Date;

  @Prop()
  updatedBy: string;

  @Prop({ default: null })
  deletedAt: Date;

  @Prop()
  deletedBy: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
