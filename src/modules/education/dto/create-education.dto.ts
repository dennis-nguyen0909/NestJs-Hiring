import { IsString, IsNotEmpty, IsDateString } from 'class-validator';

export class CreateEducationDto {
  @IsString()
  @IsNotEmpty()
  school: string;

  @IsString()
  @IsNotEmpty()
  degree: string;

  @IsString()
  @IsNotEmpty()
  major: string;

  @IsNotEmpty()
  start_date: Date;

  @IsNotEmpty()
  end_date: Date;
}
