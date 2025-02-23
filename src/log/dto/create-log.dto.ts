import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsMongoId,
  IsObject,
} from 'class-validator';
import { Types } from 'mongoose';

export class CreateLogDto {
  @IsMongoId()
  @IsNotEmpty()
  userId: Types.ObjectId; // ID người dùng

  @IsString()
  @IsNotEmpty()
  action: string; // Hành động (VD: 'CREATE', 'UPDATE', 'DELETE')

  @IsString()
  @IsNotEmpty()
  entityId: string; // ID của entity bị thay đổi

  @IsString()
  @IsNotEmpty()
  entityCollection: string; // Tên collection mà entity nằm trong

  @IsString()
  @IsOptional()
  description?: string; // Mô tả thêm về hành động (có thể không bắt buộc)

  @IsObject()
  @IsOptional()
  changes?: {
    [key: string]: {
      is_need_trans: string;
      new_attribute: string;
      old_attribute: string;
    };
  }; // Thay đổi đã thực hiện (VD: các thuộc tính được cập nhật)

  @IsString()
  @IsOptional()
  ipAddress?: string; // Địa chỉ IP của người dùng

  @IsObject()
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
  }; // Thông tin thiết bị (hệ điều hành, thiết bị, trình duyệt)

  @IsString()
  @IsOptional()
  activityDetail?: string; // Chi tiết hoạt động
}
