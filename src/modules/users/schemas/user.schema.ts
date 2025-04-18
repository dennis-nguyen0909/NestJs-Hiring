import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Job, JobModel } from '../../job/schema/Job.schema'; // Nhớ import Job schema
import { Role } from '../../role/schema/Role.schema';
import { AuthProvider } from '../../auth-provider/schema/AuthProvider.schema';
import { CV } from '../../cv/schema/CV.schema';
import { Organization } from 'src/modules/organization/schema/organization.schema';
import { Skill } from 'src/modules/skill/schema/Skill.schema';
import { Prize } from 'src/modules/prize/schema/prize.schema';
import { Course } from 'src/modules/course/schema/course.schema';
import { Project } from 'src/modules/project/schema/project.schema';
import { FavoriteJob } from 'src/modules/favorite-job/schema/favorite-job.schema';
import { SocialLink } from 'src/modules/social_link/schema/social_link.schema';

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
  birthday: Date;
  @Prop()
  port_folio: string;
  @Prop({ type: Types.ObjectId, ref: 'Role', default: null })
  role: Role; // Phân biệt người dùng qua role (ADMIN, USERS, EMPLOYER, ...)
  @Prop({ type: Types.ObjectId, default: 'LOCAL', ref: AuthProvider.name })
  account_type: Types.ObjectId;

  @Prop({ type: [Types.ObjectId], ref: User.name })
  viewer: Types.ObjectId[];
  @Prop()
  token_expiry: Date;

  @Prop({ default: false })
  is_active: boolean;

  @Prop({ default: false })
  toggle_dashboard: boolean;

  @Prop({ default: false })
  toggle_filter: boolean;

  @Prop({ default: false })
  is_search_jobs_status: boolean;

  @Prop({ default: false })
  is_suggestion_job: boolean;

  @Prop({ type: Types.ObjectId, ref: 'Cities' })
  city_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'District' })
  district_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Ward' })
  ward_id: Types.ObjectId;
  @Prop()
  code_id: string;

  @Prop()
  code_expired: Date;

  @Prop({ type: [Types.ObjectId], ref: AuthProvider.name })
  auth_providers: Types.ObjectId[];

  @Prop([String])
  save_job_ids: string[];

  // @Prop({ type: [Types.ObjectId], ref: 'CV' })
  // cv_ids: CV[];

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

  @Prop({ type: [Types.ObjectId], ref: Job.name, required: false })
  jobs_ids?: Types.ObjectId[];

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
  @Prop({ type: [Types.ObjectId], ref: SocialLink.name })
  social_links: Types.ObjectId[];

  @Prop({ type: Types.ObjectId, ref: 'CV', required: false })
  primary_cv_id: CV;

  @Prop({
    type: {
      company_info: { type: Boolean, default: false },
      founding_info: { type: Boolean, default: false },
      social_info: { type: Boolean, default: false },
      contact: { type: Boolean, default: false },
    },
    required: false,
    default: {
      company_info: false,
      founding_info: false,
      social_info: false,
      contact: false,
    },
  })
  progress_setup: {
    company_info: boolean;
    founding_info: boolean;
    social_info: boolean;
    contact: boolean;
  };

  @Prop({ default: false })
  is_profile_privacy: boolean;
  @Prop({ default: false })
  is_resume_privacy: boolean;
  @Prop({ default: false })
  notification_when_employer_save_profile: boolean;
  @Prop({ default: false })
  notification_when_employer_reject_cv: boolean;
  @Prop()
  otpCode: string;
  @Prop()
  otpExpiry: Date;
  @Prop({ default: 0, required: false })
  otpAttempts: number;
  @Prop()
  lastOtpSentAt: Date;
  @Prop({ default: false })
  isOtpVerified: boolean;
  @Prop()
  otpVerifiedAt: Date;
  @Prop({ default: false })
  isRememberAccount: boolean;

  @Prop({ default: 'DD/MM/YYYY' })
  dateFormat: string;

  @Prop({ required: false })
  name_city?: string;
  @Prop({ required: false })
  name_district?: string;
  @Prop({ required: false })
  name_ward?: string;

  @Prop({ type: [Types.ObjectId], ref: Job.name, default: [] })
  viewed_jobs: Types.ObjectId[];

  @Prop()
  role_name: string;

  @Prop({ default: 10 })
  maximum_cv: number;
}

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.index({ email: 1 }); // Tạo chỉ mục cho 'email'
UserSchema.index({ city_id: 1 }); // Tạo chỉ mục cho 'city_id'

// Tạo chỉ mục kết hợp cho 'city_id', 'district_id' và 'ward_id' nếu cần
UserSchema.index({ city_id: 1, district_id: 1, ward_id: 1 });

UserSchema.pre('findOneAndDelete', async function (next) {
  console.log('Middleware findOneAndDelete called');

  const userId = this.getQuery()['_id'];
  if (!userId) {
    return next(new Error('User ID not found'));
  }

  await JobModel.deleteMany({ user_id: new Types.ObjectId(userId.toString()) });
  console.log(`Deleted jobs for user: ${userId}`);

  next();
});
