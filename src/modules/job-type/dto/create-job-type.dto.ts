import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateJobTypeDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  key: string;
  // eslint-disable-next-line prettier/prettier

@IsOptional()
  description?: string;
}
