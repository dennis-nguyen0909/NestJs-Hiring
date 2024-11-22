import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsInt,
  Min,
  Max,
} from 'class-validator';

export class CreateSkillDto {
  @IsNotEmpty()
  user_id: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @Min(0)
  @Max(5)
  evalute?: number;

  @IsOptional()
  @IsString()
  description?: string;
}
