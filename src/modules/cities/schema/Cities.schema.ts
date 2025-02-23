import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { District } from 'src/modules/districts/schema/District.schema';

@Schema()
export class Cities extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  code: number;

  @Prop({ required: true })
  division_type: string;

  @Prop({ required: true })
  codename: string;

  @Prop({ required: true })
  phone_code: number;

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: District.name }],
    default: [],
  })
  districts: District[];
}

export const CitiesSchema = SchemaFactory.createForClass(Cities);
