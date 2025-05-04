import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PackageDocument = Package & Document;

@Schema({ timestamps: true })
export class Package {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true })
  duration: number;

  @Prop({ default: 'months' })
  durationType: string;

  @Prop({ default: null })
  jobPostLimit: number;

  @Prop({ default: null })
  jobDisplayDuration: number;

  @Prop({ default: null })
  accessToResume: number;

  @Prop({ default: false })
  featuredJob: boolean;

  @Prop({ default: false })
  prioritySupport: boolean;

  @Prop({ default: true })
  isActive: boolean;

  // Additional features
  @Prop({ default: false })
  directContact: boolean;

  @Prop({ default: false })
  jobRefresh: boolean;

  @Prop({ default: false })
  advancedReports: boolean;
}

export const PackageSchema = SchemaFactory.createForClass(Package);
