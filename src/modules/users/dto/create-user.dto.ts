import {
  IsString,
  IsEmail,
  IsOptional,
  IsBoolean,
  IsArray,
  IsNumber,
  IsIn,
  IsMongoId,
  IsNotEmpty,
} from 'class-validator';
import { Types } from 'mongoose';
import { AuthProvider } from '../../auth-provider/schema/AuthProvider.schema';
import { Job } from '../../job/schema/Job.schema';
import { Prop } from '@nestjs/mongoose';
export class ProgressSetupDTO {
  @IsOptional()
  @IsBoolean()
  company_info?: boolean;

  @IsOptional()
  @IsBoolean()
  founding_info?: boolean;

  @IsOptional()
  @IsBoolean()
  social_info?: boolean;

  @IsOptional()
  @IsBoolean()
  contact?: boolean;
}
export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  full_name: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsOptional()
  @IsString()
  background?: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsNumber()
  @IsIn([0, 1, 2]) // 0: Nam, 1: Nữ, 2: Không xác định
  gender?: number;

  // @IsMongoId()
  @IsNotEmpty()
  role: string;

  @IsOptional()
  @IsString()
  account_type?: string;

  @IsOptional()
  token_expiry?: Date;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @IsOptional()
  @IsBoolean()
  is_search_jobs_status?: boolean;

  @IsOptional()
  @IsString()
  code_id?: string;

  @IsOptional()
  code_expired?: Date;

  @IsOptional()
  @IsArray()
  auth_providers?: AuthProvider[];

  @IsOptional()
  @IsArray()
  save_job_ids?: string[];

  @IsOptional()
  @IsArray()
  cvs?: Types.ObjectId[];

  // Các thuộc tính dành cho Employer
  @IsOptional()
  @IsString()
  company_name?: string;

  @IsOptional()
  @IsString()
  website?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsArray()
  jobs_ids?: Job[];

  @IsOptional()
  @IsString()
  description?: string;
  @IsOptional()
  no_experience: boolean;
  @IsOptional()
  total_experience_months: number;
  @IsOptional()
  total_experience_years: number;

  @IsOptional()
  avatar_company?: string;
  @IsOptional()
  banner_company?: string;

  @IsOptional()
  toggle_dashboard?: boolean;

  @IsOptional()
  @IsMongoId()
  primary_cv_id?: string;
  @IsOptional()
  progress_setup: ProgressSetupDTO;

  @IsOptional()
  social_links: Types.ObjectId[];

  @IsOptional()
  @IsBoolean()
  is_suggestion_job?: boolean;
  @IsOptional()
  authProvider?: string;
  @IsOptional()
  birthday: string;
  @IsOptional()
  viewer: Types.ObjectId[];

  @IsOptional()
  is_profile_privacy: boolean;
  @IsOptional()
  is_resume_privacy: boolean;
  @IsOptional()
  notification_when_employer_save_profile: boolean;
  @IsOptional()
  notification_when_employer_reject_cv: boolean;
}
