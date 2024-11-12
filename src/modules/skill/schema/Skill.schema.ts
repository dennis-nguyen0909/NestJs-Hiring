import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class Skill extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User' })
  user_id: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({
    type: Number,
    required: true,
    min: 1,
    max: 5,
  })
  evalute: number;

  @Prop()
  description: string;
}

export const SkillSchema = SchemaFactory.createForClass(Skill);
