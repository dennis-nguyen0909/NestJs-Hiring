import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../../users/schemas/user.schema'; // Nhớ import User schema

@Schema()
export class Follow extends Document {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  following_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  follower_id: Types.ObjectId;

  @Prop({ type: Date, default: Date.now })
  follow_date: Date;
}

export const FollowSchema = SchemaFactory.createForClass(Follow);
