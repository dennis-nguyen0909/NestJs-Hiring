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
  @IsNotEmpty()
  project_name: string;

  @IsString()
  @IsNotEmpty() // Tùy chọn
  customer_name?: string;

  @IsNumber()
  @IsNotEmpty()
  team_number?: number;

  @IsString()
  @IsNotEmpty()
  location?: string;

  @IsString()
  @IsNotEmpty()
  mission?: string;

  @IsString()
  @IsOptional()
  technology?: string;
  @IsNotEmpty()
  start_date?: Date;
  @IsNotEmpty()
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
