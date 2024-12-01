import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Job } from '../../job/schema/Job.schema'; // Nhớ import Job schema
import { Role } from '../../role/schema/Role.schema';
import { AuthProvider } from '../../auth-provider/schema/AuthProvider.schema';
import { CV } from '../../cv/schema/CV.schema';
import { Organization } from 'src/modules/organization/schema/organization.schema';
import { Skill } from 'src/modules/skill/schema/Skill.schema';
import { Prize } from 'src/modules/prize/schema/prize.schema';
import { Course } from 'src/modules/course/schema/course.schema';
import { Project } from 'src/modules/project/schema/project.schema';
import { Cities } from 'src/modules/cities/schema/Cities.schema';
import { District } from 'src/modules/districts/schema/District.schema';
import { Ward } from 'src/modules/wards/schema/Wards.schema';
import { FavoriteJob } from 'src/modules/favorite-job/schema/favorite-job.schema';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  full_name: string;

  @Prop({ default: '', unique: false, sparse: true })
  phone: string;

  @Prop()
  avatar: string;

  @Prop()
  background: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: '' })
  address: string;

  @Prop()
  introduce: string;
  @Prop({ type: Number, enum: [0, 1, 2], default: 2 })
  gender: number;
  @Prop()
  port_folio: string;
  @Prop({ type: Types.ObjectId, ref: 'Role', default: null })
  role: Role; // Phân biệt người dùng qua role (ADMIN, USERS, EMPLOYER, ...)
  @Prop({ default: 'LOCAL' })
  account_type: string;

  @Prop()
  token_expiry: Date;

  @Prop({ default: false })
  is_active: boolean;

  @Prop({ default: false })
  toggle_dashboard: boolean;

  @Prop({ default: false })
  is_search_jobs_status: boolean;
  @Prop({ type: Types.ObjectId, ref: 'Cities' })
  city_id: Cities;

  @Prop({ type: Types.ObjectId, ref: 'District' })
  district_id: District;

  @Prop({ type: Types.ObjectId, ref: 'Ward' })
  ward_id: Ward;
  @Prop()
  code_id: string;

  @Prop()
  code_expired: Date;

  @Prop({ type: [Types.ObjectId], ref: AuthProvider.name })
  auth_providers: AuthProvider[];

  @Prop([String])
  save_job_ids: string[];

  @Prop({ type: [Types.ObjectId], ref: 'CV' })
  cv_ids: CV[];

  @Prop({ type: [Types.ObjectId], ref: 'Education' })
  education_ids: Types.ObjectId[];

  @Prop({ type: [Types.ObjectId], ref: FavoriteJob.name })
  favorite_jobs: Types.ObjectId[];

  @Prop({ type: [Types.ObjectId], ref: Skill.name })
  skills: Types.ObjectId[];

  @Prop({ type: [Types.ObjectId], ref: 'Certificate' })
  certificates: Types.ObjectId[];

  @Prop({ type: [Types.ObjectId], ref: Prize.name })
  prizes: Types.ObjectId[];

  @Prop({ type: [Types.ObjectId], ref: Course.name })
  courses: Types.ObjectId[];
  @Prop({ type: [Types.ObjectId], ref: CV.name })
  cvs: Types.ObjectId[];

  @Prop({ type: [Types.ObjectId], ref: Project.name })
  projects: Types.ObjectId[];

  @Prop({ type: [Types.ObjectId], ref: 'WorkExperience' })
  work_experience_ids: Types.ObjectId[];

  @Prop({ required: false })
  total_experience?: string;
  @Prop()
  experience_string: string;
  @Prop()
  no_experience: boolean;
  @Prop()
  total_experience_months: number;
  @Prop()
  total_experience_years: number;

  // Các thuộc tính dành cho Employer (Nhà tuyển dụng)
  @Prop({ required: false })
  company_name?: string;

  @Prop({ required: false })
  website?: string;

  @Prop({ required: false })
  location?: string;

  @Prop([{ type: Types.ObjectId, ref: Job.name, required: false }])
  jobs_ids?: Job[];

  @Prop({ required: false })
  description?: string;

  @Prop({ required: false })
  avatar_company?: string;

  @Prop({ required: false })
  banner_company?: string;

  @Prop({
    type: Types.ObjectId,
    ref: Organization.name,
    unique: true,
    sparse: true,
  })
  organization: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'CV', required: false })
  primary_cv_id: CV;
}

export const UserSchema = SchemaFactory.createForClass(User);
