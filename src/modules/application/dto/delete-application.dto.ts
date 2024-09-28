import { IsArray, IsNotEmpty } from 'class-validator';

export class DeleteApplicationDto {
  @IsArray()
  @IsNotEmpty()
  ids: Array<string>;
}
