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
import { JobSource } from '../job-source.enum';

@Schema({ timestamps: true })
export class Job extends Document {
  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: function () {
      return this.source !== JobSource.LINKEDIN;
    },
    field: 'user_name',
  })
  user_id: Types.ObjectId;

  @Prop({
    required: function () {
      return this.source !== JobSource.LINKEDIN;
    },
  })
  title: string;

  @Prop()
  description: string;

  @Prop()
  address: string;

  @Prop({ type: Types.ObjectId, ref: 'Cities', field: 'city_name' })
  city_id: Cities;

  @Prop({ type: Types.ObjectId, ref: 'District', field: 'district_name' })
  district_id: District;

  @Prop({ type: Types.ObjectId, ref: 'Ward', field: 'ward_name' })
  ward_id: Ward;

  @Prop({ type: Map, of: Number })
  age_range: { min: number; max: number };

  @Prop({
    type: String,
    enum: ['monthly', 'yearly', 'weekly', 'hourly'],
    default: 'monthly',
  })
  salary_type: string;

  @Prop({
    type: Types.ObjectId,
    ref: JobContractType.name,
    field: 'job_contract_type_name',
  })
  job_contract_type: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: JobType.name, field: 'job_type_name' })
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

  @Prop({
    required: function () {
      return this.source !== JobSource.LINKEDIN;
    },
  })
  skill_name: string[];

  @Prop({
    required: function () {
      return this.source !== JobSource.LINKEDIN;
    },
  })
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

  @Prop({ type: Types.ObjectId, ref: Level.name, field: 'level_name' })
  level: Types.ObjectId;

  @Prop({ type: Date, default: Date.now })
  posted_date: Date;

  @Prop({ type: Date })
  expire_date: Date;

  @Prop({ type: Types.ObjectId, ref: Currency.name, field: 'currency_name' })
  type_money: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: DegreeType.name,
    field: 'degree_name',
  })
  degree: Types.ObjectId;

  @Prop()
  count_apply: number;

  @Prop()
  is_negotiable: boolean;

  @Prop({
    type: [Types.ObjectId],
    ref: SkillEmployer.name,
    field: 'skill_names',
  })
  skills: Types.ObjectId[];

  @Prop({ default: true })
  is_active: boolean;

  @Prop({ default: false })
  is_expired: boolean;

  @Prop({
    type: [Types.ObjectId],
    ref: 'User',
    field: 'candidate_names',
  })
  candidate_ids: Types.ObjectId[];

  @Prop({ type: String, default: '' })
  apply_linkedin: string;

  @Prop({ type: String, default: '' })
  apply_website: string;

  @Prop({ type: String, default: '' })
  apply_email: string;

  @Prop({ type: Number, default: 0 })
  salary_range_max: number;

  @Prop({ type: Number, default: 0 })
  salary_range_min: number;

  @Prop({
    type: String,
    enum: JobSource,
    default: JobSource.INTERNAL,
  })
  source: string;

  @Prop({ type: Object })
  external_data: {
    id?: string;
    date_posted?: Date;
    date_created?: Date;
    date_validthrough?: Date;
    organization?: string;
    organization_url?: string;
    organization_logo?: string;
    url?: string;
    source_type?: string;
    source_domain?: string;
    employment_type?: string[];
    locations_raw?: {
      '@type': string;
      address: {
        '@type': string;
        addressCountry: string;
        addressLocality: string;
        addressRegion: string;
        streetAddress: string | null;
        latitude: number;
        longitude: number;
      };
    }[];
    cities_derived?: string[];
    regions_derived?: string[];
    countries_derived?: string[];
    locations_derived?: string[];
    timezones_derived?: string[];
    lats_derived?: number[];
    lngs_derived?: number[];
    remote_derived?: boolean;
    linkedin_org_employees?: number;
    linkedin_org_url?: string;
    linkedin_org_size?: string;
    linkedin_org_slogan?: string;
    linkedin_org_industry?: string;
    linkedin_org_followers?: number;
    linkedin_org_headquarters?: string;
    linkedin_org_type?: string;
    linkedin_org_foundeddate?: string;
    linkedin_org_specialties?: string[];
    linkedin_org_locations?: string[];
    linkedin_org_description?: string;
    linkedin_org_recruitment_agency_derived?: boolean;
    seniority?: string;
    directapply?: boolean;
    linkedin_org_slug?: string;
  };
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
