import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsMongoId,
  IsNumber,
  IsDateString,
} from 'class-validator';
import { Types } from 'mongoose';
import { IsEndDateAfterStartDate } from 'src/decorator/validate-date.decorator';

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
  @IsDateString()
  start_date: Date;

  @IsOptional()
  @IsDateString()
  @IsEndDateAfterStartDate('start_date', {
    message: 'end_date_must_be_bigger_than_start_date',
  })
  end_date: Date;

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
