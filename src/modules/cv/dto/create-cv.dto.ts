import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Education } from '../../education/schema/Education.schema';
import { WorkExperience } from '../../work-experience/schema/WorkExperience.schema';
import { Skill } from '../../skill/schema/Skill.schema';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCvDto {
  @ApiProperty({
    description: 'title of cv',
    example: 'Intern Frontend',
  })
  @IsString()
  @IsNotEmpty()
  title: string;
  @ApiProperty({
    description: 'User id',
    example: '1231231y',
  })
  @IsString()
  @IsNotEmpty()
  user_id: string;

  @IsString()
  personal_info: string;

  @IsArray()
  education: Education[];

  @IsArray()
  work_experience: WorkExperience[];

  @IsArray()
  @IsOptional()
  skills: Skill[];

  @IsArray()
  @IsString({ each: true })
  languages: string[];

  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  cv_url: string[];

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  file_name: string;
}
