import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsMongoId,
  IsObject,
  isNotEmpty,
  IsEnum,
} from 'class-validator';
import { Request } from 'express';
import { Types } from 'mongoose';

export class CreateLogDto {
  @IsMongoId()
  @IsNotEmpty()
  userId: Types.ObjectId; // ID người dùng

  @IsEnum([
    'CREATE',
    'UPDATE',
    'DELETE',
    'APPLY',
    'SAVE',
    'REJECT',
    'CANCEL',
    'UNFAVORITE',
    'FAVORITE',
    'View',
    'DELETE_CV',
    'UPLOAD_CV',
  ])
  @IsNotEmpty()
  action:
    | 'CREATE'
    | 'UPDATE'
    | 'DELETE'
    | 'APPLY'
    | 'SAVE'
    | 'REJECT'
    | 'CANCEL'
    | 'UNFAVORITE'
    | 'FAVORITE'
    | 'View'
    | 'DELETE_CV'
    | 'UPLOAD_CV'; // Hành động (VD: 'CREATE', 'UPDATE', 'DELETE')

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
      new: string | Types.ObjectId;
      old: string | Types.ObjectId;
    };
  }; // Thay đổi đã thực hiện (VD: các thuộc tính được cập nhật)

  @IsObject()
  @IsOptional()
  changesLink?: {
    link: string;
    name: string;
  };
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

  @IsNotEmpty()
  @IsOptional()
  activityDetail?: string; // Chi tiết hoạt động

  @IsOptional()
  @IsString()
  entityName: string;

  @IsNotEmpty()
  req: Request;
}
