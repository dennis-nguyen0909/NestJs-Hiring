import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Notification extends Document {
  @Prop({ required: true })
  recipient_id: string;

  @Prop({ required: true })
  sender_id: string;

  @Prop({ required: true })
  action_type: string;

  @Prop({ required: true })
  message: string;

  @Prop({ default: false })
  is_read: boolean;

  @Prop({ type: Date, default: Date.now })
  created_at: Date;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
