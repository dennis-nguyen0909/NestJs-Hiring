import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Course extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user_id: Types.ObjectId;

  @Prop({ required: true })
  course_name: string;

  @Prop({ required: true })
  organization_name: string;

  @Prop({ required: false })
  description: string;

  @Prop({ type: Date })
  start_date: Date;

  @Prop({ type: Date })
  end_date: Date;

  @Prop()
  course_link: string;

  @Prop() 
  course_image: string;
}

export const CourseSchema = SchemaFactory.createForClass(Course);
