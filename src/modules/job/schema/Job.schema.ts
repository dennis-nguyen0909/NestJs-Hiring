import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Level } from '../../level/schema/Level.schema';
import { District } from 'src/modules/districts/schema/District.schema';
import { Ward } from 'src/modules/wards/schema/Wards.schema';
import { Cities } from 'src/modules/cities/schema/Cities.schema';
import { IsArray, IsOptional } from 'class-validator';

@Schema({ timestamps: true })
export class Job extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user_id: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop()
  address: string;

  @Prop({ type: Types.ObjectId, ref: 'Cities' })
  city_id: Cities;

  @Prop({ type: Types.ObjectId, ref: 'District' })
  district_id: District;

  @Prop({ type: Types.ObjectId, ref: 'Ward' })
  ward_id: Ward;

  @Prop({ type: Map, of: Number })
  salary_range: { min: number; max: number };
  @Prop({ type: Map, of: Number })
  age_range?: { min: number; max: number };

  @Prop({
    type: String,
    enum: ['monthly', 'yearly', 'weekly', 'hourly'],
    default: 'monthly',
  })
  salary_type: string;

  @Prop({
    type: String,
    enum: [
      'fulltime',
      'parttime',
      'freelance',
      'contract',
      'project',
      'hourly',
    ],
    default: 'fulltime',
  })
  job_type: string;

  @Prop()
  type_of_work: string;

  @Prop()
  min_experience: string;
  @Prop({
    type: [
      {
        title: { type: String, required: true },
        items: { type: [String], required: true },
      },
    ],
    default: [],
  })
  professional_skills: { title: string; items: string[] }[];
  @Prop()
  general_requirements: { requirement: string }[];
  @Prop()
  job_responsibilities: { responsibility: string }[];
  @Prop()
  interview_process: { process: string }[];
  @Prop([String])
  benefit: string[];

  @Prop()
  time_work: Date;

  @Prop()
  require_experience: string[];

  @Prop({ type: Types.ObjectId, ref: 'Level' })
  level: Types.ObjectId;

  @Prop({ type: Date, default: Date.now })
  posted_date: Date;

  @Prop({ type: Date })
  expire_date: Date;

  @Prop({ type: String })
  type_money: string;

  @Prop({
    type: String,
    enum: ['Bachelor', 'Master', 'PhD', 'None'],
    default: 'None',
  })
  degree: string;

  @Prop()
  count_apply: number;

  @Prop()
  is_negotiable: boolean;

  @Prop({
    type: [Types.ObjectId],
    ref: 'SkillEmployer',
  })
  skills: Types.ObjectId[];

  @Prop({ default: true })
  is_active: boolean;

  @Prop({ default: false })
  is_expired: boolean;

  @Prop({
    type: [Types.ObjectId],
    ref: 'User',
  })
  candidate_ids: Types.ObjectId[];

  // New fields for job application methods
  @Prop({ type: String, default: '' })
  apply_linkedin: string;

  @Prop({ type: String, default: '' })
  apply_website: string;

  @Prop({ type: String, default: '' })
  apply_email: string;
}

export const JobSchema = SchemaFactory.createForClass(Job);
