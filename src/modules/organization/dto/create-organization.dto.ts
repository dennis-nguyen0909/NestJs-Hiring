import { Prop } from '@nestjs/mongoose';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUrl,
  IsInt,
  Min,
} from 'class-validator';

export class CreateOrganizationDto {
  @IsNotEmpty()
  @IsString()
  owner: string; // ID của người dùng sở hữu tổ chức (sử dụng ObjectId)

  @IsOptional()
  @IsString()
  industry_type?: string; // Loại ngành nghề của tổ chức

  @IsOptional()
  organization_type: string;
  @IsOptional()
  year_of_establishment?: string; // Năm thành lập tổ chức

  @IsOptional()
  @IsString()
  team_size?: string; // Quy mô đội ngũ

  @IsOptional()
  @IsUrl()
  company_website?: string; // Website của tổ chức

  // @IsNotEmpty()
  @IsString()
  company_vision?: string; // Tầm nhìn của tổ chức

  @IsOptional()
  @IsString()
  social_facebook?: string; // Liên kết Facebook của tổ chức

  @IsOptional()
  @IsString()
  social_instagram?: string; // Liên kết Instagram của tổ chức

  @IsOptional()
  @IsString()
  social_linkedin?: string; // Liên kết LinkedIn của tổ chức

  @IsOptional()
  @IsString()
  social_twitter?: string; // Liên kết Twitter của tổ chức

  @IsOptional()
  @IsString()
  social_youtube?: string; // Liên kết YouTube của tổ chức
}
