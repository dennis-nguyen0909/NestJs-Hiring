import { Optional } from '@nestjs/common';
import {
  IsString,
  IsArray,
  IsOptional,
  IsEnum,
  IsDate,
  IsNumber,
  IsMongoId,
} from 'class-validator';

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
  @IsString({ each: true })
  requirement?: string[];

  @IsOptional()
  @IsString()
  location?: string;

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
  @IsEnum(['monthly', 'yearly', 'weekly', 'hourly'])
  salary_type?: string;

  @IsOptional()
  @IsEnum([
    'fulltime',
    'parttime',
    'freelance',
    'contract',
    'project',
    'hourly',
  ])
  job_type?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  benefit?: string[];

  @IsOptional()
  @IsDate()
  time_work?: Date;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  require_experience?: string[];

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
  @IsEnum(['Bachelor', 'Master', 'PhD', 'None'])
  degree?: string;

  @IsOptional()
  @IsNumber()
  count_apply?: number;

  @IsOptional()
  @IsString()
  address?: string;
  @IsOptional()
  is_negotiable: boolean;

  @IsOptional()
  @IsArray()
  skills: string[];

  @Optional()
  is_active: boolean;
}
