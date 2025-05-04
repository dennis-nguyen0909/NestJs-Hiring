import { IsString, IsNumber, IsBoolean, IsOptional } from 'class-validator';

export class CreatePackageDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsNumber()
  price: number;

  @IsNumber()
  duration: number;

  @IsString()
  @IsOptional()
  durationType?: string;

  @IsNumber()
  @IsOptional()
  jobPostLimit?: number;

  @IsNumber()
  @IsOptional()
  jobDisplayDuration?: number;

  @IsNumber()
  @IsOptional()
  accessToResume?: number;

  @IsBoolean()
  @IsOptional()
  featuredJob?: boolean;

  @IsBoolean()
  @IsOptional()
  prioritySupport?: boolean;

  @IsBoolean()
  @IsOptional()
  directContact?: boolean;

  @IsBoolean()
  @IsOptional()
  jobRefresh?: boolean;

  @IsBoolean()
  @IsOptional()
  advancedReports?: boolean;
}
