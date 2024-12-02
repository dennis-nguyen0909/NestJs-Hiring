import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateDegreeTypeDto {
  @IsNotEmpty()
  @IsString()
  name: string;
  @IsOptional()
  key: string;
  @IsOptional()
  description?: string;
}
