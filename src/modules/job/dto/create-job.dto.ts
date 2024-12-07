import { Optional } from '@nestjs/common';
import {
  IsString,
  IsArray,
  IsOptional,
  IsEnum,
  IsDate,
  IsMongoId,
} from 'class-validator';
import { ProfessionalSkillDTO } from './general-requirement.dto';

export class CreateJobDto {
  @IsMongoId()
  user_id: string;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  require_experience?: string[];

  @IsOptional()
  @IsMongoId()
  city_id?: string;

  @IsOptional()
  @IsMongoId()
  district_id?: string;

  @IsOptional()
  @IsMongoId()
  ward_id?: string;

  @IsOptional()
  salary_range?: { min: number; max: number };

  @IsOptional()
  age_range?: { min: number; max: number };
  @IsOptional()
  @IsEnum(['monthly', 'yearly', 'weekly', 'hourly'])
  salary_type?: string;

  @IsOptional()
  job_contract_type?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  benefit?: string[];

  @IsOptional()
  @IsDate()
  time_work?: Date;

  @IsOptional()
  // @IsMongoId()
  level?: string;

  @IsOptional()
  @IsDate()
  posted_date?: Date;

  @IsOptional()
  // @IsDate()
  expire_date?: Date;

  @IsOptional()
  @IsString()
  type_money?: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  degree?: string;

  @IsOptional()
  count_apply?: number;

  @IsOptional()
  @IsString()
  address?: string;
  @IsOptional()
  is_negotiable: boolean;

  @IsOptional()
  @IsArray()
  skills?: string[];

  @Optional()
  is_active: boolean;

  @Optional()
  is_expired: boolean;

  @IsOptional()
  apply_linkedin?: string;

  @IsOptional()
  apply_website?: string;

  @IsOptional()
  apply_email?: string;

  @IsOptional()
  professional_skills?: ProfessionalSkillDTO[];
  @IsOptional()
  general_requirements?: { requirement: string }[];
  @IsOptional()
  job_responsibilities?: { responsibility: string }[];
  @IsOptional()
  interview_process?: { process: string }[];

  @IsOptional()
  job_type: string;
  @IsOptional()
  min_experience?: number;
}
