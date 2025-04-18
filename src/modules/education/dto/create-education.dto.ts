import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
} from 'class-validator';
import { IsEndDateAfterStartDate } from 'src/decorator/validate-date.decorator';

export class CreateEducationDto {
  @IsString()
  @IsNotEmpty()
  user_id: string;

  @IsString()
  @IsOptional()
  school: string;

  @IsString()
  @IsOptional()
  degree: string;

  @IsString()
  @IsOptional()
  major: string;

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
  currently_studying: boolean;

  @IsOptional()
  description: string;
}
