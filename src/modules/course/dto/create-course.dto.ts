import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsMongoId,
  IsDateString,
} from 'class-validator';
import { IsEndDateAfterStartDate } from 'src/decorator/validate-date.decorator';

export class CreateCourseDto {
  @IsMongoId()
  @IsNotEmpty()
  user_id: string;

  @IsString()
  @IsNotEmpty()
  course_name: string;
  @IsString()
  @IsNotEmpty()
  organization_name: string;
  @IsString()
  @IsOptional()
  description?: string;

  @IsOptional()
  @IsDateString()
  start_date: Date;

  @IsOptional()
  @IsDateString()
  @IsEndDateAfterStartDate('start_date', {
    message: 'end_date_must_be_bigger_than_start_date',
  })
  end_date: Date;

  @IsOptional()
  @IsString()
  course_link?: string;

  @IsOptional()
  @IsString()
  course_image?: string;
}
