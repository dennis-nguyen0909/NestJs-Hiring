import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class SocialLink extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User' })
  user_id: Types.ObjectId;

  @Prop({ required: true })
  type: string;

  @Prop()
  url: string;
}

export const SocialLinkSchema = SchemaFactory.createForClass(SocialLink);
