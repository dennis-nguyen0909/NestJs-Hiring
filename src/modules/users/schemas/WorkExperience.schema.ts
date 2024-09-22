import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { CV } from './CV.schema';

@Schema()
export class WorkExperience extends Document {
  @Prop({ required: true })
  company: string;

  @Prop({ required: true })
  position: string;

  @Prop({ required: true })
  years: string;

  @Prop({ type: Types.ObjectId, ref: CV.name })
  cv: string;
}

export const WorkExperienceSchema =
  SchemaFactory.createForClass(WorkExperience);
