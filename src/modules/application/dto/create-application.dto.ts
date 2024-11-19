import {
  IsString,
  IsEnum,
  IsDate,
  IsOptional,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { Types } from 'mongoose';

export class CreateApplicationDto {
  @ApiProperty({
    type: String,
    description: 'The ID of the user',
    example: '60c72b2f9b1e8b001c8e4a10',
  })
  @IsString()
  @IsNotEmpty()
  user_id: string;

  @ApiProperty({
    type: String,
    description: 'The ID of the job',
    example: '60c72b2f9b1e8b001c8e4a11',
  })
  @IsString()
  @IsNotEmpty()
  job_id: string;

  @ApiProperty({
    type: String,
    description: 'The ID of the employer',
    example: '60c72b2f9b1e8b001c8e4a12',
  })
  @IsString()
  @IsNotEmpty()
  employer_id: string;

  @ApiProperty({
    type: String,
    description: 'The ID of the CV',
    example: '60c72b2f9b1e8b001c8e4a13',
  })
  @IsString()
  @IsNotEmpty()
  cv_id: string;

  @ApiProperty({
    description: 'The cover letter for the application',
    example: 'This is my cover letter.',
  })
  @IsString()
  @IsNotEmpty()
  cover_letter: string;

  @ApiProperty({
    type: Date,
    description: 'The date when the application was submitted',
    example: '2023-09-28T10:00:00Z',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  applied_date?: Date;

  @ApiProperty({
    description: 'The status of the application',
    enum: ['pending', 'accepted', 'rejected'],
    example: 'pending',
  })
  @IsString()
  @IsEnum(['pending', 'accepted', 'rejected'])
  status: string;

  @IsOptional()
  save_candidates: Types.ObjectId[];
}
