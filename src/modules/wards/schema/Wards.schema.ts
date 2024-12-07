import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema()
export class Ward {
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
}

export const WardSchema = SchemaFactory.createForClass(Ward);

