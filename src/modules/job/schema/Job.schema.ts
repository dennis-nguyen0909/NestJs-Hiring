import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Employer } from '../../employer/schema/Employer.schema';
import { Level } from '../../level/schema/Level.schema';

@Schema()
export class Job extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Employer', required: true })
  employer: Employer;

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
}

export const JobSchema = SchemaFactory.createForClass(Job);
