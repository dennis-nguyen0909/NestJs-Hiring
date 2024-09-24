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

  @Prop([{ type: Types.ObjectId, ref: Job.name }])
  jobs_ids: [Job];

  @Prop({ type: Types.ObjectId, ref: User.name, required: false }) // Assuming User fields
  user_id?: User;  // This field references a User if needed

  @Prop()
  description: string;
}

export const EmployerSchema = SchemaFactory.createForClass(Employer);
