import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Date, Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Prize extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user_id: Types.ObjectId;
  @Prop()
  prize_name: string;
  @Prop()
  organization_name: string;
  @Prop({ type: Date })
  date_of_receipt: Date;
  @Prop()
  prize_link: string;
  @Prop()
  prize_image: string;
}

export const PrizeSchema = SchemaFactory.createForClass(Prize);
