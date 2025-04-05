// dto/create-certificate.dto.ts
import {
  IsNotEmpty,
  IsString,
  IsBoolean,
  IsOptional,
  IsDateString,
} from 'class-validator';
import { Types } from 'mongoose';

export class CreateCertificateDto {
  @IsNotEmpty()
  @IsString()
  certificate_name: string;

  @IsNotEmpty()
  @IsString()
  organization_name: string;

  @IsOptional()
  @IsDateString()
  start_date?: Date;

  @IsOptional()
  @IsDateString()
  end_date?: Date;

  @IsOptional()
  @IsBoolean()
  is_not_expired?: boolean;

  @IsOptional()
  @IsString()
  img_certificate?: string;

  @IsOptional()
  @IsString()
  link_certificate?: string;

  @IsNotEmpty()
  candidate_id: Types.ObjectId;
}
