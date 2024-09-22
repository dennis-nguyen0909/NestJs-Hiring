import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Skill extends Document {
  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;
}

export const SkillSchema = SchemaFactory.createForClass(Skill);
