import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
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
}

export const CurrenciesSchema = SchemaFactory.createForClass(Currency);
