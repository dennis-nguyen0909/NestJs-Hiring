import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../../users/schemas/User.schema';
import { Job } from '../../job/schema/Job.schema';
import { Employer } from '../../employer/schema/Employer.schema';
import { CV } from '../../cv/schema/CV.schema';

@Schema()
export class Application extends Document {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  user: string;

  @Prop({ type: Types.ObjectId, ref: Job.name, required: true })
  job: string;

  @Prop({ type: Types.ObjectId, ref: Employer.name, required: true })
  employer_id: string;
  @Prop({ type: Types.ObjectId, ref: CV.name, required: true })
  cv_id: string;
  @Prop({ required: true })
  cover_letter: string;

  @Prop({ type: Date, default: Date.now })
  applied_date: Date;

  @Prop({
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending',
  })
  status: string;
}

export const ApplicationSchema = SchemaFactory.createForClass(Application);
