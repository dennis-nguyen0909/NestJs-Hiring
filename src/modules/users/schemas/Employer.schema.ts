import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Job } from './Job.schema'; // Nhớ import Job schema

@Schema()
export class Employer extends Document {
  @Prop({ required: true })
  company_name: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  phone: string;

  @Prop()
  website: string;

  @Prop()
  location: string;

  @Prop([{ type: Types.ObjectId, ref: Job.name }])
  jobs_ids: [Job];

  @Prop()
  description: string;
}

export const EmployerSchema = SchemaFactory.createForClass(Employer);
