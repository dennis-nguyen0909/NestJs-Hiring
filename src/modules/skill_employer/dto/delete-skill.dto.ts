import { IsArray, IsNotEmpty } from 'class-validator';

export class DeleteSkillEmployerDto {
  @IsArray()
  @IsNotEmpty()
  ids: Array<string>;
}
