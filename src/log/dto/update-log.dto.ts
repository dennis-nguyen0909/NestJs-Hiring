import { IsString, IsOptional, IsMongoId, IsObject, IsNotEmpty } from 'class-validator';
import { Types } from 'mongoose';
export class UpdateLogDto {
  @IsMongoId()
  @IsOptional()
  userId?: Types.ObjectId; // ID người dùng (có thể không bắt buộc)

  @IsString()
  @IsOptional()
  action?: string; // Hành động

  @IsString()
  @IsOptional()
  entityId?: string; // ID của entity bị thay đổi

  @IsString()
  @IsOptional()
  entityCollection?: string; // Tên collection mà entity nằm trong

  @IsString()
  @IsOptional()
  description?: string; // Mô tả thêm về hành động

  @IsString()
  @IsOptional()
  ipAddress?: string; // Địa chỉ IP của người dùng

  @IsOptional()
  deviceInfo?: {
    os: {
      name: string;
      version: string;
    };
    device: {
      model: string;
      type: string;
      vendor: string;
    };
    browser: {
      name: string;
      version: string;
    };
    engine: {
      name: string;
      version: string;
    };
  }; // Thông tin thiết bị

  @IsNotEmpty()
  @IsOptional()
  activityDetail?: string; // Chi tiết hoạt động

  @IsObject()
  @IsOptional()
  changes?: {
    [key: string]: {
      is_need_trans: string;
      new_attribute: string;
      old_attribute: string;
    };
  };
}
