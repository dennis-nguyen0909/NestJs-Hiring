import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateJobContractTypeDto {
  @IsNotEmpty()
  @IsString()
  name: string;
  @IsOptional()
  key?: string;
  @IsOptional()
  description?: string;
}
