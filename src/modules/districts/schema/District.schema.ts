import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Ward, WardSchema } from 'src/modules/wards/schema/Wards.schema';

@Schema()
export class District {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  code: number;

  @Prop({ required: true })
  division_type: string;

  @Prop({ required: true })
  codename: string;

  @Prop({ required: true })
  province_code: number;

  @Prop({ type: [Types.ObjectId], ref: 'Ward' })
  wards: Types.ObjectId[]; // Lưu ObjectId thay vì nhúng trực tiếp
}

export const DistrictSchema = SchemaFactory.createForClass(District);
