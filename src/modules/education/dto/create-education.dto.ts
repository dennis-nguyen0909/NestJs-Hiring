import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

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
  start_date: Date;

  @IsOptional()
  @IsOptional()
  end_date: Date;

  @IsOptional()
  currently_studying: boolean;
  @IsOptional()
  description: string;
}
