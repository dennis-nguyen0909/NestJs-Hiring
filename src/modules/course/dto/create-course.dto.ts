import { IsString, IsNotEmpty, IsOptional, IsMongoId, IsDateString } from 'class-validator';

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
  @IsNotEmpty()
  description: string;

  @IsOptional()
  @IsDateString()
  start_date?: Date;

  @IsOptional()
  @IsDateString()
  end_date?: Date;

  @IsOptional()
  @IsString()
  course_link?: string;

  @IsOptional()
  @IsString()
  course_image?: string;
}
