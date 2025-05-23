import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class JobType extends Document {
  @Prop({ required: true })
  name: string;

  @Prop()
  key: string;

  @Prop()
  description: string;

  @Prop({ type: Types.ObjectId, ref: 'Users' })
  user_id: Types.ObjectId;
}

export const JobTypeSchema = SchemaFactory.createForClass(JobType);
