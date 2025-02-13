import { PartialType } from '@nestjs/mapped-types';
import { CreateJobDto } from './create-job.dto';
import { IsBoolean, IsOptional } from 'class-validator';
import { ObjectId, Types } from 'mongoose';
import { Transform } from 'class-transformer';

export class UpdateJobDto extends PartialType(CreateJobDto) {
  @IsOptional() // Nếu không bắt buộc
  @IsBoolean() // Kiểm tra kiểu boolean
  is_active?: boolean;

  @IsOptional()
  candidate_ids?: Types.ObjectId[];

  @IsOptional()
  is_expired?: boolean;

  @IsOptional()
  apply_linkedin?: string;
  @IsOptional()
  apply_website?: string;
  @IsOptional()
  apply_email?: string;

  @IsOptional()
  skills?: Types.ObjectId[];
  @IsOptional()
  job_responsibilities: { responsibility: string }[];
}
