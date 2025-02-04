import { Optional } from '@nestjs/common';
import {
  IsString,
  IsArray,
  IsOptional,
  IsEnum,
  IsDate,
  IsMongoId,
  Validate,
} from 'class-validator';
import { ProfessionalSkillDTO } from './general-requirement.dto';
import { ObjectId, Types } from 'mongoose';
import { Transform } from 'class-transformer';

export class CreateJobDto {
  @IsMongoId()
  user_id: Types.ObjectId;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  require_experience?: string[];


  @IsMongoId()
  city_id?: Types.ObjectId;

  @IsMongoId()
  district_id?: Types.ObjectId;

  @IsMongoId()
  ward_id?: Types.ObjectId;

  @IsOptional()
  salary_range?: { min: number; max: number };

  @IsOptional()
  age_range?: { min: number; max: number };
  @IsOptional()
  @IsEnum(['monthly', 'yearly', 'weekly', 'hourly'])
  salary_type?: string;

  @IsOptional()
  job_contract_type?: Types.ObjectId;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  benefit?: string[];

  @IsOptional()
  @IsDate()
  time_work?: Date;

  @IsOptional()
  // @IsMongoId()
  level?: Types.ObjectId;

  @IsOptional()
  @IsDate()
  posted_date?: Date;

  @IsOptional()
  // @IsDate()
  expire_date?: Date;

  @IsOptional()
  @IsString()
  type_money?: Types.ObjectId;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  degree?: Types.ObjectId;

  @IsOptional()
  count_apply?: number;

  @IsOptional()
  @IsString()
  address?: string;
  @IsOptional()
  is_negotiable: boolean;

  @IsOptional()
  @IsArray()
  skills?: Types.ObjectId[];

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
