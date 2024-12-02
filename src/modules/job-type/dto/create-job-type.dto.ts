import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateJobTypeDto {
  @IsNotEmpty()
  @IsString()
  name: string;
  @IsOptional()
  key?: string;
  @IsOptional()
  description?: string;
}
