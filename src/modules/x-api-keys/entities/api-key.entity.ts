import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ApiKeyDocument = ApiKey & Document;

@Schema({ timestamps: true })
export class ApiKey {
  @Prop({ required: true })
  system_name: string;

  @Prop({ required: true, unique: true })
  key: string;

  @Prop({ default: null })
  description: string;

  @Prop({ default: null })
  lastUsedAt: Date | null;

  @Prop({ default: null })
  maxUsage: number | null;

  @Prop({ default: 0 })
  usageCount: number;

  @Prop({ type: [String], default: [] })
  allowedIps: string[];

  @Prop({ type: [String], default: [] })
  permissions: string[];

  @Prop()
  expiration: Date;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: null })
  createdAt: Date | null;

  @Prop()
  createBy: string;

  @Prop({ default: null })
  updatedAt: Date | null;

  @Prop()
  updateBy: string;

  @Prop({ default: null })
  deletedAt: Date | null;

  @Prop()
  deleteBy: string;
}

export const ApiKeySchema = SchemaFactory.createForClass(ApiKey);
