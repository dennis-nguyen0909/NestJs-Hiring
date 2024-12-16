import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateEducationDto {
  @IsString()
  @IsNotEmpty()
  user_id: string;

  @IsString()
  @IsNotEmpty()
  school: string;

  @IsString()
  @IsOptional()
  degree: string;

  @IsString()
  @IsNotEmpty()
  major: string;

  @IsNotEmpty()
  start_date: Date;

  @IsNotEmpty()
  @IsOptional()
  end_date: Date;

  @IsOptional()
  currently_studying: boolean;
  @IsOptional()
  description: string;
}
