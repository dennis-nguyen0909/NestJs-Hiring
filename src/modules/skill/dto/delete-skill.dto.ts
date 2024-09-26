import { IsArray, IsNotEmpty } from 'class-validator';

export class DeleteSkillDto {
  @IsArray()
  @IsNotEmpty()
  ids: Array<string>;
}
