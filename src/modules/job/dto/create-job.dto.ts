import { BadRequestException, Optional } from '@nestjs/common';
import {
  IsString,
  IsArray,
  IsOptional,
  IsEnum,
  IsDate,
  IsMongoId,
  IsNotEmpty,
  ArrayNotEmpty,
  IsObject,
  IsNotEmptyObject,
  IsNumber,
} from 'class-validator';
import { ProfessionalSkillDTO } from './general-requirement.dto';
import { Types } from 'mongoose';

export class CreateJobDto {
  @IsMongoId()
  user_id: Types.ObjectId;

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

  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  @ArrayNotEmpty({ message: 'benefit cannot be empty' })
  benefit: string[];

  @IsOptional()
  // @IsDate()
  time_work?: Date;

  @IsNotEmpty()
  // @IsMongoId()
  @IsOptional()
  level: Types.ObjectId;

  @IsOptional()
  // @IsDate()
  posted_date?: Date;

  @IsNotEmpty()
  // @IsDate()
  expire_date?: Date;

  @IsString()
  // @IsMongoId()
  @IsOptional()
  type_money: Types.ObjectId;

  @IsOptional()
  @IsString()
  image?: string;

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

  @IsNotEmpty()
  @IsArray()
  @ArrayNotEmpty({ message: 'professional_skills cannot be empty' })
  professional_skills: ProfessionalSkillDTO[];
  @IsNotEmpty()
  @IsArray()
  @ArrayNotEmpty({ message: 'general_requirements cannot be empty' })
  general_requirements: { requirement: string }[];
  @IsNotEmpty()
  @IsArray()
  @ArrayNotEmpty({ message: 'job_responsibilities cannot be empty' })
  job_responsibilities: { responsibility: string }[];
  @IsNotEmpty()
  @IsArray()
  @ArrayNotEmpty({ message: 'interview_process cannot be empty' })
  interview_process: { process: string }[];

  @IsNotEmpty()
  job_type: string;
  @IsNotEmpty()
  min_experience: number;

  @IsNotEmpty()
  @IsArray()
  @ArrayNotEmpty({ message: 'skill_name cannot be empty' })
  skill_name: string[];

  @IsNotEmpty()
  @IsString()
  company_name: string;

  @IsOptional()
  salary_range_max?: number;
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
  @IsOptional()
  salary_range_min?: number;
}
