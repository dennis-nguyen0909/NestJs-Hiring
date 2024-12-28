import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class CV extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User' })
  user_id: Types.ObjectId;

  @Prop()
  cv_name: string;

  @Prop()
  cv_link: string;

  @Prop()
  public_id: string;

  @Prop()
  bytes: number;
}

export const CVSchema = SchemaFactory.createForClass(CV);
