import { IsArray, IsNotEmpty } from 'class-validator';

export class DeleteCvDto {
  @IsNotEmpty()
  @IsArray()
  ids: Array<string>;
}
