import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Job } from '../../job/schema/Job.schema'; // Nhớ import Job schema
import { User } from 'src/modules/users/schemas/User.schema';

@Schema()
export class Employer extends Document {
  @Prop({ required: true })
  company_name: string;

  @Prop()
  website: string;

  @Prop()
  location: string;

  @Prop([{ type: Types.ObjectId, ref: 'Job'}])
  jobs_ids: [Job];


  @Prop()
  description: string;
}

export const EmployerSchema = SchemaFactory.createForClass(Employer);
