import { PartialType } from '@nestjs/mapped-types';
import {
  IsOptional,
  IsBoolean,
  IsString,
  IsArray,
  ArrayNotEmpty,
  IsMongoId,
  IsNumber,
  IsDate,
  IsEnum,
  IsObject,
  IsNotEmptyObject,
} from 'class-validator';
import { Types } from 'mongoose';
import { CreateJobDto } from './create-job.dto';
import { BadRequestException } from '@nestjs/common';

export class UpdateJobDto extends PartialType(CreateJobDto) {
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  candidate_ids?: Types.ObjectId[];

  @IsOptional()
  @IsBoolean()
  is_expired?: boolean;

  @IsOptional()
  @IsString()
  apply_linkedin?: string;

  @IsOptional()
  @IsString()
  apply_website?: string;

  @IsOptional()
  @IsString()
  apply_email?: string;

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty({ message: 'skills cannot be empty' })
  @IsMongoId({ each: true })
  skills?: Types.ObjectId[];

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty({ message: 'job_responsibilities cannot be empty' })
  job_responsibilities?: { responsibility: string }[];

  @IsOptional()
  @IsNumber()
  salary_range_max?: number;

  @IsOptional()
  @IsNumber()
  salary_range_min?: number;

  @IsOptional()
  @IsString()
  company_name?: string;

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty({ message: 'general_requirements cannot be empty' })
  general_requirements?: { requirement: string }[];

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty({ message: 'interview_process cannot be empty' })
  interview_process?: { process: string }[];

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty({ message: 'skill_name cannot be empty' })
  skill_name?: string[];

  @IsOptional()
  @IsNumber()
  min_experience: number;

  @IsOptional()
  @IsMongoId()
  job_contract_type?: Types.ObjectId;

  @IsOptional()
  @IsEnum(['monthly', 'yearly', 'weekly', 'hourly'])
  salary_type?: string;

  @IsOptional()
  @IsObject()
  @IsNotEmptyObject()
  age_range?: { min: number; max: number };

  @IsOptional()
  expire_date?: Date;

  @IsOptional()
  @IsMongoId()
  level?: Types.ObjectId;

  @IsOptional()
  @IsMongoId()
  type_money?: Types.ObjectId;

  @IsOptional()
  @IsMongoId()
  degree?: Types.ObjectId;

  @IsOptional()
  @IsDate()
  time_work?: Date;

  @IsOptional()
  @IsNumber()
  count_apply?: number;

  @IsOptional()
  @IsString()
  address?: string;
}
