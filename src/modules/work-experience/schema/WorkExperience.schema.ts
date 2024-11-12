import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { CV } from '../../cv/schema/CV.schema';

@Schema()
export class WorkExperience extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User' })
  user_id: Types.ObjectId;
  @Prop({ required: true })
  company: string;

  @Prop({ required: true })
  position: string;

  @Prop()
  start_date: Date;

  @Prop()
  end_date: Date;

  @Prop()
  currently_working: boolean;

  @Prop()
  description: string;

  @Prop()
  image_url: string;
  // @Prop({ type: Types.ObjectId, ref: 'CV' })
  // cv: string;
}

export const WorkExperienceSchema =
  SchemaFactory.createForClass(WorkExperience);
