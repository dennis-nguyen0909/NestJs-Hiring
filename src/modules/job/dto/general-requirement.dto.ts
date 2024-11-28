import { IsArray, IsString, IsOptional } from 'class-validator';

export class ProfessionalSkillDTO {
  @IsString()
  title: string;

  @IsArray()
  @IsString({ each: true })
  items: string[];
}
