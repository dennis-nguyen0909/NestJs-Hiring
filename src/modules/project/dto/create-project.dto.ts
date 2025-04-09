import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsMongoId,
  IsNumber,
} from 'class-validator';
import { Types } from 'mongoose';

export class CreateProjectDto {
  @IsMongoId()
  @IsNotEmpty()
  user_id: Types.ObjectId;

  @IsString()
  @IsOptional()
  project_name: string;

  @IsString()
  @IsOptional() // Tùy chọn
  customer_name?: string;

  @IsNumber()
  @IsOptional()
  team_number?: number;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  mission?: string;

  @IsString()
  @IsOptional()
  technology?: string;
  @IsOptional()
  start_date?: Date;
  @IsOptional()
  end_date?: Date;

  @IsString()
  @IsOptional()
  project_link?: string;

  @IsString()
  @IsOptional()
  project_image?: string;

  @IsString()
  @IsOptional()
  description?: string;
}
