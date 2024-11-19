import {
  IsString,
  IsDate,
  IsOptional,
  IsBoolean,
  IsUrl,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateWorkExperienceDto {
  @IsNotEmpty()
  user_id: string;

  @IsString()
  company: string; // Tên công ty, bắt buộc

  @IsString()
  position: string; // Vị trí công việc, bắt buộc

  @IsOptional()
  @IsDate()
  @Type(() => Date) // Chuyển đổi từ chuỗi thành Date
  start_date?: Date; // Ngày bắt đầu công việc, có thể bỏ qua nếu không cung cấp

  @IsOptional()
  @IsDate()
  @Type(() => Date) // Chuyển đổi từ chuỗi thành Date
  end_date?: Date; // Ngày kết thúc công việc, có thể bỏ qua nếu không cung cấp

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
