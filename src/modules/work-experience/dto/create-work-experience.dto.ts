import {
  IsString,
  IsDate,
  IsOptional,
  IsBoolean,
  IsUrl,
  IsNotEmpty,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { IsEndDateAfterStartDate } from 'src/decorator/validate-date.decorator';

export class CreateWorkExperienceDto {
  @IsNotEmpty()
  user_id: string;

  @IsString()
  company: string; // Tên công ty, bắt buộc

  @IsString()
  position: string; // Vị trí công việc, bắt buộc

  @IsOptional()
  @IsDateString()
  start_date: Date;

  @IsOptional()
  @IsDateString()
  @IsEndDateAfterStartDate('start_date', {
    message: 'end_date_must_be_bigger_than_start_date',
  })
  end_date: Date;

  @IsOptional()
  @IsBoolean()
  currently_working?: boolean; // Có đang làm việc tại công ty này không, mặc định có thể là false

  @IsOptional()
  @IsString()
  description?: string; // Mô tả công việc, có thể bỏ qua

  @IsOptional()
  @IsUrl()
  image_url?: string; // URL của hình ảnh công ty hoặc liên quan, có thể bỏ qua
}
