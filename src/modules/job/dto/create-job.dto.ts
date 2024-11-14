import {
  IsString,
  IsOptional,
  IsNotEmpty,
  IsDate,
  IsArray,
  IsObject,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Types } from 'mongoose';

export class SalaryRangeDto {
  @IsNotEmpty()
  min: number;

  @IsNotEmpty()
  max: number;
}

export class CreateJobDto {
  @IsNotEmpty()
  @IsString()
  user_id: string; // Mã định danh cho Employer (Nhà tuyển dụng)

  @IsNotEmpty()
  @IsString()
  title: string; // Tên công việc

  @IsString()
  description: string; // Mô tả công việc

  @IsString()
  requirement: string; // Yêu cầu công việc

  @IsString()
  location: string; // Địa điểm làm việc

  @IsObject()
  @ValidateNested()
  @Type(() => SalaryRangeDto)
  salary_range: SalaryRangeDto; // Khoảng lương

  @IsArray()
  @IsString({ each: true })
  benefit: string[]; // Các lợi ích

  @IsDate()
  @Type(() => Date)
  time_work: Date; // Thời gian làm việc

  @IsString()
  require_experience: string; // Yêu cầu kinh nghiệm

  @IsString()
  level: Types.ObjectId; // Trình độ (Level)

  @IsDate()
  @Type(() => Date)
  posted_date: Date; // Ngày đăng tuyển

  @IsDate()
  @Type(() => Date)
  expire_date: Date; // Ngày hết hạn tuyển dụng

  cities_id: string;
}
