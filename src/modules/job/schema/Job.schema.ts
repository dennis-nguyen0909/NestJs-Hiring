import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Level } from '../../level/schema/Level.schema';

@Schema({ timestamps: true })
export class Job extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user_id: string;

  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop()
  requirement: string;

  @Prop()
  location: string;

  @Prop({ type: Map, of: Number })
  salary_range: { min: number; max: number };

  @Prop([String])
  benefit: string[];

  @Prop()
  time_work: Date;

  @Prop()
  require_experience: string;

  @Prop({ type: Types.ObjectId, ref: 'Level', required: true })
  level: Level;

  @Prop({ type: Date })
  posted_date: Date;

  @Prop({ type: Date })
  expire_date: Date;

  @Prop({ type: String })
  type_money: string;

  @Prop({ type: String, default: '' })
  image: string;
}

export const JobSchema = SchemaFactory.createForClass(Job);
