import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Mongoose, Types } from 'mongoose';
import { Level } from '../../level/schema/Level.schema';
import { User } from 'src/modules/users/schemas/User.schema';

@Schema()
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

  @Prop({ type: Types.ObjectId, ref: Level.name })
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
