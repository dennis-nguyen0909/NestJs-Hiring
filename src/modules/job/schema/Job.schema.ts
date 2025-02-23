import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Types } from 'mongoose';
import { Level } from '../../level/schema/Level.schema';
import { District } from 'src/modules/districts/schema/District.schema';
import { Ward } from 'src/modules/wards/schema/Wards.schema';
import { Cities } from 'src/modules/cities/schema/Cities.schema';
import { SkillEmployer } from 'src/modules/skill_employer/schema/EmployerSkill.schema';
import { JobType } from 'src/modules/job-type/schema/JobType.schema';
import { JobContractType } from 'src/modules/job-contract-type/schema/job-contract-type.schema';
import { Currency } from 'src/modules/currencies/schema/currencies.schema';
import { DegreeType } from 'src/modules/degree-type/schema/degree-type.schema';

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
    type: Types.ObjectId,
    ref: JobContractType.name,
  })
  job_contract_type: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: JobType.name })
  job_type: Types.ObjectId;

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

  @Prop({ required: true })
  skill_name: string[];

  @Prop({ required: true })
  company_name: string;

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

  @Prop({ type: Types.ObjectId, ref: Level.name })
  level: Types.ObjectId;

  @Prop({ type: Date, default: Date.now })
  posted_date: Date;

  @Prop({ type: Date })
  expire_date: Date;

  @Prop({ type: Types.ObjectId, ref: Currency.name })
  type_money: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: DegreeType.name,
  })
  degree: Types.ObjectId;

  @Prop()
  count_apply: number;

  @Prop()
  is_negotiable: boolean;

  @Prop({
    type: [Types.ObjectId],
    ref: SkillEmployer.name,
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
export const JobModel = mongoose.model('Job', JobSchema);

// Chỉ mục văn bản cho các trường liên quan đến tìm kiếm bằng từ khóa
JobSchema.index({
  title: 'text',
  company_name: 'text',
  skill_name: 'text',
});
JobSchema.index({ title: 1, company_name: 1 });
JobSchema.index({ title: 1, company_name: 1, skill_name: 1 });
JobSchema.index({ skill_name: 1, title: 1, company_name: 1 });

// Chỉ mục riêng cho các trường thường dùng trong lọc
JobSchema.index({ job_type: 1 });
JobSchema.index({ job_contract_type: 1 });
JobSchema.index({ city_id: 1 });
JobSchema.index({ district_id: 1 });
JobSchema.index({ skills: 1 });
JobSchema.index({ title: 1 });
JobSchema.index({ company_name: 1 });
JobSchema.index({ skill_name: 1 });
JobSchema.index({ createdAt: 1 }); // Chỉ mục cho sắp xếp theo ngày tạo

// Kết hợp các trường lọc thường dùng chung trong truy vấn để tối ưu hiệu suất
JobSchema.index({ job_type: 1, city_id: 1 });
JobSchema.index({ job_type: 1, job_contract_type: 1 });
