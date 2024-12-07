import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
@Schema({ timestamps: true })
export class Currency extends Document {
  @Prop({ required: true })
  name: string;
  @Prop()
  @Prop({ required: true })
  code: string;
  @Prop()
  key: string;
  @Prop()
  @Prop({ required: true })
  symbol: string;

  @Prop({ type: Types.ObjectId, ref: 'Users' })
  user_id: Types.ObjectId;
}

export const CurrenciesSchema = SchemaFactory.createForClass(Currency);
