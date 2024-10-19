import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Job } from '../../job/schema/Job.schema';

@Schema()
export class Major extends Document {
  @Prop({ required: true, index: true })
  name: string;

  @Prop()
  description?: string;
}

export const MajorSchema = SchemaFactory.createForClass(Major);
