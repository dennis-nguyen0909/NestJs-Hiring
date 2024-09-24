import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Employer } from '../../employer/schema/Employer.schema'; // Nhớ import Employer schema
import { User } from '../../users/schemas/User.schema'; // Nhớ import User schema

@Schema()
export class Follow extends Document {
  @Prop({ type: Types.ObjectId, ref: Employer.name, required: true })
  employer_following: Types.ObjectId; // Tham chiếu đến Employer

  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  user_following: Types.ObjectId; // Tham chiếu đến User

  @Prop({ required: true })
  follow_type: string;

  @Prop({ type: Date, default: Date.now })
  follow_date: Date;
}

export const FollowSchema = SchemaFactory.createForClass(Follow);
