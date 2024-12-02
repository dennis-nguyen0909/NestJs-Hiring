import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateLevelDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description: string;
  @IsOptional()
  @IsString()
  key?: string;
}
