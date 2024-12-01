import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class JobContractType extends Document {
  @Prop({ required: true })
  name: string;

  @Prop()
  key: string;

  @Prop()
  description: string;
}

export const JobContractTypeSchema =
  SchemaFactory.createForClass(JobContractType);
