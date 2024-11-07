import { IsString, IsEmail, IsOptional, IsBoolean, IsArray } from 'class-validator';
import { Types } from 'mongoose';
import { Role } from '../../role/schema/Role.schema';
import { AuthProvider } from '../../auth-provider/schema/AuthProvider.schema';
import { Job } from '../../job/schema/Job.schema';

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
  password: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  gender?: string;

  @IsOptional()
  role?: string;

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
}
