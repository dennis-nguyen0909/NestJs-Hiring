import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEmail,
  IsMongoId,
} from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsNotEmpty({ message: 'Id is required.' })
  @IsString()
  id: string; // Dùng 'id' thay vì '_id'

  // Các trường mà bạn muốn kiểm tra thêm validation có thể thêm ở đây (nếu cần)
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  full_name?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsOptional()
  @IsString()
  background?: string;

  // Các trường khác có thể được thêm vào đây nếu muốn
  @IsOptional()
  toggle_dashboard?: boolean;

  @IsOptional()
  toggle_filter?: boolean;
  @IsOptional()
  port_folio?: string;

  @IsOptional()
  introduce?: string;

  @IsOptional()
  @IsMongoId()
  city_id?: string;

  @IsOptional()
  @IsMongoId()
  district_id?: string;
  @IsOptional()
  @IsMongoId()
  ward_id?: string;
}
