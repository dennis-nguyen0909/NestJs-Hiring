import { BadRequestException, Optional } from '@nestjs/common';
import {
  IsString,
  IsArray,
  IsOptional,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  ArrayNotEmpty,
  IsObject,
  IsNotEmptyObject,
  ValidateNested,
  IsDate,
  ValidateIf,
} from 'class-validator';
import { ProfessionalSkillDTO } from './general-requirement.dto';
import { Types } from 'mongoose';
import { Type } from 'class-transformer';
import { JobSource } from '../job-source.enum';

export class ExternalDataDto {
  @IsOptional()
  @IsString()
  organization?: string;

  @IsOptional()
  @IsString()
  url?: string;

  @IsOptional()
  @IsString()
  company_logo?: string;

  @IsOptional()
  @IsString()
  company_url?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  locations_derived?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  employment_type?: string[];

  @IsOptional()
  @IsString()
  seniority?: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  date_posted?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  date_created?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  date_validthrough?: Date;
}

export class CreateJobDto {
  @ValidateIf((o) => o.source !== JobSource.LINKEDIN)
  @IsMongoId()
  user_id: Types.ObjectId;

  @ValidateIf((o) => o.source !== JobSource.LINKEDIN)
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  // @IsMongoId()
  @IsOptional()
  city_id: Types.ObjectId;

  // @IsMongoId()
  @IsOptional()
  district_id: Types.ObjectId;

  // @IsMongoId()
  @IsOptional()
  ward_id: Types.ObjectId;

  @IsOptional()
  @IsObject()
  @IsNotEmptyObject()
  age_range: { min: number; max: number };

  @IsOptional()
  @IsEnum(['monthly', 'yearly', 'weekly', 'hourly'])
  salary_type?: string;

  // @IsNotEmpty()
  @IsOptional()
  job_contract_type?: Types.ObjectId;

  @IsOptional()
  job_type?: Types.ObjectId;

  @ValidateIf((o) => o.source !== JobSource.LINKEDIN)
  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  @ArrayNotEmpty({ message: 'benefit cannot be empty' })
  benefit: string[];

  @IsOptional()
  // @IsDate()
  time_work?: Date;

  @ValidateIf((o) => o.source !== JobSource.LINKEDIN)
  @IsNotEmpty()
  // @IsMongoId()
  @IsOptional()
  level: Types.ObjectId;

  @IsOptional()
  // @IsDate()
  posted_date?: Date;

  @ValidateIf((o) => o.source !== JobSource.LINKEDIN)
  @IsNotEmpty()
  expire_date?: Date;

  @IsString()
  // @IsMongoId()
  @IsOptional()
  type_money: Types.ObjectId;

  @IsOptional()
  @IsString()
  image?: string;

  @ValidateIf((o) => o.source !== JobSource.LINKEDIN)
  @IsNotEmpty()
  // @IsMongoId()
  @IsOptional()
  degree: Types.ObjectId;

  // @IsNotEmpty()
  // @IsNumber()
  @IsOptional()
  count_apply: number;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  is_negotiable: boolean;

  @ValidateIf((o) => o.source !== JobSource.LINKEDIN)
  @IsNotEmpty()
  @IsArray()
  @ArrayNotEmpty({ message: 'skills cannot be empty' })
  skills: Types.ObjectId[];

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

  @ValidateIf((o) => o.source !== JobSource.LINKEDIN)
  @IsNotEmpty()
  @IsArray()
  @ArrayNotEmpty({ message: 'professional_skills cannot be empty' })
  professional_skills: ProfessionalSkillDTO[];

  @ValidateIf((o) => o.source !== JobSource.LINKEDIN)
  @IsNotEmpty()
  @IsArray()
  @ArrayNotEmpty({ message: 'general_requirements cannot be empty' })
  general_requirements: { requirement: string }[];

  @ValidateIf((o) => o.source !== JobSource.LINKEDIN)
  @IsNotEmpty()
  @IsArray()
  @ArrayNotEmpty({ message: 'job_responsibilities cannot be empty' })
  job_responsibilities: { responsibility: string }[];

  @ValidateIf((o) => o.source !== JobSource.LINKEDIN)
  @IsNotEmpty()
  @IsArray()
  @ArrayNotEmpty({ message: 'interview_process cannot be empty' })
  interview_process: { process: string }[];

  @ValidateIf((o) => o.source !== JobSource.LINKEDIN)
  @IsNotEmpty()
  min_experience: number;

  @ValidateIf((o) => o.source !== JobSource.LINKEDIN)
  @IsNotEmpty()
  @IsArray()
  @ArrayNotEmpty({ message: 'skill_name cannot be empty' })
  skill_name: string[];

  @ValidateIf((o) => o.source !== JobSource.LINKEDIN)
  @IsNotEmpty()
  @IsString()
  company_name: string;

  @IsOptional()
  salary_range_max?: number;

  @IsOptional()
  salary_range_min?: number;

  @IsOptional()
  @IsString()
  city_name?: string;

  @IsOptional()
  @IsString()
  district_name?: string;

  @IsOptional()
  @IsString()
  ward_name?: string;

  @IsOptional()
  @IsString()
  job_contract_type_name?: string;

  @IsOptional()
  @IsString()
  job_type_name?: string;

  @IsOptional()
  @IsString()
  level_name?: string;

  @IsOptional()
  @IsString()
  currency_name?: string;

  @IsOptional()
  @IsString()
  degree_name?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skill_names?: string[];

  @IsOptional()
  @IsString()
  user_name?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  candidate_names?: string[];

  @IsOptional()
  @IsEnum(JobSource)
  source?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => ExternalDataDto)
  external_data?: ExternalDataDto;

  static validateSalaryRange(
    salary_range_min?: number,
    salary_range_max?: number,
  ) {
    if (
      salary_range_min &&
      salary_range_max &&
      salary_range_min >= salary_range_max
    ) {
      throw new BadRequestException(
        'Salary range max must be greater than salary range min',
      );
    }
  }
}
