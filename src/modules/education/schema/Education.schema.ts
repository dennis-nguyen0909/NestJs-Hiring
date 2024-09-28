import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { CV } from '../../cv/schema/CV.schema';

@Schema()
export class Education extends Document {
  @Prop({ required: true })
  school: string;

  @Prop({ required: true })
  degree: string;

  @Prop({ required: true })
  major: string;
  @Prop({ required: true })
  start_date: Date;

  @Prop({ required: true })
  end_date: Date;

  // @Prop({ type: Types.ObjectId, ref: CV.name })
  // cv: string;
}

export const EducationSchema = SchemaFactory.createForClass(Education);
